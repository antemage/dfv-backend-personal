import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ObjectCannedACL } from '@aws-sdk/client-s3';
import { S3 } from 'aws-sdk';
import { uuid } from 'uuidv4';

@Injectable()
export class S3Service implements StorageService {
  private s3: S3;
  constructor() {
  this.s3 = new S3({
    region: process.env.AMAZON_BUCKET_REGION,
    endpoint: process.env.AMAZON_BUCKET_ENDPOINT, 
    s3ForcePathStyle: true,
    credentials: {
      accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
      secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY,
    },
  });
}
  async uploadFile(
    key: string,
    dataBuffer: Buffer,
    access: ObjectCannedACL = ObjectCannedACL.public_read,
  ) {
    try {
      const params = {
        Bucket: process.env.AMAZON_BUCKET_NAME,
        Key: key,
        Body: dataBuffer,
        ACL: access,
        ContentDisposition: 'inline',
      };
      return await this.s3.upload(params).promise();
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException("Couldn't upload file");
    }
  }
  async deleteFile(key: string) {
    try {
      const params = {
        Bucket: process.env.AMAZON_BUCKET_NAME,
        Key: key,
      };
      return await this.s3.deleteObject(params).promise();
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException("Couldn't delete file");
    }
  }

  async deleteFiles(files: string[] = []) {
    try {
      const deleteParam = {
        Bucket: process.env.AMAZON_BUCKET_NAME,
        Delete: {
          Objects: files.map((key) => ({ Key: key })),
        },
      };
      await this.s3.deleteObjects(deleteParam).promise();
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException("Couldn't delete file");
    }
  }

  async uploadFiles(files: Buffer[] = [], prefix = ''): Promise<string[]> {
    const uploadedFiles = [];
    try {
      for (const file of files) {
        let name = prefix + uuid() + '.jpg';
        if (process.env.NODE_ENV === 'development') name = 'dev-' + name;
        const uploadedFile = await this.uploadFile(name, file);
        uploadedFiles.push(uploadedFile.Key);
      }
      return uploadedFiles;
    } catch (err) {
      await this.deleteFiles(uploadedFiles);
      throw new InternalServerErrorException("Couldn't upload files");
    }
  }

  async getSignedUrl(key: string, expire: number) {
    try {
      const params = {
        Bucket: process.env.AMAZON_BUCKET_NAME,
        Key: key,
        Expires: expire,
      };
      return await this.s3.getSignedUrlPromise('getObject', params);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException("Couldn't get signed url");
    }
  }
}
