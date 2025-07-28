import { Test, TestingModule } from '@nestjs/testing';
import { CondominioService } from './condominio.service';

describe('CondominioService', () => {
  let service: CondominioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CondominioService],
    }).compile();

    service = module.get<CondominioService>(CondominioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
