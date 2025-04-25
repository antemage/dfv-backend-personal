/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Query, UseGuards, Req,
} from '@nestjs/common';
import { FmbioService } from './fmbio.service';
import { AuthGuard } from '../auth/auth.guard';
import{FmbioAuthPayloadType} from '../auth/auth.type';

@Controller("fmbio")
export class FmbioController {
  constructor(private readonly fmbioService: FmbioService) { }

  @Get("/")
  async getFMDetailsByAddress(
    @Query("address") address:string
  ) {
    return await this.fmbioService.getFmBio(address);
  }

  @UseGuards(AuthGuard)
  @Post("createOrUpdateFmbio")
  async createOrUpdateFmbio(
    @Req() request: FmbioAuthPayloadType
  ) {
    const { address, name, bio } = request;
    return await this.fmbioService.createOrUpdateFmBio(address, name, bio);
  }
}
