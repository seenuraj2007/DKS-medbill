import { prisma } from '../prisma';
import type { PrismaClient } from '../../../prisma/generated/client';

type PrismaClientType = PrismaClient;

export class BaseRepository {
  protected tenantId: string;
  protected userId: string;

  constructor(tenantId: string, userId?: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    this.tenantId = tenantId;
    this.userId = userId || 'system';
  }

  protected get prisma() {
    return prisma;
  }

  protected get whereTenant() {
    return { tenantId: this.tenantId };
  }

  protected get whereTenantWithUser() {
    return {
      ...this.whereTenant,
      userId: this.userId,
    };
  }

  protected async executeWithPrisma<T>(callback: (prisma: PrismaClientType) => Promise<T>): Promise<T> {
    try {
      return await callback(prisma as PrismaClientType);
    } catch (error) {
      console.error(`Repository error [tenant: ${this.tenantId}]:`, error);
      throw error;
    }
  }

  protected async executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return await prisma.$transaction(callback);
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }
}
