import { Test, TestingModule } from '@nestjs/testing';
import { CobrancaController } from './cobranca.controller';
import { CobrancaService } from './cobranca.service';

describe('CobrancaController', () => {
  let controller: CobrancaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CobrancaController],
      providers: [CobrancaService],
    }).compile();

    controller = module.get<CobrancaController>(CobrancaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
