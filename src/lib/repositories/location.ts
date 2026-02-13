import { BaseRepository } from './base';

export interface CreateLocationInput {
  name: string;
  type?: 'WAREHOUSE' | 'STORE' | 'VIRTUAL';
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  isPrimary?: boolean;
}

export interface UpdateLocationInput {
  name?: string;
  type?: 'WAREHOUSE' | 'STORE' | 'VIRTUAL';
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export class LocationRepository extends BaseRepository {
  async findAll(options?: { includeInactive?: boolean }) {
    return this.executeWithPrisma(async (prisma) => {
      const where: any = { ...this.whereTenant };

      if (!options?.includeInactive) {
        where.isActive = true;
        where.deletedAt = null;
      }

      return prisma.location.findMany({
        where,
        orderBy: { createdAt: 'asc' },
      });
    });
  }

  async findById(id: string) {
    return this.executeWithPrisma(async (prisma) => {
      return prisma.location.findFirst({
        where: { id, ...this.whereTenant },
        include: {
          stockLevels: {
            include: { product: true },
            where: { product: { isActive: true, deletedAt: null } },
          },
        },
      });
    });
  }

  async findPrimary() {
    return this.executeWithPrisma(async (prisma) => {
      return prisma.location.findFirst({
        where: {
          ...this.whereTenant,
          isPrimary: true,
          isActive: true,
          deletedAt: null,
        },
      });
    });
  }

  async create(input: CreateLocationInput) {
    return this.executeTransaction(async (tx) => {
      if (input.isPrimary) {
        await tx.location.updateMany({
          where: { ...this.whereTenant, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      return tx.location.create({
        data: {
          ...this.whereTenant,
          ...input,
          type: input.type || 'WAREHOUSE',
          isPrimary: input.isPrimary || false,
        },
      });
    });
  }

  async update(id: string, input: UpdateLocationInput) {
    return this.executeTransaction(async (tx) => {
      if (input.isPrimary) {
        await tx.location.updateMany({
          where: {
            ...this.whereTenant,
            isPrimary: true,
            id: { not: id },
          },
          data: { isPrimary: false },
        });
      }

      const result = await tx.location.updateMany({
        where: { id, ...this.whereTenant },
        data: input,
      });

      if (result.count === 0) {
        throw new Error('LOCATION_NOT_FOUND');
      }

      return this.findById(id);
    });
  }

  async softDelete(id: string) {
    return this.executeWithPrisma(async (prisma) => {
      const result = await prisma.location.updateMany({
        where: { id, ...this.whereTenant },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      });

      if (result.count === 0) {
        throw new Error('LOCATION_NOT_FOUND');
      }

      return true;
    });
  }

  async delete(id: string) {
    return this.executeWithPrisma(async (prisma) => {
      const result = await prisma.location.deleteMany({
        where: { id, ...this.whereTenant },
      });

      if (result.count === 0) {
        throw new Error('LOCATION_NOT_FOUND');
      }

      return true;
    });
  }

  async getProductCount(locationId: string) {
    return this.executeWithPrisma(async (prisma) => {
      return prisma.stockLevel.count({
        where: {
          tenantId: this.tenantId,
          locationId: locationId === 'all' ? undefined : locationId,
          product: { isActive: true, deletedAt: null },
        },
      });
    });
  }

  async getTotalStockValue(locationId?: string) {
    return this.executeWithPrisma(async (prisma) => {
      const result = await prisma.stockLevel.aggregate({
        where: {
          tenantId: this.tenantId,
          ...(locationId && { locationId }),
          product: { isActive: true, deletedAt: null },
        },
        _sum: {
          quantity: true,
        },
      });

      const stockLevels = await prisma.stockLevel.findMany({
        where: {
          tenantId: this.tenantId,
          ...(locationId && { locationId }),
          product: { isActive: true, deletedAt: null },
        },
        include: {
          product: true,
        },
      });

      const totalValue = stockLevels.reduce((sum: number, sl: any) => {
        return sum + sl.quantity * sl.product.unitCost.toNumber();
      }, 0);

      return {
        totalProducts: result._sum.quantity || 0,
        totalValue,
      };
    });
  }
}
