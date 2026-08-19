import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(password: string) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminPassword && !adminPasswordHash) {
      throw new UnauthorizedException('Authentication is not configured');
    }

    let valid = false;

    if (adminPasswordHash) {
      valid = await bcrypt.compare(password, adminPasswordHash);
    } else if (adminPassword) {
      valid = password === adminPassword;
    }

    if (!valid) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { sub: 'admin' };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  validateToken(payload: { sub: string }) {
    return payload.sub === 'admin';
  }
}
