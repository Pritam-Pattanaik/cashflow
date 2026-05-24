import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { CashReceiptService } from './cash-receipt.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('receipts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CashReceiptController {
  constructor(private service: CashReceiptService) {}

  @Post()
  @Roles(Role.SUPERVISOR)
  confirm(@Body() dto: CreateReceiptDto, @CurrentUser('sub') userId: string) {
    return this.service.confirmReceipt(dto, userId);
  }

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.service.findAll(query);
  }
}
