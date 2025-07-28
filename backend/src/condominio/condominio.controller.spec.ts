import { Test, TestingModule } from '@nestjs/testing';
import { CondominioController } from './condominio.controller';
import { CondominioService } from './condominio.service';

describe('CondominioController', () => {
  let controller: CondominioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CondominioController],
      providers: [CondominioService],
    }).compile();

    controller = module.get<CondominioController>(CondominioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
