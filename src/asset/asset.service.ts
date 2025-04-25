import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { StorageService } from 'storage/storage.service';
import { ObjectCannedACL } from '@aws-sdk/client-s3';
import { InjectModel } from '@nestjs/mongoose';
import { Asset, AssetDocument, AssetSchema } from './schema/asset.schema';
import { Model } from 'mongoose';

@Injectable()
export class AssetService {
  private bucketName = process.env.AMAZON_BUCKET_NAME;
  constructor(
    @InjectModel(Asset.name) private assetModel: Model<AssetDocument>,
    private storageService: StorageService,
  ) {}

  async storeAssetImage(
    file: Express.Multer.File,
    address: string,
  ): Promise<{ message: string; data: AssetDocument }> {
    try {
      if (!file) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      if (!address) {
        throw new HttpException('Address is required', HttpStatus.BAD_REQUEST);
      }

      const fileKey = `uploads/${uuidv4()}${extname(file.originalname)}`;

      const fileURL = `https://${this.bucketName}.blr1.digitaloceanspaces.com/${fileKey}`;

      await this.storageService.uploadFile(
        fileKey,
        file.buffer,
        ObjectCannedACL.public_read,
      );

      const updatedAsset = await this.assetModel.findOneAndUpdate(
        { address },
        { fileURL },
        { upsert: true, new: true },
      );

      console.log('updatedAsset', updatedAsset);

      return {
        message: 'File uploaded successfully',
        data: updatedAsset,
      };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAssetImage(
    address: string,
  ): Promise<{ message: string; data: AssetDocument }> {
    try {
      if (!address) {
        throw new HttpException('Address is required', HttpStatus.BAD_REQUEST);
      }

      const assetDoc = await this.assetModel.findOne({ address }).lean();

      if (!assetDoc) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      return {
        message: 'File found',
        data: assetDoc,
      };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
