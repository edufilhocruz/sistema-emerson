import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData(@Query('mes') mes?: string, @Query('ano') ano?: string, @Query('periodo') periodo?: string) {
    return this.dashboardService.getDashboardData(mes, ano, periodo);
  }

  @Get('condominios-pendentes')
  async getCondominiosPendentes(@Query('mes') mes?: string, @Query('ano') ano?: string) {
    return this.dashboardService.getCondominiosPendentes(mes, ano);
  }

  @Get('cobrancas-enviadas-por-condominio')
  async getCobrancasEnviadasPorCondominio(@Query('mes') mes?: string, @Query('ano') ano?: string) {
    return this.dashboardService.getCobrancasEnviadasPorCondominio(mes, ano);
  }
} 