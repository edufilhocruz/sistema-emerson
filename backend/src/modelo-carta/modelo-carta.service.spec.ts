import { Test, TestingModule } from '@nestjs/testing';
import { ModeloCartaService } from './modelo-carta.service';

describe('ModeloCartaService', () => {
  let service: ModeloCartaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModeloCartaService],
    }).compile();

    service = module.get<ModeloCartaService>(ModeloCartaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
