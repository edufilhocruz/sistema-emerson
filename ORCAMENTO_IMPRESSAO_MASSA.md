# Orçamento - Geração de Cartas de Cobrança para Impressão em Massa

## 📋 Resumo Executivo

**Funcionalidade:** Sistema de geração de cartas de cobrança em PDF para impressão em massa e envio pelo correio.

**Objetivo:** Permitir que o usuário selecione um condomínio, gere um PDF com todas as cartas de cobrança dos moradores, com layout otimizado para impressão (frente/verso), facilitando o envio pelo correio.

---

## 🎯 Requisitos Funcionais

### 1. Interface de Usuário
- **Nova página/seção:** "Impressão em Massa" no menu de cobranças
- **Filtros de seleção:**
  - Seleção de condomínio
  - Seleção de modelo de carta
  - Filtro por status de cobrança (pendente, atrasado, etc.)
  - Filtro por período de vencimento
- **Preview:** Visualização prévia do PDF antes do download
- **Controles:** Botão de geração e download do PDF

### 2. Geração de PDF
- **Layout otimizado para impressão:**
  - **Frente:** Dados do destinatário (nome, endereço, unidade)
  - **Verso:** Carta de cobrança completa
- **Formato:** PDF com múltiplas páginas (2 páginas por morador)
- **Paginação:** Automática e organizada
- **Cabeçalho/Rodapé:** Logotipo e informações do condomínio

### 3. Dados Incluídos
- **Informações do destinatário:**
  - Nome completo do morador
  - Endereço completo (bloco, apartamento)
  - Dados do condomínio
- **Carta de cobrança:**
  - Conteúdo do modelo selecionado
  - Valores e datas processados
  - Imagens do cabeçalho/rodapé

---

## 🛠️ Requisitos Técnicos

### 1. Backend (NestJS)
- **Nova rota:** `POST /cobranca/gerar-pdf-massa`
- **Dependências adicionais:**
  - `puppeteer` ou `@react-pdf/renderer` para geração de PDF
  - `handlebars` (já existente) para templates
- **Novo serviço:** `PdfGenerationService`
- **Endpoint:** Geração de PDF com dados processados

### 2. Frontend (React)
- **Nova página:** `ImpressaoMassa.tsx`
- **Componentes:**
  - `FiltrosImpressao.tsx`
  - `PreviewPdf.tsx`
  - `GeradorPdf.tsx`
- **Bibliotecas adicionais:**
  - `react-pdf` para preview
  - `file-saver` para download

### 3. Estrutura de Dados
- **Reutilização:** Modelos existentes (Condominio, Morador, Cobranca, ModeloCarta)
- **Novos DTOs:**
  - `GerarPdfMassaDto`
  - `FiltrosImpressaoDto`

---

## 📊 Análise de Complexidade

### Complexidade: **MÉDIA-ALTA**

**Fatores de Complexidade:**
1. **Layout de impressão:** Requer conhecimento de design para impressão
2. **Geração de PDF:** Integração com bibliotecas de PDF
3. **Processamento de dados:** Lógica para organizar dados por morador
4. **Otimização:** Performance para grandes volumes de dados

**Fatores que Facilitam:**
1. **Base existente:** Sistema de cobrança já implementado
2. **Templates:** Sistema de modelos já funcional
3. **Dados estruturados:** Banco de dados bem organizado
4. **Arquitetura:** Código bem estruturado e modular

---

## ⏱️ Estimativa de Tempo

### Desenvolvimento Backend (16-20 horas)
- **Configuração de dependências:** 2 horas
- **Serviço de geração de PDF:** 8-10 horas
- **Endpoint e validações:** 3-4 horas
- **Testes e ajustes:** 3-4 horas

### Desenvolvimento Frontend (20-24 horas)
- **Interface de filtros:** 6-8 horas
- **Componente de preview:** 4-6 horas
- **Integração com backend:** 4-5 horas
- **Estilização e UX:** 4-5 horas
- **Testes e ajustes:** 2-3 horas

### Testes e Refinamentos (8-12 horas)
- **Testes de integração:** 3-4 horas
- **Testes com diferentes volumes:** 2-3 horas
- **Ajustes de layout:** 2-3 horas
- **Documentação:** 1-2 horas

### **TOTAL: 44-56 horas**

---

## 💰 Orçamento Detalhado

### Módulo de Impressão em Massa
- **Desenvolvimento completo:** Backend + Frontend + Testes
- **Implementação:** Interface, geração de PDF, filtros e preview
- **Suporte:** 30 dias de suporte pós-entrega

### **VALOR TOTAL: R$ 1.500,00**

---

## 🎯 Benefícios do Módulo de Impressão em Massa

### 💼 **Benefícios Operacionais**
- **⏰ Economia de Tempo:** Geração automática de todas as cartas em segundos
- **📦 Envio pelo Correio:** Layout otimizado para impressão e envio postal
- **🎯 Profissionalismo:** Cartas padronizadas e bem formatadas
- **📊 Controle Total:** Filtros para selecionar exatamente quais cobranças imprimir

### 💰 **Benefícios Financeiros**
- **📉 Redução de Custos:** Elimina impressão manual e erros
- **📈 Aumento de Eficiência:** Processo 10x mais rápido que manual
- **💸 Economia de Papel:** Layout otimizado reduz desperdício
- **🔄 Reutilização:** Modelos podem ser usados múltiplas vezes

### 🚀 **Benefícios Estratégicos**
- **📱 Integração Completa:** Funciona perfeitamente com o sistema existente
- **🔧 Flexibilidade:** Filtros permitem diferentes estratégias de cobrança
- **📋 Rastreabilidade:** Histórico de todas as cartas geradas
- **⚡ Escalabilidade:** Suporta condomínios de qualquer tamanho

### 🎨 **Benefícios de Qualidade**
- **✨ Layout Profissional:** Design otimizado para impressão
- **📄 Padronização:** Todas as cartas seguem o mesmo padrão visual
- **🖼️ Branding:** Mantém identidade visual do condomínio
- **📝 Personalização:** Dados específicos de cada morador

### 🛡️ **Benefícios de Segurança**
- **🔒 Dados Seguros:** Processamento local, sem envio para terceiros
- **📋 Backup Automático:** Histórico preservado no sistema
- **✅ Validação:** Verificação automática de dados antes da impressão
- **🔐 Controle de Acesso:** Apenas usuários autorizados podem gerar cartas

### 📊 **ROI - Retorno sobre Investimento**

**Investimento:** R$ 1.500,00 (uma única vez)

**Economia Mensal Estimada:**
- ⏰ **Tempo economizado:** 8 horas/mês × R$ 50,00/hora = **R$ 400,00**
- 📄 **Papel e tinta:** Redução de 30% = **R$ 150,00**
- 🚫 **Eliminação de erros:** Evita retrabalho = **R$ 200,00**
- 📦 **Envio otimizado:** Melhor organização = **R$ 100,00**

**Total de Economia Mensal: R$ 850,00**

**⏱️ Payback:** 1,8 meses (menos de 2 meses!)

**💰 Economia Anual:** R$ 10.200,00 - R$ 1.500,00 = **R$ 8.700,00 de lucro**

---

## 📅 Cronograma de Entrega

### Semana 1 (5 dias úteis)
- **Dia 1-2:** Configuração backend e dependências
- **Dia 3-4:** Desenvolvimento do serviço de PDF
- **Dia 5:** Endpoint e testes básicos

### Semana 2 (5 dias úteis)
- **Dia 1-2:** Interface de filtros
- **Dia 3-4:** Componente de preview e geração
- **Dia 5:** Integração frontend-backend

### Semana 3 (3 dias úteis)
- **Dia 1:** Testes de integração
- **Dia 2:** Ajustes de layout e performance
- **Dia 3:** Entrega e documentação

### **Prazo Total: 13 dias úteis (2,5 semanas)**

---

## 🔧 Especificações Técnicas Detalhadas

### 1. Geração de PDF
```typescript
// Estrutura do serviço
class PdfGenerationService {
  async gerarPdfMassa(filtros: FiltrosImpressaoDto): Promise<Buffer> {
    // 1. Buscar dados filtrados
    // 2. Processar templates
    // 3. Gerar PDF com layout frente/verso
    // 4. Retornar buffer do PDF
  }
}
```

### 2. Layout do PDF
- **Página 1 (Frente):** Dados do destinatário
- **Página 2 (Verso):** Carta de cobrança
- **Margens:** Otimizadas para impressão
- **Fonte:** Arial 12pt (legível para impressão)

### 3. Filtros Disponíveis
- Condomínio (obrigatório)
- Modelo de carta (obrigatório)
- Status da cobrança (opcional)
- Período de vencimento (opcional)
- Moradores específicos (opcional)

---

## 🎨 Mockup da Interface

### Tela Principal
```
┌─────────────────────────────────────────────────────────┐
│ 📄 Impressão em Massa - Cartas de Cobrança             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. Selecionar Condomínio: [Dropdown]                   │
│ 2. Selecionar Modelo: [Dropdown]                       │
│ 3. Filtros Opcionais:                                  │
│    ☐ Apenas pendentes  ☐ Apenas atrasados             │
│    📅 Período: [Data Início] até [Data Fim]            │
│                                                         │
│ 📊 Resumo:                                             │
│ • Total de moradores: 45                               │
│ • Cartas a gerar: 45                                   │
│ • Páginas no PDF: 90 (45 × 2)                          │
│                                                         │
│ [👁️ Preview PDF] [📥 Gerar e Baixar PDF]              │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Critérios de Aceitação

### Funcionalidades Obrigatórias
1. ✅ Seleção de condomínio e modelo
2. ✅ Geração de PDF com layout frente/verso
3. ✅ Preview do PDF antes do download
4. ✅ Download do arquivo PDF
5. ✅ Filtros básicos (status, período)

### Funcionalidades Desejáveis
1. 🔄 Filtro por moradores específicos
2. 🔄 Configuração de margens
3. 🔄 Preview de páginas individuais
4. 🔄 Histórico de PDFs gerados

### Critérios de Qualidade
1. ✅ PDF gerado em menos de 30 segundos
2. ✅ Layout otimizado para impressão A4
3. ✅ Dados corretos e formatados
4. ✅ Interface intuitiva e responsiva

---

## 🚀 Plano de Implementação

### Fase 1: Backend (Semana 1)
1. Instalar dependências (puppeteer)
2. Criar PdfGenerationService
3. Implementar endpoint /cobranca/gerar-pdf-massa
4. Testes unitários

### Fase 2: Frontend (Semana 2)
1. Criar página ImpressaoMassa
2. Implementar filtros
3. Integrar com backend
4. Adicionar preview

### Fase 3: Refinamentos (Semana 3)
1. Testes de integração
2. Ajustes de layout
3. Otimizações de performance
4. Documentação

---

## 📞 Próximos Passos

1. **Aprovação do orçamento** pelo cliente
2. **Definição da data de início** do projeto
3. **Setup do ambiente** de desenvolvimento
4. **Início da implementação** conforme cronograma

---

**Desenvolvido por:** Sistema Raunaimer v2  
**Data:** Janeiro 2025  
**Versão:** 1.0
