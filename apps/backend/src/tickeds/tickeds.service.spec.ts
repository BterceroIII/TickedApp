import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { TickedsService } from './tickeds.service';

describe('TickedsService', () => {
  let service: TickedsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TickedsService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: NotificationsService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TickedsService>(TickedsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
