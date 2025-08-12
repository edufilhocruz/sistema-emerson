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
    modelo.headerImageUrl || null
  );
  const [footerImagePreview, setFooterImagePreview] = useState<string | null>(
    modelo.footerImageUrl || null
  );

  // Log das imagens iniciais
  useEffect(() => {
    console.log('=== IMAGENS INICIAIS ===');
    console.log('Modelo headerImageUrl:', modelo.headerImageUrl);
    console.log('Modelo footerImageUrl:', modelo.footerImageUrl);
    console.log('Header preview inicial:', headerImagePreview);
    console.log('Footer preview inicial:', footerImagePreview);
    console.log('Window location origin:', window.location.origin);
  }, []);

  const form = useForm<ModeloFormData>({
    resolver: zodResolver(modeloSchema),
    defaultValues: { 
      titulo: modelo.titulo || '', 
      conteudo: modelo.conteudo || '',
      headerImageUrl: modelo.headerImageUrl || '',
      footerImageUrl: modelo.footerImageUrl || ''
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

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.log('❌ Erro: Arquivo muito grande');
        alert('A imagem deve ter no máximo 5MB.');
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
        
        // Salvar URL da imagem
        const imageUrl = result.imageUrl;
        console.log('🔗 Image URL da imagem:', imageUrl ? 'URL recebida' : 'Nenhuma URL');
        
        if (type === 'header') {
          console.log('📸 Definindo imagem do cabeçalho (URL)');
          setHeaderImagePreview(imageUrl);
          form.setValue('headerImageUrl', imageUrl);
        } else {
          console.log('📸 Definindo imagem do rodapé (URL)');
          setFooterImagePreview(imageUrl);
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
      form.setValue('headerImageUrl', '');
    } else {
      setFooterImagePreview(null);
      form.setValue('footerImageUrl', '');
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
      .replace(/{{endereco}}/gi, 'Rua das Flores, 123 - Centro')
      
      // Campos da Cobrança
      .replace(/{{valor}}/gi, 'R$ 500,00')
      .replace(/{{valor_formatado}}/gi, 'R$ 500,00')
      .replace(/{{mes_referencia}}/gi, 'Janeiro/2024')
      .replace(/{{data_vencimento}}/gi, '15/01/2024')
      .replace(/{{data_atual}}/gi, '10/01/2024')
      .replace(/{{hoje}}/gi, '10/01/2024');
  };

  const renderCamposDinamicos = () => {
    if (!camposDinamicos) {
      return <div className="text-sm text-gray-500">Carregando campos dinâmicos...</div>;
    }

    return (
      <div className="space-y-4">
        {/* Campos do Morador */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">Dados do Morador</h4>
          <div className="flex flex-wrap gap-1">
            {camposDinamicos.morador?.map((campo, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleVariableClick(campo.placeholder)}
              >
                {campo.placeholder}
              </Badge>
            ))}
          </div>
        </div>

        {/* Campos do Condomínio */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">Dados do Condomínio</h4>
          <div className="flex flex-wrap gap-1">
            {camposDinamicos.condominio?.map((campo, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleVariableClick(campo.placeholder)}
              >
                {campo.placeholder}
              </Badge>
            ))}
          </div>
        </div>

        {/* Campos da Cobrança */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">Dados da Cobrança</h4>
          <div className="flex flex-wrap gap-1">
            {camposDinamicos.cobranca?.map((campo, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleVariableClick(campo.placeholder)}
              >
                {campo.placeholder}
              </Badge>
            ))}
          </div>
        </div>

        {/* Campos de Data */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">Datas</h4>
          <div className="flex flex-wrap gap-1">
            {camposDinamicos.datas?.map((campo, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleVariableClick(campo.placeholder)}
              >
                {campo.placeholder}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = (data: ModeloFormData) => {
    console.log('=== DADOS DO FORMULÁRIO ===');
    console.log('Título:', data.titulo);
    console.log('Conteúdo:', data.conteudo);
    console.log('Header Image URL:', data.headerImageUrl);
    console.log('Footer Image URL:', data.footerImageUrl);
    
    onSave(data);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Coluna da Esquerda: Formulário */}
            <div className="space-y-6 lg:col-span-2">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Informações Básicas
                  </CardTitle>
                  <CardDescription>
                    Configure o título e as informações básicas do modelo de cobrança.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField 
                    control={form.control} 
                    name="titulo" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Modelo</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Cobrança Mensal - Janeiro 2024" 
                            {...field} 
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
                      name="headerImageUrl" 
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
                                  Máximo: 5MB
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
                      name="footerImageUrl" 
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
                                  Máximo: 5MB
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
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Veja como sua mensagem ficará quando enviada.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showPreview ? (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={previewAtivo === 'dinamico' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPreviewAtivo('dinamico')}
                        >
                          Dinâmico
                        </Button>
                        <Button
                          type="button"
                          variant={previewAtivo === 'estatico' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPreviewAtivo('estatico')}
                        >
                          Estático
                        </Button>
                      </div>
                      
                      <div className="p-4 text-sm border rounded-lg bg-gray-50 max-h-64 overflow-y-auto">
                        <div className="mb-4">
                          <strong>Assunto:</strong> {tituloValue || 'Título do modelo'}
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: previewAtivo === 'dinamico' 
                                ? gerarPreviewDinamico(conteudoValue || '') 
                                : conteudoValue || 'Conteúdo do modelo'
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <EyeOff className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Pré-visualização desativada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Botões de Ação */}
          <DialogFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {modelo.id && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onDelete(modelo.id!)}
                  disabled={isSaving}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const conteudo = form.getValues('conteudo');
                  if (conteudo) {
                    navigator.clipboard.writeText(conteudo);
                  }
                }}
                disabled={isSaving}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
              
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
};
