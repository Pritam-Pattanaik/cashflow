import { IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { SiteStatus } from '@prisma/client';

export class UpdateSiteDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  location?: string;

  @IsOptional()
  @IsString()
  supervisorId?: string;

  @IsOptional()
  @IsEnum(SiteStatus)
  status?: SiteStatus;
}
