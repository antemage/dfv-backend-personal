import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FmbioModule } from '../fmbio/fmbio.module';

@Module({
  imports: [FmbioModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
