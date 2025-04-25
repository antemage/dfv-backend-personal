/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Request,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FundService } from './fund.service';
import { AuthGuard } from '../auth/auth.guard';
import { FundDetailsPayloadType } from '../auth/auth.type';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreateFundUploadPayloadDto,
  UpdateFundUploadPayloadDto,
} from './fund.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { extname } from 'path';
import { memoryStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from 'utils/ApiResponse';

export const multerOptions: MulterOptions = {
  // Enable file size limits
  limits: {
    fileSize: 3145728, //+ process.env.MAX_FILE_SIZE,
  },
  // Check the mimetypes to allow for upload
  fileFilter: (_req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      // Allow storage of file
      file.filename = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, true);
    } else {
      // Reject file
      cb(
        new HttpException(
          `Unsupported file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
  // Storage properties
  storage: memoryStorage(),
};
@Controller('fund')
export class FundController {
  constructor(private readonly fundService: FundService) {}

  @Get('getFunds')
  async getSharePrices(
    @Query('pageSize') pageSize: number,
    @Query('pageNo') pageNo: number,
    @Query('sortBy') sortBy: string,
    @Query('orderBy') orderBy: string,
    @Query('search') search: string,
  ) {
    return await this.fundService.getFunds(
      pageSize,
      pageNo,
      search,
      sortBy,
      orderBy,
    );
  }

  @Get('getFunds/all')
  async getAllFunds() {
    return await this.fundService.getAllFunds();
  }

  @Get('getFundsByFMAddress')
  async getSharePricesByF(@Query('fmAddress') fmAddress: string) {
    return await this.fundService.getFundsByFmAddress(fmAddress);
  }

  @Get('getFundsByCompAddress')
  async getSharePricesByComp(
    @Query('comptrollerAddress') comptrollerAddress: string,
  ) {
    return this.fundService.getFundsByCompAddress(comptrollerAddress);
  }

  @Post('upsert')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiConsumes('multipart/form-data')
  async upsert(
    @UploadedFile() file: Express.Multer.File,
    @Body() formData: CreateFundUploadPayloadDto | UpdateFundUploadPayloadDto,
  ) {
    return await this.fundService.upsertFundDetails(file, formData);
  }

  // @UseGuards(AuthGuard)
  // @Post('create')
  // @UseInterceptors(FileInterceptor('file', multerOptions))
  // @ApiConsumes('multipart/form-data')
  // async create(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() formData?: CreateFundUploadPayloadDto,
  // ) {
  //   return await this.fundService.createFundDetails(file, formData);
  // }

  // // @UseGuards(AuthGuard)
  // @Post('update')
  // @UseInterceptors(FileInterceptor('file', multerOptions))
  // @ApiConsumes('multipart/form-data')
  // async update(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() formData?: UpdateFundUploadPayloadDto,
  // ) {
  //   return await this.fundService.updateFundDetails(file, formData);
  // }

  @Get('totalAUM')
  async totalAUM(): Promise<ApiResponse> {
    return await this.fundService.getTotalAUM();
  }
}
