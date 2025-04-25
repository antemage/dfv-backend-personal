import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { S3Service } from './s3.service';

@Module({
  providers: [{ provide: StorageService, useClass: S3Service }],
  exports: [StorageService],
})
export class StorageModule {}
