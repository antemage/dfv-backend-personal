import { Module } from '@nestjs/common';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetSchema } from './schema/asset.schema';
import { StorageModule } from 'storage/storage.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Asset', schema: AssetSchema }]),
      StorageModule],
  controllers: [AssetController],
  providers: [AssetService]
})
export class AssetModule {}
