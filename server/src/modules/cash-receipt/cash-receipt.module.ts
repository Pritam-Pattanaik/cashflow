import { Module } from '@nestjs/common';
import { CashReceiptController } from './cash-receipt.controller';
import { CashReceiptService } from './cash-receipt.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [CashReceiptController],
  providers: [CashReceiptService],
  exports: [CashReceiptService],
})
export class CashReceiptModule {}
