import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class LoginDto {
  @IsNumberString({ no_symbols: true })
  message: string;
  @IsString()
  @IsNotEmpty()
  signature: string;
}
export class LoginResponseDto {
  token: string;
}
