/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { FundModule } from './fund/fund.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FmbioModule } from './fmbio/fmbio.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AssetModule } from './asset/asset.module';



@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
      global: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    FundModule,
    FmbioModule,
    AuthModule,
    AssetModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
