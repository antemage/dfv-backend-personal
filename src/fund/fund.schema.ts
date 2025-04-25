/* eslint-disable prettier/prettier */
import { Optional } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
class FundManager {
  @Prop()
  fmaddress: string | null;
  @Prop({ type: Object })
  fees: {
    managementFees: string | null;
    performanceFees: string | null;
  };
  @Prop({ type: Object })
  feeSharesEarned: {
    totalFmShares: string | null;
  };
  @Prop()
  investorsCount: number | null;
  @Prop()
  sharesSupply: number | null;
  @Prop()
  timestamp: number | null;
}
const FundManagerSchema = SchemaFactory.createForClass(FundManager);

@Schema()
export class Fund {
  
  @Prop()
  comptrollerProxy: string;

  @Prop()
  owner: string;

  @Prop()
  vaultProxy: string;

  @Prop()
  fundName: string;

  @Prop()
  date: number;

  @Prop()
  sharePrice: string;

  @Prop({ type: FundManagerSchema })
  @Optional()
  fmdetails: FundManager;

  @Prop()
  @Optional()
  fundLogo: string;

  @Prop()
  @Optional()
  portfolioTicker: string;

  @Prop()
  @Optional()
  tags: string[];

  @Prop()
  @Optional()
  portfolioInfo: string;

  @Prop()
  @Optional()
  tokenProxy: string;

  @Prop({ default: false })
  isDisabled: boolean;
}

export type FundDocument = HydratedDocument<Fund>;
export const FundSchema = SchemaFactory.createForClass(Fund);
