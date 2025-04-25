import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { verifyMessage } from 'ethers';
import { FmbioService } from '../fmbio/fmbio.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly fmbioService: FmbioService,
    private readonly jwtService: JwtService,
  ) {}
  async login(loginDto: LoginDto) {
    const signerAddr = verifyMessage(loginDto.message, loginDto.signature);
    if (Date.now() - parseInt(loginDto.message) > 300000) {
      // 5 minutes
      throw new BadRequestException('Signature expired');
    }

    if (!(await this.fmbioService.getFmBio(signerAddr))) {
      throw new BadRequestException('FmBio not found');
    }
    return {
      token: await this.jwtService.signAsync({
        address: signerAddr,
      }),
    };
  }
}
