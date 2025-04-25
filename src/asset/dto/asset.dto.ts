import { ApiProperty } from "@nestjs/swagger";

export class CreateAssetPayloadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
  @ApiProperty()
  address: string;
}