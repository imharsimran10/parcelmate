import { Module } from '@nestjs/common';
import { ParcelsController } from './parcels.controller';
import { ParcelsService } from './parcels.service';
import { DeliveryService } from './delivery.service';
import { PaymentService } from './payment.service';

@Module({
  controllers: [ParcelsController],
  providers: [ParcelsService, DeliveryService, PaymentService],
  exports: [ParcelsService, DeliveryService, PaymentService],
})
export class ParcelsModule {}
