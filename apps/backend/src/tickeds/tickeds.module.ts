import { Module } from '@nestjs/common';
import { TickedsService } from './tickeds.service';
import { TickedsController } from './tickeds.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  controllers: [TickedsController],
  providers: [TickedsService],
  imports: [PrismaModule, NotificationsModule],
})
export class TickedsModule {}
