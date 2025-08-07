'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ModeloCarta, ModeloFormData, modeloSchema } from '@/entities/modelos/types';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from '@/components/ui/dialog';
import { Trash2, Copy, Save, Info, CheckCircle, AlertCircle, Image as ImageIcon, Upload, X } from 'lucide-react';
import { QuillEditor } from './QuillEditor';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [headerImagePreview, setHeaderImagePreview] = useState<string | null>(modelo.headerImage || null);
  const [footerImagePreview, setFooterImagePreview] = useState<string | null>(modelo.footerImage || null);

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

  const handleImageUpload = (file: File, type: 'header' | 'footer') => {
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Validar tamanho (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'header') {
          setHeaderImagePreview(result);
          form.setValue('headerImage', result);
        } else {
          setFooterImagePreview(result);
          form.setValue('footerImage', result);
        }
      };
      reader.readAsDataURL(file);
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
      return <div className="text-center py-4">Carregando campos dinâmicos...</div>;
    }

    return (
      <Tabs defaultValue="morador" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="morador">👤 Morador</TabsTrigger>
          <TabsTrigger value="condominio">🏢 Condomínio</TabsTrigger>
          <TabsTrigger value="cobranca">💰 Cobrança</TabsTrigger>
          <TabsTrigger value="datas">📅 Datas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="morador" className="space-y-2">
          {camposDinamicos.morador.map((campo) => (
            <TooltipProvider key={campo.placeholder}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 px-3 text-xs"
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
        </TabsContent>
        
        <TabsContent value="condominio" className="space-y-2">
          {camposDinamicos.condominio.map((campo) => (
            <TooltipProvider key={campo.placeholder}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 px-3 text-xs"
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
        </TabsContent>
        
        <TabsContent value="cobranca" className="space-y-2">
          {camposDinamicos.cobranca.map((campo) => (
            <TooltipProvider key={campo.placeholder}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 px-3 text-xs"
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
        </TabsContent>
        
        <TabsContent value="datas" className="space-y-2">
          {camposDinamicos.datas.map((campo) => (
            <TooltipProvider key={campo.placeholder}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 px-3 text-xs"
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
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {modelo.id ? 'Editar Modelo de Cobrança' : 'Criar Novo Modelo de Cobrança'}
          </h2>
          <p className="text-muted-foreground mt-2">
            Crie um modelo personalizado com campos dinâmicos que serão preenchidos automaticamente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna da Esquerda: Formulário */}
          <div className="space-y-6">
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <FormField 
              control={form.control} 
              name="conteudo" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo da Mensagem</FormLabel>
                  <FormControl>
                    <QuillEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Digite sua mensagem aqui... Use os campos dinâmicos abaixo para personalizar o conteúdo."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                control={form.control} 
                name="headerImage" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Imagem do Cabeçalho
                    </FormLabel>
                    <div className="space-y-2">
                      {headerImagePreview ? (
                        <div className="relative">
                          <img 
                            src={headerImagePreview} 
                            alt="Preview cabeçalho" 
                            className="w-full h-32 object-contain border rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => removeImage('header')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                          onClick={() => document.getElementById('header-image-upload')?.click()}
                        >
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2 font-medium">Clique aqui para fazer upload</p>
                          <p className="text-xs text-gray-500 mb-3">
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
                      <ImageIcon className="h-4 w-4" />
                      Imagem do Rodapé/Assinatura
                    </FormLabel>
                    <div className="space-y-2">
                      {footerImagePreview ? (
                        <div className="relative">
                          <img 
                            src={footerImagePreview} 
                            alt="Preview rodapé" 
                            className="w-full h-32 object-contain border rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => removeImage('footer')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                          onClick={() => document.getElementById('footer-image-upload')?.click()}
                        >
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2 font-medium">Clique aqui para fazer upload</p>
                          <p className="text-xs text-gray-500 mb-3">
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Campos Dinâmicos Disponíveis
                </CardTitle>
                <CardDescription>
                  Clique nos campos abaixo para inserir no conteúdo. Eles serão substituídos automaticamente pelos dados reais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderCamposDinamicos()}
              </CardContent>
            </Card>
          </div>

          {/* Coluna da Direita: Pré-visualização */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pré-visualização</CardTitle>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={previewAtivo === 'dinamico' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewAtivo('dinamico')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Preview Dinâmico
                  </Button>
                  <Button
                    type="button"
                    variant={previewAtivo === 'estatico' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewAtivo('estatico')}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Campos Destacados
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Assunto:</h4>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {previewAtivo === 'dinamico' 
                        ? gerarPreviewDinamico(tituloValue)
                        : <span dangerouslySetInnerHTML={renderPreviewEstatico()} />
                      }
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Conteúdo:</h4>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {headerImagePreview && (
                        <div className="mb-4 text-center">
                          <img 
                            src={headerImagePreview} 
                            alt="Cabeçalho" 
                            className="max-w-full h-20 object-contain mx-auto"
                          />
                        </div>
                      )}
                      {previewAtivo === 'dinamico' 
                        ? <div dangerouslySetInnerHTML={{ __html: gerarPreviewDinamico(conteudoValue || '') }} />
                        : <span dangerouslySetInnerHTML={renderPreviewEstatico()} />
                      }
                      {footerImagePreview && (
                        <div className="mt-4 text-center">
                          <img 
                            src={footerImagePreview} 
                            alt="Rodapé/Assinatura" 
                            className="max-w-full h-16 object-contain mx-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="justify-between pt-6">
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              type="button" 
              onClick={() => onDelete(modelo.id!)} 
              disabled={!modelo.id || isSaving}
            >
              <Trash2 className="mr-2 h-4 w-4" /> 
              Excluir
            </Button>
            <Button 
              variant="outline" 
              type="button" 
              disabled={isSaving}
            >
              <Copy className="mr-2 h-4 w-4" /> 
              Duplicar
            </Button>
          </div>
          <Button 
            type="submit" 
            className="bg-gold hover:bg-gold-hover" 
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" /> 
            {isSaving ? "Salvando..." : "Salvar Modelo"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
