import { Module } from '@nestjs/common';
import { TickedsService } from './tickeds.service';
import { TickedsController } from './tickeds.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [TickedsController],
  providers: [TickedsService],
  imports: [PrismaModule, NotificationsModule, CommonModule],
})
export class TickedsModule {}
