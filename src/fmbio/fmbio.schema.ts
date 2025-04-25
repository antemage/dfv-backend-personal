/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';


@Schema()
export class Fmbio {
  @Prop()
  address: string | null;

  @Prop()
  name: string | null;

  @Prop()
  bio: string | null;
}

export type FmbioDocument = HydratedDocument<Fmbio>;
export const FmbioSchema = SchemaFactory.createForClass(Fmbio);
