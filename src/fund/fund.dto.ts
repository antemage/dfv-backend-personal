import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateFundUploadPayloadDto{
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
  @ApiProperty()
  portfolioName: string;
  @ApiProperty()
  portfolioTicker: string;
  @ApiProperty()
  owner: string;
  @ApiProperty()
  portfolioInfo: string;
  @ApiProperty()
  comptrollerProxy: string;
  @ApiProperty()
  vaultProxy: string;
  @ApiProperty()
  tokenProxy: string;
}

export class UpdateFundUploadPayloadDto {

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  file?: any;
  @ApiProperty()
  @IsOptional()
  portfolioName?: string;
  @ApiProperty()
  @IsOptional()
  portfolioTicker?: string;
  @ApiProperty()
  @IsOptional()
  owner?: string;
  @ApiProperty()
  @IsOptional()
  portfolioInfo?: string;
  @ApiProperty()
  @IsOptional()
  comptrollerProxy?: string;
  @ApiProperty()
  @IsOptional()
  vaultProxy?: string;
  @ApiProperty()
  @IsOptional()
  tokenProxy?: string;
}
