/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { FmbioController } from './fmbio.controller';
import { FmbioService } from './fmbio.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FmbioSchema } from './fmbio.schema';
@Module({
  imports: [MongooseModule.forFeature([{ name: 'Fmbio', schema: FmbioSchema }])],
  controllers: [FmbioController],
  providers: [FmbioService],
  exports: [FmbioService]
})
export class FmbioModule {}
