import { Module } from '@nestjs/common';
import { CashDispatchController } from './cash-dispatch.controller';
import { CashDispatchService } from './cash-dispatch.service';

@Module({
  controllers: [CashDispatchController],
  providers: [CashDispatchService],
  exports: [CashDispatchService],
})
export class CashDispatchModule {}
