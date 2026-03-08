import { INestApplication, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // Prisma 5.0+ no longer supports $on('beforeExit') with library engine
    // Instead, use Node.js process events for graceful shutdown
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
