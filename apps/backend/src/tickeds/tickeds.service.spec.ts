import { Test, TestingModule } from '@nestjs/testing';
import { TickedsService } from './tickeds.service';

describe('TickedsService', () => {
  let service: TickedsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TickedsService],
    }).compile();

    service = module.get<TickedsService>(TickedsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
