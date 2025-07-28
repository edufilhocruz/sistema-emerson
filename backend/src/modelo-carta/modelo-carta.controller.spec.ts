import { Test, TestingModule } from '@nestjs/testing';
import { ModeloCartaController } from './modelo-carta.controller';
import { ModeloCartaService } from './modelo-carta.service';

describe('ModeloCartaController', () => {
  let controller: ModeloCartaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModeloCartaController],
      providers: [ModeloCartaService],
    }).compile();

    controller = module.get<ModeloCartaController>(ModeloCartaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
