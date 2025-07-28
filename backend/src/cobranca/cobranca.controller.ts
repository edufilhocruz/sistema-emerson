import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CobrancaService } from './cobranca.service';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import { UpdateCobrancaDto } from './dto/update-cobranca.dto';

/**
 * CobrancaController
 * Responsável por expor os endpoints da API para o gerenciamento de cobranças.
 * Ele recebe as requisições HTTP, valida os dados de entrada usando DTOs
 * e delega a execução da lógica de negócio para o CobrancaService ou para a fila de trabalhos.
 */
@Controller('cobranca')
export class CobrancaController {
  constructor(
    private readonly cobrancaService: CobrancaService,
    @InjectQueue('import-cobranca') private readonly importQueue: Queue,
  ) {}

  /**
   * Endpoint para importar cobranças em massa a partir de uma planilha Excel.
   * Recebe o arquivo e os IDs dinâmicos e adiciona um trabalho à fila para processamento assíncrono.
   * @param file O arquivo .xlsx enviado no corpo da requisição.
   * @param condominioId O ID do condomínio ao qual as cobranças pertencem.
   * @param modeloCartaId O ID do modelo de carta a ser usado.
   */
  @Post('importar')
  @UseInterceptors(FileInterceptor('file'))
  async importFromXLSX(
    @UploadedFile() file: Express.Multer.File,
    @Body('condominioId') condominioId: string,
    @Body('modeloCartaId') modeloCartaId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    if (!condominioId || !modeloCartaId) {
      throw new BadRequestException(
        'IDs do condomínio e do modelo de carta são obrigatórios.',
      );
    }

    // Adiciona o trabalho à fila com todos os dados necessários para o processamento
    await this.importQueue.add('process-file', {
      fileBuffer: file.buffer,
      condominioId,
      modeloCartaId,
    });

    return {
      message:
        'Seu arquivo foi recebido e está sendo processado em segundo plano.',
    };
  }

  /**
   * Cria uma nova cobrança individual.
   * @param createCobrancaDto Os dados da nova cobrança.
   */
  @Post()
  async create(@Body() createCobrancaDto: CreateCobrancaDto) {
    console.log('Recebido para criar cobrança:', createCobrancaDto);
    const result = await this.cobrancaService.create(createCobrancaDto);
    console.log('Resultado da criação de cobrança:', result);
    return result;
  }

  /**
   * Retorna uma lista de todas as cobranças.
   */
  @Get()
  findAll() {
    return this.cobrancaService.findAll();
  }

  /**
   * Retorna o relatório de inadimplência (cobranças em atraso).
   */
  @Get('inadimplencia')
  async getInadimplencia(@Query('condominioId') condominioId?: string) {
    return this.cobrancaService.getInadimplencia(condominioId);
  }

  /**
   * Retorna o histórico de cobranças, com filtro opcional por condomínio e morador.
   */
  @Get('historico')
  async getHistorico(@Query('condominioId') condominioId?: string, @Query('moradorId') moradorId?: string) {
    return this.cobrancaService.getHistoricoCobrancas(condominioId, moradorId);
  }

  /**
   * Busca uma cobrança específica pelo seu ID.
   * @param id O UUID da cobrança.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cobrancaService.findOne(id);
  }

  /**
   * Atualiza o status de uma cobrança existente.
   * @param id O UUID da cobrança.
   * @param updateCobrancaDto O novo status da cobrança.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCobrancaDto: UpdateCobrancaDto,
  ) {
    return this.cobrancaService.update(id, updateCobrancaDto);
  }

  /**
   * Remove uma cobrança do sistema.
   * @param id O UUID da cobrança a ser removida.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cobrancaService.remove(id);
  }
}
