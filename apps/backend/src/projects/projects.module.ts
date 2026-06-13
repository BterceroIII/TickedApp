import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
