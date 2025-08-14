'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ModeloCarta, ModeloFormData, modeloSchema } from '@/entities/modelos/types';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from '@/components/ui/dialog';
import { Trash2, Copy, Save, Info, CheckCircle, AlertCircle, Image as ImageIcon, Upload, X, Eye, EyeOff, Type, Link, Mail, Code, Globe } from 'lucide-react';
import { QuillEditor } from './QuillEditor';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { modeloCartaService } from '../services/modeloCartaService';

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
  url: string | null;           // URL real da imagem (para salvar no banco)
  preview: string | null;       // URL temporária para preview
  loading: boolean;
  error: string | null;
  cid?: string;                 // CID para envio de email
}

/**
* Componente ModeloEditor - Layout Mailchimp com Preview/Envio Separados
* 
* @description Editor com layout profissional estilo Mailchimp
* Preview usa URLs temporárias, envio usa CID
* @author Senior Software Engineer
* @version 4.0.0
*/
export const ModeloEditor = ({ modelo, onSave, onDelete, isSaving }: Props) => {
  // Estados para campos dinâmicos e preview
  const [camposDinamicos, setCamposDinamicos] = useState<CamposDinamicos | null>(null);
  const [previewAtivo, setPreviewAtivo] = useState<'estatico' | 'dinamico'>('dinamico');
  const [showPreview, setShowPreview] = useState(true);
  const [previewMode, setPreviewMode] = useState<'frontend' | 'email'>('frontend');

  // Estados otimizados para imagens
  const [headerImage, setHeaderImage] = useState<ImageState>({
    url: modelo.headerImageUrl || null,
    preview: null,
    loading: false,
    error: null,
    cid: `header_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });

  const [footerImage, setFooterImage] = useState<ImageState>({
    url: modelo.footerImageUrl || null,
    preview: null,
    loading: false,
    error: null,
    cid: `footer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
  * Construtor de URLs para preview (frontend)
  */
  const buildPreviewUrl = useCallback((imageUrl: string | null): string | null => {
    if (!imageUrl) return null;
    
    // Se já é uma URL completa, retorna como está
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Se é uma URL relativa (começa com /uploads/), adiciona o domínio correto
    if (imageUrl.startsWith('/uploads/')) {
      // Em produção, usa o mesmo domínio (proxy reverso)
      // Em desenvolvimento, usa a URL do backend
      if (window.location.hostname === 'app.raunaimer.adv.br') {
        // Produção: mesmo domínio (nginx faz o proxy)
        return imageUrl;
      } else {
        // Desenvolvimento: backend em porta diferente
        return `http://localhost:3001${imageUrl}`;
      }
    }
    
    // Se não tem o caminho completo, adiciona /uploads/images/
    return `/uploads/images/${imageUrl}`;
  }, []);

  /**
  * Construtor de URLs para envio de email (CID)
  */
  const buildEmailUrl = useCallback((imageUrl: string | null, cid: string): string | null => {
    if (!imageUrl) return null;
    
    // Para envio de email, sempre usa CID
    return `cid:${cid}`;
  }, []);

  /**
  * Carregador de preview de imagem com retry e fallback
  */
  const loadImagePreview = useCallback(async (imageUrl: string, type: 'header' | 'footer'): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const fullUrl = buildPreviewUrl(imageUrl);
      
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
  }, [buildPreviewUrl]);

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
      // Usa o novo serviço que gera URL temporária e CID
      const { cid, previewUrl } = await modeloCartaService.uploadImage(file);
      
      console.log(`✅ Upload ${type} concluído com sucesso!`);
      console.log(`🔗 URL temporária: ${previewUrl}`);
      console.log(`📧 CID: ${cid}`);

      // Construir URL completa para preview
      const fullPreviewUrl = buildPreviewUrl(previewUrl);
      
      // Atualizar estado com URL temporária e CID
      if (type === 'header') {
        setHeaderImage({
          url: previewUrl, // URL original do servidor
          preview: fullPreviewUrl, // URL completa para preview
          loading: false,
          error: null,
          cid: cid // CID para envio
        });
        form.setValue('headerImageUrl', previewUrl);
      } else {
        setFooterImage({
          url: previewUrl, // URL original do servidor
          preview: fullPreviewUrl, // URL completa para preview
          loading: false,
          error: null,
          cid: cid // CID para envio
        });
        form.setValue('footerImageUrl', previewUrl);
      }

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
  }, [form, buildPreviewUrl]);

  /**
  * Remover imagem com limpeza de estado
  */
  const removeImage = useCallback((type: 'header' | 'footer') => {
    if (type === 'header') {
      setHeaderImage({ url: null, preview: null, loading: false, error: null, cid: undefined });
      form.setValue('headerImageUrl', '');
    } else {
      setFooterImage({ url: null, preview: null, loading: false, error: null, cid: undefined });
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
              onError={(e) => {
                console.error(`Erro ao carregar imagem ${type}:`, imageState.preview);
                // Tenta recarregar a imagem uma vez
                const img = e.target as HTMLImageElement;
                if (!img.dataset.retried) {
                  img.dataset.retried = 'true';
                  img.src = `${imageState.preview}?retry=${Date.now()}`;
                }
              }}
              onLoad={() => {
                console.log(`Imagem ${type} carregada com sucesso:`, imageState.preview);
              }}
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
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-1 text-xs text-gray-500">
                URL: {imageState.preview}
              </div>
            )}
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

  /**
  * Gera o conteúdo para preview baseado no modo
  */
  const getPreviewContent = useCallback(() => {
    const baseContent = previewAtivo === 'dinamico' 
      ? gerarPreviewDinamico(conteudoValue || '') 
      : conteudoValue || 'Conteúdo do modelo';

    // Se for modo email, substitui as imagens por CID
    if (previewMode === 'email') {
      let content = baseContent;
      
      // Substitui imagens por CID no preview de email
      if (headerImage.cid) {
        content = content.replace(
          /<img[^>]*src="[^"]*"[^>]*>/gi,
          `<img src="${headerImage.cid}" alt="Header" style="max-width: 100%; height: auto;" />`
        );
      }
      
      if (footerImage.cid) {
        content = content.replace(
          /<img[^>]*src="[^"]*"[^>]*>/gi,
          `<img src="${footerImage.cid}" alt="Footer" style="max-width: 100%; height: auto;" />`
        );
      }
      
      return content;
    }
    
    // Modo frontend: usa URLs temporárias
    return baseContent;
  }, [previewAtivo, previewMode, conteudoValue, gerarPreviewDinamico, headerImage, footerImage]);

  // Estado para o conteúdo do preview
  const [previewContent, setPreviewContent] = useState<string>('');

  // Atualiza o preview quando necessário
  useEffect(() => {
    const updatePreview = async () => {
      const content = await getPreviewContent();
      setPreviewContent(content);
    };
    
    updatePreview();
  }, [getPreviewContent]);

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

              {/* Imagem do Header - Estilo Mailchimp */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Imagem do Cabeçalho
                  </CardTitle>
                  <CardDescription>
                    Adicione uma imagem para o cabeçalho do email. Esta aparecerá no topo de todas as cobranças.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField 
                    control={form.control} 
                    name="headerImageUrl" 
                    render={({ field }) => (
                      <FormItem>
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
                </CardContent>
              </Card>

              {/* Editor de Conteúdo - Estilo Mailchimp */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
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

              {/* Imagem do Footer - Estilo Mailchimp */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Imagem do Rodapé/Assinatura
                  </CardTitle>
                  <CardDescription>
                    Adicione uma imagem para o rodapé do email. Esta aparecerá no final de todas as cobranças.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField 
                    control={form.control} 
                    name="footerImageUrl" 
                    render={({ field }) => (
                      <FormItem>
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
                      {/* Controles de Preview */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={previewAtivo === 'estatico' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreviewAtivo('estatico')}
                          >
                            Estático
                          </Button>
                          <Button
                            type="button"
                            variant={previewAtivo === 'dinamico' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreviewAtivo('dinamico')}
                          >
                            Dinâmico
                          </Button>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={previewMode === 'frontend' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreviewMode('frontend')}
                            className="flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3" />
                            Frontend
                          </Button>
                          <Button
                            type="button"
                            variant={previewMode === 'email' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreviewMode('email')}
                            className="flex items-center gap-1"
                          >
                            <Code className="w-3 h-3" />
                            Email (CID)
                          </Button>
                        </div>
                      </div>
                      
                      {/* Preview do Email Completo - Estilo Mailchimp */}
                      <div className="p-4 bg-white border rounded-lg">
                        <div className="mb-2 text-xs text-gray-500">
                          Preview do Email: {previewMode === 'frontend' ? 'Frontend (URLs)' : 'Email (CID)'}
                        </div>
                        
                        {/* Header Image */}
                        {headerImage.preview && previewMode === 'frontend' && (
                          <div className="mb-4 text-center">
                            <img 
                              src={headerImage.preview} 
                              alt="Header" 
                              className="h-auto max-w-full mx-auto border rounded max-h-16"
                            />
                          </div>
                        )}
                        
                        {headerImage.cid && previewMode === 'email' && (
                          <div className="p-2 mb-4 text-center border border-blue-200 rounded bg-blue-50">
                            <div className="font-mono text-xs text-blue-600">
                              [Header Image: cid:{headerImage.cid}]
                            </div>
                          </div>
                        )}
                        
                        {/* Conteúdo */}
                        <div className="mb-4 prose-sm prose max-w-none">
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: previewContent
                            }} 
                          />
                        </div>
                        
                        {/* Footer Image */}
                        {footerImage.preview && previewMode === 'frontend' && (
                          <div className="text-center">
                            <img 
                              src={footerImage.preview} 
                              alt="Footer" 
                              className="h-auto max-w-full mx-auto border rounded max-h-16"
                            />
                          </div>
                        )}
                        
                        {footerImage.cid && previewMode === 'email' && (
                          <div className="p-2 text-center border border-blue-200 rounded bg-blue-50">
                            <div className="font-mono text-xs text-blue-600">
                              [Footer Image: cid:{footerImage.cid}]
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Informações Técnicas */}
                      <Alert>
                        <Info className="w-4 h-4" />
                        <AlertDescription>
                          <strong>Modo {previewMode === 'frontend' ? 'Frontend' : 'Email'}:</strong>
                          {previewMode === 'frontend' 
                            ? ' Mostra como aparecerá no navegador usando URLs temporárias.'
                            : ' Mostra como será enviado no email usando CID (Content-ID).'
                          }
                        </AlertDescription>
                      </Alert>
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