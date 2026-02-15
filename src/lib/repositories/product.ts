import { BaseRepository } from './base';
import { Product } from '../../../prisma/generated/client';

export interface CreateProductInput {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  unitCost?: number;
  sellingPrice?: number;
  category?: string;
  unit?: string;
  imageUrl?: string;
  imageKey?: string;
  supplierName?: string;
  supplierEmail?: string;
  supplierPhone?: string;
  isPerishable?: boolean;
  expiryDate?: Date | null;
  weightPerUnit?: number;
  minWeight?: number | null;
}

export interface UpdateProductInput {
  sku?: string;
  barcode?: string;
  name?: string;
  description?: string;
  unitCost?: number;
  sellingPrice?: number;
  category?: string;
  unit?: string;
  imageUrl?: string;
  imageKey?: string;
  supplierName?: string;
  supplierEmail?: string;
  supplierPhone?: string;
  isActive?: boolean;
  isPerishable?: boolean;
  expiryDate?: Date | null;
  weightPerUnit?: number;
  minWeight?: number | null;
}

export class ProductRepository extends BaseRepository {
  async findAll(options?: {
    includeInactive?: boolean;
    category?: string;
    search?: string;
    locationId?: string;
  }) {
    return this.executeWithPrisma(async (prisma) => {
      const where: any = { ...this.whereTenant };

      if (!options?.includeInactive) {
        where.isActive = true;
        where.deletedAt = null;
      }

      if (options?.category) {
        where.category = options.category;
      }

      if (options?.search) {
        where.OR = [
          { name: { contains: options.search, mode: 'insensitive' } },
          { sku: { contains: options.search, mode: 'insensitive' } },
          { barcode: { contains: options.search, mode: 'insensitive' } },
        ];
      }

      const products = await prisma.product.findMany({
        where,
        include: options?.locationId
          ? {
              stockLevels: {
                where: { locationId: options.locationId },
                include: { location: true },
              },
            }
          : undefined,
        orderBy: { createdAt: 'desc' },
      });

      return products.map(p => ({
        ...p,
        unitCost: p.unitCost.toNumber(),
        sellingPrice: p.sellingPrice.toNumber(),
      }));
    });
  }

  async findById(id: string) {
    return this.executeWithPrisma(async (prisma) => {
      const product = await prisma.product.findFirst({
        where: { id, ...this.whereTenant },
        include: {
          stockLevels: {
            include: { location: true },
          },
        },
      });

      if (!product) return null;

      return {
        ...product,
        unitCost: product.unitCost.toNumber(),
        sellingPrice: product.sellingPrice.toNumber(),
      };
    });
  }

  async findBySku(sku: string) {
    return this.executeWithPrisma(async (prisma) => {
      const product = await prisma.product.findFirst({
        where: { sku, ...this.whereTenant },
        include: {
          stockLevels: {
            include: { location: true },
          },
        },
      });

      if (!product) return null;

      return {
        ...product,
        unitCost: product.unitCost.toNumber(),
        sellingPrice: product.sellingPrice.toNumber(),
      };
    });
  }

  async findByBarcode(barcode: string) {
    return this.executeWithPrisma(async (prisma) => {
      const product = await prisma.product.findFirst({
        where: { barcode, ...this.whereTenant },
        include: {
          stockLevels: {
            include: { location: true },
          },
        },
      });

      if (!product) return null;

      return {
        ...product,
        unitCost: product.unitCost.toNumber(),
        sellingPrice: product.sellingPrice.toNumber(),
      };
    });
  }

  async create(input: CreateProductInput) {
    return this.executeWithPrisma(async (prisma) => {
      // Generate SKU if not provided (required field in schema)
      const sku = input.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const product = await prisma.product.create({
        data: {
          ...this.whereTenant,
          ...input,
          sku,
          unitCost: input.unitCost || 0,
          sellingPrice: input.sellingPrice || 0,
          unit: input.unit || 'unit',
        },
      });

      return {
        ...product,
        unitCost: product.unitCost.toNumber(),
        sellingPrice: product.sellingPrice.toNumber(),
      };
    });
  }

  async update(id: string, input: UpdateProductInput, expectedVersion: number) {
    return this.executeWithPrisma(async (prisma) => {
      const product = await prisma.product.updateMany({
        where: {
          id,
          ...this.whereTenant,
          version: expectedVersion,
        },
        data: {
          ...input,
          version: { increment: 1 },
        },
      });

      if (product.count === 0) {
        throw new Error('PRODUCT_CONFLICT: Product not found or version mismatch');
      }

      return this.findById(id);
    });
  }

  async softDelete(id: string) {
    return this.executeWithPrisma(async (prisma) => {
      const result = await prisma.product.updateMany({
        where: { id, ...this.whereTenant },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      });

      if (result.count === 0) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      return true;
    });
  }

  async delete(id: string) {
    return this.executeWithPrisma(async (prisma) => {
      const result = await prisma.product.deleteMany({
        where: { id, ...this.whereTenant },
      });

      if (result.count === 0) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      return true;
    });
  }

  async categories() {
    return this.executeWithPrisma(async (prisma) => {
      const products = await prisma.product.findMany({
        where: {
          ...this.whereTenant,
          isActive: true,
          category: { not: null },
        },
        select: { category: true },
        distinct: ['category'],
      });

      return products.map(p => p.category).filter(Boolean) as string[];
    });
  }

  async count(options?: { category?: string; search?: string }) {
    return this.executeWithPrisma(async (prisma) => {
      const where: any = {
        ...this.whereTenant,
        isActive: true,
        deletedAt: null,
      };

      if (options?.category) {
        where.category = options.category;
      }

      if (options?.search) {
        where.OR = [
          { name: { contains: options.search, mode: 'insensitive' } },
          { sku: { contains: options.search, mode: 'insensitive' } },
          { barcode: { contains: options.search, mode: 'insensitive' } },
        ];
      }

      return prisma.product.count({ where });
    });
  }
}
