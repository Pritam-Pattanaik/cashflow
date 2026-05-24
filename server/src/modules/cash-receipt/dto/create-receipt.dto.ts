import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateReceiptDto {
  @IsString()
  dispatchId: string;

  @IsNumber()
  @Min(0)
  receivedAmount: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
