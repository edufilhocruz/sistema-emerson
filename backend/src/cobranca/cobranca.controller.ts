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
  HttpException,
  HttpStatus,
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
    console.log('=== INICIANDO CRIAÇÃO DE COBRANÇA ===');
    console.log('DTO recebido:', JSON.stringify(createCobrancaDto, null, 2));
    
    try {
      const result = await this.cobrancaService.create(createCobrancaDto);
      console.log('=== COBRANÇA CRIADA COM SUCESSO ===');
      console.log('Resultado:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('=== ERRO NA CRIAÇÃO DE COBRANÇA ===');
      console.error('Erro completo:', error);
      console.error('Stack trace:', error.stack);
      
      // Verifica se é um erro de NotFoundException
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Verifica se é um erro de validação
      if (error.message) {
        if (error.message.includes('não encontrado')) {
          throw new HttpException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message,
            error: 'Dados inválidos',
            details: {
              missingData: error.message.includes('Morador') ? 'morador' : 
                          error.message.includes('Condomínio') ? 'condomínio' : 
                          error.message.includes('Modelo de Carta') ? 'modelo de carta' : 'dados',
              suggestion: 'Verifique se todos os IDs fornecidos estão corretos'
            }
          }, HttpStatus.BAD_REQUEST);
        }
        
        // Tratamento específico para erro do Prisma
        if (error.message.includes('Argument') && error.message.includes('missing')) {
          throw new HttpException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Campo obrigatório não fornecido',
            error: 'Dados inválidos',
            details: {
              suggestion: 'Verifique se todos os campos obrigatórios foram preenchidos'
            }
          }, HttpStatus.BAD_REQUEST);
        }
      }
      
      // Erro genérico
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro interno ao processar cobrança',
        error: 'Erro interno',
        details: {
          suggestion: 'Verifique se todos os dados estão corretos e tente novamente',
          errorDetails: error.message
        }
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
   * Envia uma cobrança específica por email.
   * @param id O UUID da cobrança.
   */
  @Post(':id/enviar')
  async enviarCobranca(@Param('id') id: string) {
    try {
      console.log(`=== INICIANDO ENVIO DE COBRANÇA ${id} ===`);
      const result = await this.cobrancaService.enviarCobranca(id);
      console.log(`=== COBRANÇA ${id} ENVIADA COM SUCESSO ===`);
      return {
        success: true,
        message: 'Cobrança enviada com sucesso',
        data: result
      };
    } catch (error) {
      console.error(`=== ERRO AO ENVIAR COBRANÇA ${id} ===`);
      console.error('Erro:', error);
      
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro ao enviar cobrança',
        error: 'Erro interno',
        details: {
          suggestion: 'Verifique se a cobrança existe e tente novamente',
          errorDetails: error.message
        }
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Envia múltiplas cobranças por email.
   * @param ids Array de UUIDs das cobranças.
   */
  @Post('enviar-massa')
  async enviarCobrancasEmMassa(@Body() body: { ids: string[] }) {
    try {
      console.log(`=== INICIANDO ENVIO EM MASSA DE ${body.ids.length} COBRANÇAS ===`);
      const result = await this.cobrancaService.enviarCobrancasEmMassa(body.ids);
      console.log(`=== ENVIO EM MASSA CONCLUÍDO ===`);
      return {
        success: true,
        message: 'Envio em massa concluído',
        data: result
      };
    } catch (error) {
      console.error('=== ERRO NO ENVIO EM MASSA ===');
      console.error('Erro:', error);
      
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro no envio em massa',
        error: 'Erro interno',
        details: {
          suggestion: 'Verifique se as cobranças existem e tente novamente',
          errorDetails: error.message
        }
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
