/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Fmbio,FmbioDocument } from './fmbio.schema'; 
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class FmbioService {
    constructor(@InjectModel(Fmbio.name) private fmbioModel: Model<FmbioDocument>) {
        
      }
      async getFmBio(address: string): Promise<Fmbio> {
        return await this.fmbioModel.findOne({address : address}).exec();
      }

      async createOrUpdateFmBio(
        address: string,
        name: string,
        bio: string
      ): Promise<Fmbio> {
        return await this.fmbioModel.findOneAndUpdate(
          { address },
          { address, name, bio },
          { upsert: true, new: true }
        ).exec();
      }
}