import { Module } from '@nestjs/common';
import { TickedsService } from './tickeds.service';
import { TickedsController } from './tickeds.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [TickedsController],
  providers: [TickedsService],
  imports: [PrismaModule],
})
export class TickedsModule {}
