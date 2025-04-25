import { Injectable } from '@nestjs/common';
import { ObjectCannedACL } from '@aws-sdk/client-s3';

@Injectable()
export abstract class StorageService {
  abstract uploadFile(
    filename: string,
    file: Buffer,
    access?: ObjectCannedACL,
  ): any;
  abstract uploadFiles(files: Buffer[], prefix: string): any;
  abstract deleteFile(filename: string): any;
  abstract deleteFiles(files: string[]): any;
  abstract getSignedUrl(
    filename: string,
    signedUrlExpireSeconds: number,
  ): Promise<string>;
}
