/* eslint-disable prettier/prettier */
import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { Fund, FundDocument } from './fund.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JsonRpcProvider, Contract } from 'ethers';
import { abi } from './abi/comptroller.abi.json';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  UpdateFundUploadPayloadDto,
  CreateFundUploadPayloadDto,
} from './fund.dto';
import { extname } from 'path';
import { StorageService } from '../../storage/storage.service';
import { ObjectCannedACL } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, createApiResponse } from 'utils/ApiResponse';
import { equal } from 'assert';

@Injectable()
export class FundService {
  private bucketName = process.env.AMAZON_BUCKET_NAME;
  provider: JsonRpcProvider;
  constructor(
    @InjectModel(Fund.name) private fundModel: Model<FundDocument>,
    private readonly storageService: StorageService,
  ) {
    this.provider = new JsonRpcProvider(process.env.RPC_URL);
  }

  async getSharePrice(proxy: string) {
    const compLogic = new Contract(proxy, abi, this.provider);
    const aumNetValue = await compLogic.getSharePrice();
    return aumNetValue;
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async fetchAndSaveFund() {
    console.log('fetching funds');
    const pageSize = 100;
    let skip = 0;
    let funds = [];
    const bulkOperations = [];
    while (true) {
      const query = `
          query MyQuery {
            funds(orderBy: timestamp, orderDirection: desc, first: ${pageSize}, skip: ${skip}) {
              comptrollerProxy
              owner
              vaultProxy
              fundName
              date
              fmdetails {
                fmaddress
                fees {
                  managementFees
                  performanceFees
                }
                feeSharesEarned {
                  totalFmShares
                }
                investorsCount
                sharesSupply
                timestamp
              }
            }
          }
        `;
      try {
        const response = await axios.post(
          process.env.GRAPH_URI as string,
          {
            query,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        const { data } = response.data;
        console.log(data);

        funds = [...funds, ...data.funds];

        if (funds.length < pageSize) {
          break;
        }

        skip += pageSize;
      } catch (error) {
        console.error('Error fetching data:', error);
        break;
      }
    }
    console.log('before for loop', funds.length);
    for (const fund of funds) {
      const sharePrice = await this.getSharePrice(fund.comptrollerProxy);
      fund.sharePrice = sharePrice;
      console.log('share price:', sharePrice, 'for fund:', fund.fundName);
      bulkOperations.push({
        updateOne: {
          filter: { comptrollerProxy: fund.comptrollerProxy },
          update: fund,
          upsert: true,
        },
      });
    }
    await this.fundModel.bulkWrite(bulkOperations);
    console.log('funds saved');
  }

  async getAllFunds() {
    try {
      const funds = await this.fundModel.find({ isDisabled: false });
      return funds;
    } catch (error) {
      throw new HttpException(error?.message || 'Error fetching funds', 500);
    }
  }

  async getFunds(
    pageSize: number,
    pageNo: number,
    search: string,
    sortBy: string = 'date',
    orderBy: string = '1',
  ) {
    const query = { isDisabled: false };
    const sort = {};
    if (search) {
      query['fundName'] = { $regex: search, $options: 'i' };
    }
    sort[sortBy] = orderBy === '1' ? 1 : -1;
    const count = await this.fundModel.countDocuments(query);
    const maxPage = Math.ceil(count / pageSize);

    const funds = await this.fundModel
      .find(query)
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (pageNo - 1));

    return {
      funds,
      pageNo,
      pageSize,
      maxPage,
    };
  }

  async getFundsByFmAddress(fmAddress: string) {
    const funds = await this.fundModel.find({
      'fmdetails.fmaddress': fmAddress,
      isDisabled: false,
    });
    return funds;
  }

  async getFundsByCompAddress(comptrollerAddress: string) {
    try {
      const fund = await this.fundModel.findOne({
        comptrollerProxy: comptrollerAddress,
      });
      if (!fund) {
        throw new NotFoundException('Fund not found');
      }
      return fund;
    } catch (error) {
      throw new NotFoundException('Fund not found');
    }
  }

  async upsertFundDetails(
    file: Express.Multer.File,
    formData: CreateFundUploadPayloadDto | UpdateFundUploadPayloadDto,
  ) {
    console.log(file, formData);
    
    const {
      portfolioName,
      portfolioTicker,
      owner,
      portfolioInfo,
      comptrollerProxy,
      vaultProxy,
      tokenProxy,
    } = formData;

    let fund = await this.fundModel.findOne({ comptrollerProxy });

    if (!fund) {
      fund = await this.fundModel.create({
        portfolioName,
        portfolioTicker,
        owner,
        portfolioInfo,
        comptrollerProxy,
        vaultProxy,
        tokenProxy,
      });
    } else {
      await this.fundModel.updateOne(
        { comptrollerProxy },
        {
          portfolioName,
          portfolioTicker,
          owner,
          portfolioInfo,
          comptrollerProxy,
          vaultProxy,
          tokenProxy,
        },
      );
    }

    if (file) {
      const fileKey = `funds/${uuidv4()}${extname(file.originalname)}`;
      const fundLogo = `https://${this.bucketName}.blr1.digitaloceanspaces.com/${fileKey}`;

      await this.storageService.uploadFile(
        fileKey,
        file.buffer,
        ObjectCannedACL.public_read,
      );

      await this.fundModel.updateOne(
        { comptrollerProxy },
        { fundLogo },
      );

      return { message: fund ? "Fund updated successfully" : "Fund created successfully", fundLogo };
    }

    return { message: fund ? "Fund updated successfully" : "Fund created successfully" };
  }

  async createFundDetails(
    file: Express.Multer.File,
    formData: CreateFundUploadPayloadDto,
  ) {
    console.log(file, formData);
    const {
      portfolioName,
      portfolioTicker,
      owner,
      portfolioInfo,
      comptrollerProxy,
      vaultProxy,
      tokenProxy,
    } = formData;
    const fund = await this.fundModel.findOne({ comptrollerProxy });
    if (fund) {
      throw new ConflictException('Fund already exists');
    }
    await this.fundModel.create({
      portfolioName,
      portfolioTicker,
      owner,
      portfolioInfo,
      comptrollerProxy,
      vaultProxy,
      tokenProxy,
    });
    if (file) {
      const fileKey = `funds/${uuidv4()}${extname(file.originalname)}`;

      const fundLogo = `https://${this.bucketName}.blr1.digitaloceanspaces.com/${fileKey}`;

      await this.storageService.uploadFile(
        fileKey,
        file.buffer,
        ObjectCannedACL.public_read,
      );

      await this.fundModel.updateOne(
        { comptrollerProxy },
        {
          fundLogo,
        },
      );

      // const fileUrl = await this.storageService.getSignedUrl(
      //   `${process.env.AMAZON_BUCKET_NAME}/${uuidv4()}${extname(file.filename)}`,
      //   60,
      // );
      return fundLogo;
    }
  }

  async updateFundDetails(
    file: Express.Multer.File,
    formData: UpdateFundUploadPayloadDto,
  ) {
    console.log(file, formData);
    const {
      portfolioName,
      portfolioTicker,
      owner,
      portfolioInfo,
      comptrollerProxy,
      vaultProxy,
      tokenProxy,
    } = formData;
    //update
    const fund = await this.fundModel.findOne({ comptrollerProxy });
    if (!fund) {
      throw new NotFoundException('Fund not found');
    }
    await this.fundModel.updateOne(
      { comptrollerProxy },
      {
        portfolioName,
        portfolioTicker,
        owner,
        portfolioInfo,
        comptrollerProxy,
        vaultProxy,
        tokenProxy,
      },
    );
    if (file) {
      const fileKey = `funds/${uuidv4()}${extname(file.originalname)}`;

      const fundLogo = `https://${this.bucketName}.blr1.digitaloceanspaces.com/${fileKey}`;

      await this.storageService.uploadFile(
        fileKey,
        file.buffer,
        ObjectCannedACL.public_read,
      );

      await this.fundModel.updateOne(
        { comptrollerProxy },
        {
          fundLogo,
        },
      );

      return fundLogo;
    }
  }

  async getTotalAUM(): Promise<ApiResponse> {
    try {
      const funds = await this.fundModel.find({
        isDisabled: false,
      });

      if (!funds?.length) {
        throw new NotFoundException('No funds found');
      }

      let totalAUM = BigInt(0);
      const scaleFactor = BigInt(10 ** 8);

      for (const fund of funds) {
        const sharePrice = BigInt(fund?.sharePrice || 0);
        const sharesSupply = BigInt(fund?.fmdetails?.sharesSupply || 0);
        totalAUM += (sharePrice * sharesSupply) / scaleFactor;
      }
      return createApiResponse('Total AUM fetched successfully', {
        data: { totalAUM: totalAUM.toString() },
      });
    } catch (error) {
      throw new HttpException(error?.message || 'Error fetching funds', 500);
    }
  }
}
