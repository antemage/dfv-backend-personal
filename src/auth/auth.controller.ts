import { Controller, HttpCode, Req } from '@nestjs/common';
import { Post, Body, Get, UseGuards } from '@nestjs/common';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @HttpCode(400)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Get('me') // example of a protected route
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async me(@Req() request: Request): Promise<{ address: string }> {
    return { address: request['address'] };
  }
}
