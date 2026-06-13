import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { id: string }) {
    const { id } = payload;

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, confirmed: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Token no válido');
    }

    if (!user.confirmed) {
      throw new UnauthorizedException('La cuenta no ha sido confirmada');
    }

    return user;
  }
}
