/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FundSchema } from './fund.schema';
import { FundService } from './fund.service';
import { FundController } from './fund.controller';
import { StorageModule } from '../../storage/storage.module';
@Module({
  imports: [MongooseModule.forFeature([{ name: 'Fund', schema: FundSchema }]),
    StorageModule],
  controllers: [FundController],
  providers: [FundService],

})
export class FundModule {}
