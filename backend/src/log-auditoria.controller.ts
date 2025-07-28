import { Controller, Get, Query } from '@nestjs/common';
import { LogAuditoriaService } from './log-auditoria.service';

@Controller('logs')
export class LogAuditoriaController {
  constructor(private readonly logAuditoriaService: LogAuditoriaService) {}

  @Get()
  async buscarTodos(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.logAuditoriaService.buscarTodos({ page: Number(page), limit: Number(limit) });
  }
} 