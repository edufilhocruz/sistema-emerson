'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ModeloCarta, ModeloFormData, modeloSchema } from '@/entities/modelos/types';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter } from '@/components/ui/dialog';
import { Trash2, Copy, Save, Info, CheckCircle, AlertCircle, Image as ImageIcon, Upload, X, Eye, EyeOff, Palette, Type, Link, List, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';
import { QuillEditor } from './QuillEditor';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  modelo: Partial<ModeloCarta>;
  onSave: (data: ModeloFormData) => void;
  onDelete: (id: string) => void;
  isSaving?: boolean;
}

interface CampoDinamico {
  placeholder: string;
  descricao: string;
}

interface CamposDinamicos {
  morador: CampoDinamico[];
  condominio: CampoDinamico[];
  cobranca: CampoDinamico[];
  datas: CampoDinamico[];
}

export const ModeloEditor = ({ modelo, onSave, onDelete, isSaving }: Props) => {
  const [camposDinamicos, setCamposDinamicos] = useState<CamposDinamicos | null>(null);
  const [previewAtivo, setPreviewAtivo] = useState<'estatico' | 'dinamico'>('dinamico');
  const [showPreview, setShowPreview] = useState(true);
  const [headerImagePreview, setHeaderImagePreview] = useState<string | null>(
    modelo.headerImage || null
  );
  const [footerImagePreview, setFooterImagePreview] = useState<string | null>(
    modelo.footerImage || null
  );

  // Log das imagens iniciais
  useEffect(() => {
    console.log('=== IMAGENS INICIAIS ===');
    console.log('Modelo headerImage:', modelo.headerImage);
    console.log('Modelo footerImage:', modelo.footerImage);
    console.log('Header preview inicial:', headerImagePreview);
    console.log('Footer preview inicial:', footerImagePreview);
    console.log('Window location origin:', window.location.origin);
  }, []);

  const form = useForm<ModeloFormData>({
    resolver: zodResolver(modeloSchema),
    defaultValues: { 
      titulo: modelo.titulo || '', 
      conteudo: modelo.conteudo || '',
      headerImage: modelo.headerImage || '',
      footerImage: modelo.footerImage || ''
    },
  });

  const conteudoValue = form.watch('conteudo');
  const tituloValue = form.watch('titulo');

  // Carrega os campos dinâmicos do backend
  useEffect(() => {
    const carregarCamposDinamicos = async () => {
      try {
        const response = await fetch('/api/modelo-carta/campos-dinamicos');
        const data = await response.json();
        setCamposDinamicos(data);
      } catch (error) {
        console.error('Erro ao carregar campos dinâmicos:', error);
      }
    };

    carregarCamposDinamicos();
  }, []);

  const handleVariableClick = (variavel: string) => {
    const currentValue = form.getValues('conteudo') || '';
    const newValue = currentValue ? `${currentValue} ${variavel}` : variavel;
    form.setValue('conteudo', newValue, { shouldValidate: true });
  };

  const handleImageUpload = async (file: File, type: 'header' | 'footer') => {
    console.log('=== INICIANDO UPLOAD DE IMAGEM ===');
    console.log('Tipo:', type);
    console.log('Arquivo:', file);
    console.log('Nome do arquivo:', file.name);
    console.log('Tamanho:', file.size);
    console.log('Tipo MIME:', file.type);
    
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        console.log('❌ Erro: Arquivo não é uma imagem');
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Validar tamanho (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        console.log('❌ Erro: Arquivo muito grande');
        alert('A imagem deve ter no máximo 2MB.');
        return;
      }

      try {
        console.log('📤 Fazendo upload da imagem...');
        
        // Criar FormData para upload
        const formData = new FormData();
        formData.append('image', file);

        console.log('URL do upload:', '/api/modelo-carta/upload-image');
        console.log('FormData criado:', formData);

        // Fazer upload da imagem
        const response = await fetch('/api/modelo-carta/upload-image', {
          method: 'POST',
          body: formData,
        });

        console.log('📥 Resposta recebida:', response);
        console.log('Status:', response.status);
        console.log('OK:', response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.log('❌ Erro na resposta:', errorText);
          throw new Error(`Erro no upload da imagem: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Resultado do upload:', result);
        
        // Salvar Base64 e URL da imagem
        const dataUrl = result.dataUrl;
        const imageUrl = result.imageUrl;
        console.log('🔗 Data URL da imagem:', dataUrl ? 'Base64 recebido' : 'Nenhum Base64');
        console.log('🔗 Image URL da imagem:', imageUrl ? 'URL recebida' : 'Nenhuma URL');
        
        if (type === 'header') {
          console.log('📸 Definindo imagem do cabeçalho (Base64 + URL)');
          setHeaderImagePreview(dataUrl);
          form.setValue('headerImage', dataUrl);
          form.setValue('headerImageUrl', imageUrl);
        } else {
          console.log('📸 Definindo imagem do rodapé (Base64 + URL)');
          setFooterImagePreview(dataUrl);
          form.setValue('footerImage', dataUrl);
          form.setValue('footerImageUrl', imageUrl);
        }
        
        console.log('✅ Upload concluído com sucesso!');
      } catch (error) {
        console.error('❌ Erro no upload:', error);
        console.error('Stack trace:', error.stack);
        alert('Erro ao fazer upload da imagem. Tente novamente.');
      }
    }
  };

  const removeImage = (type: 'header' | 'footer') => {
    if (type === 'header') {
      setHeaderImagePreview(null);
      form.setValue('headerImage', '');
    } else {
      setFooterImagePreview(null);
      form.setValue('footerImage', '');
    }
  };

  /**
   * Gera um preview realista substituindo as variáveis por exemplos fictícios.
   */
  const gerarPreviewDinamico = (texto: string) => {
    return texto
      // Campos do Morador
      .replace(/{{nome_morador}}/gi, 'João da Silva')
      .replace(/{{email}}/gi, 'joao.silva@email.com')
      .replace(/{{telefone}}/gi, '(11) 99999-9999')
      .replace(/{{bloco}}/gi, 'A')
      .replace(/{{apartamento}}/gi, '101')
      .replace(/{{unidade}}/gi, 'A-101')
      
      // Campos do Condomínio
      .replace(/{{nome_condominio}}/gi, 'Residencial Jardim das Acácias')
      .replace(/{{cnpj}}/gi, '12.345.678/0001-90')
      .replace(/{{cidade}}/gi, 'São Paulo')
      .replace(/{{estado}}/gi, 'SP')
      .replace(/{{endereco}}/gi, 'Rua das Flores, 123, Centro, São Paulo - SP')
      
      // Campos da Cobrança
      .replace(/{{valor}}/gi, 'R$ 1.234,56')
      .replace(/{{valor_formatado}}/gi, 'R$ 1.234,56')
      .replace(/{{mes_referencia}}/gi, '07/2025')
      .replace(/{{data_vencimento}}/gi, '15/07/2025')
      
      // Campos de Data
      .replace(/{{data_atual}}/gi, '30/07/2025')
      .replace(/{{hoje}}/gi, '30/07/2025');
  };

  /**
   * Renderiza a pré-visualização estática, destacando as variáveis
   */
  const renderPreviewEstatico = () => {
    let previewText = conteudoValue || '';
    
    // Destaca os campos dinâmicos
    const regex = /\{\{[^}]+\}\}/g;
    previewText = previewText.replace(regex, (match) => 
      `<span class="font-semibold text-blue-600 bg-blue-100 px-1 rounded">${match}</span>`
    );
    
    return { __html: previewText };
  };

  const renderCamposDinamicos = () => {
    if (!camposDinamicos) {
      return <div className="py-4 text-center">Carregando campos dinâmicos...</div>;
    }

    return (
      <Tabs defaultValue="morador" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="morador" className="flex items-center gap-1">
            <span className="text-sm">👤</span> Morador
          </TabsTrigger>
          <TabsTrigger value="condominio" className="flex items-center gap-1">
            <span className="text-sm">🏢</span> Condomínio
          </TabsTrigger>
          <TabsTrigger value="cobranca" className="flex items-center gap-1">
            <span className="text-sm">💰</span> Cobrança
          </TabsTrigger>
          <TabsTrigger value="datas" className="flex items-center gap-1">
            <span className="text-sm">📅</span> Datas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="morador" className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
          {camposDinamicos.morador.map((campo) => (
            <TooltipProvider key={campo.placeholder}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                      className="justify-start h-auto px-3 py-2 text-xs"
                    onClick={() => handleVariableClick(campo.placeholder)}
                  >
                    {campo.placeholder}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{campo.descricao}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          </div>
        </TabsContent>
        
        <TabsContent value="condominio" className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
          {camposDinamicos.condominio.map((campo) => (
            <TooltipProvider key={campo.placeholder}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                      className="justify-start h-auto px-3 py-2 text-xs"
                    onClick={() => handleVariableClick(campo.placeholder)}
                  >
                    {campo.placeholder}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{campo.descricao}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          </div>
        </TabsContent>
        
        <TabsContent value="cobranca" className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
          {camposDinamicos.cobranca.map((campo) => (
            <TooltipProvider key={campo.placeholder}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                      className="justify-start h-auto px-3 py-2 text-xs"
                    onClick={() => handleVariableClick(campo.placeholder)}
                  >
                    {campo.placeholder}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{campo.descricao}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          </div>
        </TabsContent>
        
        <TabsContent value="datas" className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
          {camposDinamicos.datas.map((campo) => (
            <TooltipProvider key={campo.placeholder}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                      className="justify-start h-auto px-3 py-2 text-xs"
                    onClick={() => handleVariableClick(campo.placeholder)}
                  >
                    {campo.placeholder}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{campo.descricao}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
            {modelo.id ? 'Editar Modelo de Cobrança' : 'Criar Novo Modelo de Cobrança'}
          </h2>
          <p className="text-muted-foreground">
            Crie um modelo profissional com formatação rica e campos dinâmicos
          </p>
        </div>

        {/* Alert de informações */}
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            Este editor suporta formatação rica de texto, imagens inline, links e campos dinâmicos que serão substituídos automaticamente pelos dados reais.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* Coluna da Esquerda: Formulário Principal */}
          <div className="space-y-6 xl:col-span-2">
            {/* Nome do Modelo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent>
            <FormField 
              control={form.control} 
              name="titulo" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Modelo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Cobrança Padrão Mensal" 
                      {...field} 
                          className="text-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
              </CardContent>
            </Card>

            {/* Editor de Conteúdo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Conteúdo da Mensagem
                </CardTitle>
                <CardDescription>
                  Use o editor abaixo para criar o conteúdo da sua mensagem. Suporte completo a formatação rica.
                </CardDescription>
              </CardHeader>
              <CardContent>
            <FormField 
              control={form.control} 
              name="conteudo" 
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                        <QuillEditor
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="Digite sua mensagem aqui... Use os campos dinâmicos para personalizar o conteúdo."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
              </CardContent>
            </Card>

            {/* Imagens do Cabeçalho e Rodapé */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Imagens do Email
                </CardTitle>
                <CardDescription>
                  Adicione imagens para o cabeçalho e rodapé do email. Estas aparecerão automaticamente em todas as cobranças.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <FormField 
                    control={form.control} 
                    name="headerImage" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Imagem do Cabeçalho
                        </FormLabel>
                        <div className="space-y-2">
                                                  {headerImagePreview ? (
                          <div className="relative">
                            <img 
                              src={headerImagePreview} 
                              alt="Preview cabeçalho" 
                              className="object-contain w-full bg-white border rounded-lg shadow-sm max-h-32"
                              onLoad={() => console.log('✅ Imagem do cabeçalho carregada:', headerImagePreview)}
                              onError={(e) => console.log('❌ Erro ao carregar imagem do cabeçalho:', headerImagePreview, e)}
                            />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute w-6 h-6 p-0 top-2 right-2"
                                onClick={() => removeImage('header')}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className="p-6 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50"
                              onClick={() => document.getElementById('header-image-upload')?.click()}
                            >
                              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="mb-2 text-sm font-medium text-gray-600">Clique aqui para fazer upload</p>
                              <p className="mb-3 text-xs text-gray-500">
                                Medidas ideais: 800x200px (JPG, PNG)<br/>
                                Máximo: 2MB
                              </p>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="header-image-upload"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file, 'header');
                                }}
                              />
                              <Button type="button" variant="outline" size="sm" className="cursor-pointer">
                                Selecionar Imagem
                              </Button>
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />

                  <FormField 
                    control={form.control} 
                    name="footerImage" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Imagem do Rodapé/Assinatura
                        </FormLabel>
                        <div className="space-y-2">
                                                  {footerImagePreview ? (
                          <div className="relative">
                            <img 
                              src={footerImagePreview} 
                              alt="Preview rodapé" 
                              className="object-contain w-full bg-white border rounded-lg shadow-sm max-h-32"
                              onLoad={() => console.log('✅ Imagem do rodapé carregada:', footerImagePreview)}
                              onError={(e) => console.log('❌ Erro ao carregar imagem do rodapé:', footerImagePreview, e)}
                            />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute w-6 h-6 p-0 top-2 right-2"
                                onClick={() => removeImage('footer')}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className="p-6 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50"
                              onClick={() => document.getElementById('footer-image-upload')?.click()}
                            >
                              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="mb-2 text-sm font-medium text-gray-600">Clique aqui para fazer upload</p>
                              <p className="mb-3 text-xs text-gray-500">
                                Medidas ideais: 400x150px (JPG, PNG)<br/>
                                Máximo: 2MB
                              </p>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="footer-image-upload"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file, 'footer');
                                }}
                              />
                              <Button type="button" variant="outline" size="sm" className="cursor-pointer">
                                Selecionar Imagem
                              </Button>
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna da Direita: Sidebar */}
          <div className="space-y-6">
            {/* Campos Dinâmicos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Link className="w-5 h-5" />
                  Campos Dinâmicos
                </CardTitle>
                <CardDescription>
                  Clique nos campos abaixo para inserir no conteúdo. Eles serão substituídos automaticamente pelos dados reais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderCamposDinamicos()}
              </CardContent>
            </Card>

            {/* Pré-visualização */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Eye className="w-5 h-5" />
                    Pré-visualização
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {showPreview && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={previewAtivo === 'dinamico' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewAtivo('dinamico')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Preview Dinâmico
                  </Button>
                  <Button
                    type="button"
                    variant={previewAtivo === 'estatico' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewAtivo('estatico')}
                  >
                      <AlertCircle className="w-4 h-4 mr-2" />
                    Campos Destacados
                  </Button>
                </div>
                )}
              </CardHeader>
              {showPreview && (
              <CardContent>
                <div className="space-y-4">
                  <div>
                      <h4 className="mb-2 text-sm font-semibold">Assunto:</h4>
                      <div className="p-3 text-sm border rounded-lg bg-muted">
                      {previewAtivo === 'dinamico' 
                        ? gerarPreviewDinamico(tituloValue)
                        : <span dangerouslySetInnerHTML={renderPreviewEstatico()} />
                      }
                    </div>
                  </div>
                  
                  <div>
                      <h4 className="mb-2 text-sm font-semibold">Conteúdo:</h4>
                      <div className="p-3 overflow-y-auto text-sm border rounded-lg bg-muted max-h-96">
                        {headerImagePreview && (
                          <div className="pb-4 mb-4 text-center border-b">
                            <img 
                              src={headerImagePreview} 
                              alt="Cabeçalho" 
                              className="object-contain max-w-full mx-auto bg-white border rounded shadow-sm max-h-32"
                              onLoad={() => console.log('✅ Preview: Imagem do cabeçalho carregada:', headerImagePreview)}
                              onError={(e) => console.log('❌ Preview: Erro ao carregar imagem do cabeçalho:', headerImagePreview, e)}
                            />
                            <p className="mt-2 text-xs text-gray-500">Imagem do Cabeçalho</p>
                          </div>
                        )}
                      {previewAtivo === 'dinamico' 
                          ? <div dangerouslySetInnerHTML={{ __html: gerarPreviewDinamico(conteudoValue || '') }} />
                        : <span dangerouslySetInnerHTML={renderPreviewEstatico()} />
                      }
                        {footerImagePreview && (
                          <div className="pt-4 mt-4 text-center border-t">
                            <img 
                              src={footerImagePreview} 
                              alt="Rodapé/Assinatura" 
                              className="object-contain max-w-full mx-auto bg-white border rounded shadow-sm max-h-24"
                              onLoad={() => console.log('✅ Preview: Imagem do rodapé carregada:', footerImagePreview)}
                              onError={(e) => console.log('❌ Preview: Erro ao carregar imagem do rodapé:', footerImagePreview, e)}
                            />
                            <p className="mt-2 text-xs text-gray-500">Imagem do Rodapé/Assinatura</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Dicas de Uso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5" />
                  Dicas de Uso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Bold className="h-4 w-4 mt-0.5 text-blue-600" />
                    <span>Use <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+B</kbd> para negrito</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Italic className="h-4 w-4 mt-0.5 text-blue-600" />
                    <span>Use <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+I</kbd> para itálico</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Underline className="h-4 w-4 mt-0.5 text-blue-600" />
                    <span>Use <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+U</kbd> para sublinhado</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <List className="h-4 w-4 mt-0.5 text-blue-600" />
                    <span>Use listas para organizar informações</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlignLeft className="h-4 w-4 mt-0.5 text-blue-600" />
                    <span>Alinhe o texto conforme necessário</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Footer com ações */}
        <DialogFooter className="justify-between pt-6">
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              type="button" 
              onClick={() => onDelete(modelo.id!)} 
              disabled={!modelo.id || isSaving}
            >
              <Trash2 className="w-4 h-4 mr-2" /> 
              Excluir
            </Button>
            <Button 
              variant="outline" 
              type="button" 
              disabled={isSaving}
            >
              <Copy className="w-4 h-4 mr-2" /> 
              Duplicar
            </Button>
          </div>
          <Button 
            type="submit" 
            className="text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" /> 
            {isSaving ? "Salvando..." : "Salvar Modelo"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
