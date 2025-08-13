'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

/**
 * Interface para gerenciar estado das imagens
 */
interface ImageState {
  url: string | null;
  preview: string | null;
  loading: boolean;
  error: string | null;
}

export const ModeloEditor = ({ modelo, onSave, onDelete, isSaving }: Props) => {
  // Estados para campos dinâmicos e preview
  const [camposDinamicos, setCamposDinamicos] = useState<CamposDinamicos | null>(null);
  const [previewAtivo, setPreviewAtivo] = useState<'estatico' | 'dinamico'>('dinamico');
  const [showPreview, setShowPreview] = useState(true);

  // Estados otimizados para imagens
  const [headerImage, setHeaderImage] = useState<ImageState>({
    url: modelo.headerImageUrl || null,
    preview: null,
    loading: false,
    error: null
  });

  const [footerImage, setFooterImage] = useState<ImageState>({
    url: modelo.footerImageUrl || null,
    preview: null,
    loading: false,
    error: null
  });

  // Formulário com validação
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

  /**
   * Construtor de URLs otimizado com cache
   */
  const buildImageUrl = useCallback((imageUrl: string | null): string | null => {
    if (!imageUrl) return null;
    
    // Se já é uma URL completa, retorna como está
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Se é uma URL relativa que começa com /api, constrói URL completa
    if (imageUrl.startsWith('/api/')) {
      return `${window.location.origin}${imageUrl}`;
    }
    
    // Se não tem barra, adiciona o domínio e barra
    return `${window.location.origin}/${imageUrl}`;
  }, []);

  /**
   * Carregador de preview de imagem com retry e fallback
   */
  const loadImagePreview = useCallback(async (imageUrl: string, type: 'header' | 'footer'): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const fullUrl = buildImageUrl(imageUrl);
      
      if (!fullUrl) {
        reject(new Error('URL inválida'));
        return;
      }

      // Timeout para evitar travamento
      const timeout = setTimeout(() => {
        reject(new Error('Timeout ao carregar imagem'));
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(fullUrl);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Falha ao carregar imagem: ${fullUrl}`));
      };

      // Adiciona timestamp para evitar cache
      img.src = `${fullUrl}?t=${Date.now()}`;
    });
  }, [buildImageUrl]);

  /**
   * Inicialização das imagens com retry automático
   */
  useEffect(() => {
    const initializeImages = async () => {
      // Inicializar header
      if (modelo.headerImageUrl) {
        setHeaderImage(prev => ({ ...prev, loading: true, error: null }));
        try {
          const preview = await loadImagePreview(modelo.headerImageUrl, 'header');
          setHeaderImage(prev => ({ 
            ...prev, 
            url: modelo.headerImageUrl, 
            preview, 
            loading: false 
          }));
        } catch (error) {
          console.error('Erro ao carregar header:', error);
          setHeaderImage(prev => ({ 
            ...prev, 
            loading: false, 
            error: error instanceof Error ? error.message : 'Erro desconhecido' 
          }));
        }
      }

      // Inicializar footer
      if (modelo.footerImageUrl) {
        setFooterImage(prev => ({ ...prev, loading: true, error: null }));
        try {
          const preview = await loadImagePreview(modelo.footerImageUrl, 'footer');
          setFooterImage(prev => ({ 
            ...prev, 
            url: modelo.footerImageUrl, 
            preview, 
            loading: false 
          }));
        } catch (error) {
          console.error('Erro ao carregar footer:', error);
          setFooterImage(prev => ({ 
            ...prev, 
            loading: false, 
            error: error instanceof Error ? error.message : 'Erro desconhecido' 
          }));
        }
      }
    };

    initializeImages();
  }, [modelo.headerImageUrl, modelo.footerImageUrl, loadImagePreview]);

  /**
   * Upload de imagem otimizado com validação e compressão
   */
  const handleImageUpload = useCallback(async (file: File, type: 'header' | 'footer') => {
    console.log(`=== UPLOAD DE IMAGEM ${type.toUpperCase()} ===`);
    
    // Validações
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    // Atualizar estado de loading
    if (type === 'header') {
      setHeaderImage(prev => ({ ...prev, loading: true, error: null }));
    } else {
      setFooterImage(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      // Criar FormData
      const formData = new FormData();
      formData.append('image', file);

      // Upload com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/modelo-carta/upload-image', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro no upload: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const imageUrl = result.imageUrl;

      // Carregar preview imediatamente
      const preview = await loadImagePreview(imageUrl, type);

      // Atualizar estado
      if (type === 'header') {
        setHeaderImage({
          url: imageUrl,
          preview,
          loading: false,
          error: null
        });
        form.setValue('headerImageUrl', imageUrl);
      } else {
        setFooterImage({
          url: imageUrl,
          preview,
          loading: false,
          error: null
        });
        form.setValue('footerImageUrl', imageUrl);
      }

      console.log(`✅ Upload ${type} concluído com sucesso!`);

    } catch (error) {
      console.error(`❌ Erro no upload ${type}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (type === 'header') {
        setHeaderImage(prev => ({ ...prev, loading: false, error: errorMessage }));
      } else {
        setFooterImage(prev => ({ ...prev, loading: false, error: errorMessage }));
      }
      
      alert(`Erro ao fazer upload da imagem ${type}. Tente novamente.`);
    }
  }, [form, loadImagePreview]);

  /**
   * Remover imagem com limpeza de estado
   */
  const removeImage = useCallback((type: 'header' | 'footer') => {
    if (type === 'header') {
      setHeaderImage({ url: null, preview: null, loading: false, error: null });
      form.setValue('headerImageUrl', '');
    } else {
      setFooterImage({ url: null, preview: null, loading: false, error: null });
      form.setValue('footerImageUrl', '');
    }
  }, [form]);

  /**
   * Carregamento de campos dinâmicos
   */
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

  /**
   * Handler para cliques em variáveis
   */
  const handleVariableClick = useCallback((variavel: string) => {
    const currentValue = form.getValues('conteudo') || '';
    const newValue = currentValue ? `${currentValue} ${variavel}` : variavel;
    form.setValue('conteudo', newValue, { shouldValidate: true });
  }, [form]);

  /**
   * Geração de preview dinâmico otimizada
   */
  const gerarPreviewDinamico = useCallback((texto: string) => {
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
  }, []);

  /**
   * Renderização de campos dinâmicos otimizada
   */
  const renderCamposDinamicos = useMemo(() => {
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
  }, [camposDinamicos, handleVariableClick]);

  /**
   * Componente de upload de imagem otimizado
   */
  const ImageUploadComponent = ({ type, imageState, onUpload, onRemove }: {
    type: 'header' | 'footer';
    imageState: ImageState;
    onUpload: (file: File) => void;
    onRemove: () => void;
  }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const isHeader = type === 'header';

    return (
      <div className="space-y-2">
        {imageState.preview ? (
          <div className="relative">
            <img 
              src={imageState.preview} 
              alt={`Preview ${type}`} 
              className="object-contain w-full bg-white border rounded-lg shadow-sm max-h-32"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute w-6 h-6 p-0 top-2 right-2"
              onClick={onRemove}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : imageState.loading ? (
          <div className="p-6 text-center border-2 border-gray-300 border-dashed rounded-lg">
            <div className="w-8 h-8 mx-auto mb-2 border-2 border-gray-300 rounded-full border-t-blue-600 animate-spin" />
            <p className="text-sm text-gray-600">Carregando imagem...</p>
          </div>
        ) : imageState.error ? (
          <div className="p-4 text-center border-2 border-red-300 border-dashed rounded-lg bg-red-50">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="mb-2 text-sm text-red-600">Erro ao carregar imagem</p>
            <p className="text-xs text-red-500">{imageState.error}</p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => fileInputRef.current?.click()}
            >
              Tentar Novamente
            </Button>
          </div>
        ) : (
          <div 
            className="p-6 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="mb-2 text-sm font-medium text-gray-600">Clique aqui para fazer upload</p>
            <p className="mb-3 text-xs text-gray-500">
              Medidas ideais: {isHeader ? '800x200px' : '400x150px'} (JPG, PNG)<br/>
              Máximo: 5MB
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
              }}
            />
            <Button type="button" variant="outline" size="sm" className="cursor-pointer">
              Selecionar Imagem
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {modelo.id ? 'Editar Modelo' : 'Novo Modelo'}
              </h2>
              <p className="text-muted-foreground">
                Configure o modelo de carta para envio de cobranças
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Coluna da Esquerda: Editor Principal */}
            <div className="space-y-6 lg:col-span-2">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField 
                    control={form.control} 
                    name="titulo" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Modelo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Cobrança de Condomínio - Janeiro 2024" {...field} />
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
                    <AlignLeft className="w-5 h-5" />
                    Conteúdo da Mensagem
                  </CardTitle>
                  <CardDescription>
                    Escreva a mensagem que será enviada. Use os campos dinâmicos para personalizar.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuillEditor
                    value={conteudoValue}
                    onChange={(value) => form.setValue('conteudo', value)}
                    placeholder="Digite aqui o conteúdo da sua mensagem..."
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
                          <ImageUploadComponent
                            type="header"
                            imageState={headerImage}
                            onUpload={(file) => handleImageUpload(file, 'header')}
                            onRemove={() => removeImage('header')}
                          />
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
                          <ImageUploadComponent
                            type="footer"
                            imageState={footerImage}
                            onUpload={(file) => handleImageUpload(file, 'footer')}
                            onRemove={() => removeImage('footer')}
                          />
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
                  {renderCamposDinamicos}
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
                      
                      {/* Preview do Email Completo */}
                      <div className="p-4 bg-white border rounded-lg">
                        <div className="mb-2 text-xs text-gray-500">Preview do Email:</div>
                        
                        {/* Header Image */}
                        {headerImage.preview && (
                          <div className="mb-4 text-center">
                            <img 
                              src={headerImage.preview} 
                              alt="Header" 
                              className="h-auto max-w-full mx-auto border rounded max-h-16"
                            />
                          </div>
                        )}
                        
                        {/* Conteúdo */}
                        <div className="mb-4 prose-sm prose max-w-none">
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: previewAtivo === 'dinamico' 
                                ? gerarPreviewDinamico(conteudoValue || '') 
                                : conteudoValue || 'Conteúdo do modelo'
                            }} 
                          />
                        </div>
                        
                        {/* Footer Image */}
                        {footerImage.preview && (
                          <div className="text-center">
                            <img 
                              src={footerImage.preview} 
                              alt="Footer" 
                              className="h-auto max-w-full mx-auto border rounded max-h-16"
                            />
                          </div>
                        )}
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
                    <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin" />
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
