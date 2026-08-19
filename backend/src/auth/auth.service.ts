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
      throw new UnauthorizedException(
        'Sign-in is not configured on the server. Set ADMIN_PASSWORD and try again.',
      );
    }

    const trimmed = password?.trim() ?? '';
    if (!trimmed) {
      throw new UnauthorizedException('Please enter your password.');
    }

    let valid = false;

    if (adminPasswordHash) {
      valid = await bcrypt.compare(trimmed, adminPasswordHash);
    } else if (adminPassword) {
      valid = trimmed === adminPassword;
    }

    if (!valid) {
      throw new UnauthorizedException(
        'The password you entered is incorrect.',
      );
    }

    const payload = { sub: 'admin' };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  validateToken(payload: { sub: string }) {
    return payload.sub === 'admin';
  }
}
