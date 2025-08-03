import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import { UpdateCobrancaDto } from './dto/update-cobranca.dto';

@Injectable()
export class CobrancaRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(createCobrancaDto: CreateCobrancaDto) {
    const { condominioId, moradorId, modeloCartaId, ...rest } = createCobrancaDto;
    
    // Constrói o objeto de dados
    const data: any = {
      ...rest,
      condominio: { connect: { id: condominioId } },
      morador: { connect: { id: moradorId } },
      modeloCarta: { connect: { id: modeloCartaId } }
    };
    
    // Garante que valor seja null se não fornecido ou inválido
    if (data.valor === undefined || data.valor === null || data.valor <= 0) {
      data.valor = null;
    }
    
    console.log('=== DADOS FINAIS DO REPOSITORY ===');
    console.log('Dados para criação da cobrança:', JSON.stringify(data, null, 2));
    
    return this.prisma.cobranca.create({ data });
  }

  findAll() {
    return this.prisma.cobranca.findMany({
      include: {
        morador: { select: { nome: true } },
        condominio: { select: { id: true, nome: true } },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.cobranca.findUnique({
      where: { id },
      include: { 
        morador: true, 
        condominio: { select: { id: true, nome: true } }, 
        modeloCarta: true 
      },
    });
  }

  update(id: string, updateCobrancaDto: UpdateCobrancaDto) {
    return this.prisma.cobranca.update({
      where: { id },
      data: updateCobrancaDto,
    });
  }

  remove(id: string) {
    return this.prisma.cobranca.delete({ where: { id } });
  }
}
