import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AssetService } from './asset.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAssetPayloadDto } from './dto/asset.dto';
import { AssetDocument } from './schema/asset.schema';
import { AuthGuard } from 'src/auth/auth.guard';

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

@ApiTags('asset')
@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiConsumes('multipart/form-data')
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() assetData: CreateAssetPayloadDto,
  ): Promise<{ message: string; data: AssetDocument }> {
    return await this.assetService.storeAssetImage(file, assetData.address);
  }

  @Get('getAssetURL')
  async getSharePricesByComp(
    @Query('address') address: string,
  ): Promise<{ message: string; data: AssetDocument }> {
    return this.assetService.getAssetImage(address);
  }
}
