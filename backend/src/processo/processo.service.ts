import { Injectable, NotFoundException } from '@nestjs/common';
import { ProcessoRepository } from './processo.repository';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ProcessoService {
  constructor(private readonly repository: ProcessoRepository) {}

  async create(data: any) {
    return this.repository.create(data);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const proc = await this.repository.findOne(id);
    if (!proc) throw new NotFoundException('Processo não encontrado');
    return proc;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.repository.update(id, data);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }

  async gerarPdf(id: string): Promise<Buffer> {
    const processo = await this.findOne(id);
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', reject);

      // Configurações do documento
      doc.fontSize(16).text('PROCESSO JURÍDICO', 50, 50, { align: 'center' });
      
      doc.fontSize(12);
      doc.text(`Número: ${processo.numeroProcesso}`, 50, 100);
      doc.text(`Data de Criação: ${new Date(processo.createdAt).toLocaleDateString('pt-BR')}`, 50, 120);
      doc.text(`Situação: ${this.getSituacaoLabel(processo.situacao)}`, 50, 140);
      
      doc.text('INFORMAÇÕES DO PROCESSO', 50, 180);
      doc.text(`Nome: ${processo.nome}`, 50, 200);
      doc.text(`Unidade: ${processo.unidade}`, 50, 220);
      doc.text(`Ação De: ${processo.acaoDe}`, 50, 240);
      
      if (processo.condominio?.nome) {
        doc.text(`Condomínio: ${processo.condominio.nome}`, 50, 260);
      }
      
      if (processo.valorDivida) {
        const valorFormatado = processo.valorDivida.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        doc.text(`Valor da Dívida: ${valorFormatado}`, 50, 280);
      }

      if (processo.movimentacoes) {
        doc.text('MOVIMENTAÇÕES', 50, 320);
        doc.text(processo.movimentacoes, 50, 340, {
          width: 500,
          align: 'justify'
        });
      }

      // Rodapé
      doc.fontSize(8);
      doc.text('Sistema Raunaimer - Gestão de Condomínios', 50, doc.page.height - 50, { align: 'center' });

      doc.end();
    });
  }

  private getSituacaoLabel(situacao: string): string {
    const labels = {
      'EM_ANDAMENTO': 'Em Andamento',
      'ARQUIVADO': 'Arquivado',
      'SUSPENSO': 'Suspenso',
      'EVIDENCIDO': 'Evidenciado',
      'JULGADO': 'Julgado',
      'CAUTELAR': 'Cautelar',
      'EXTINTO': 'Extinto',
    };
    return labels[situacao] || situacao;
  }
}


