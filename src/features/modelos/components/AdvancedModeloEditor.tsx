'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ModeloCarta, ModeloFormData, modeloSchema } from '@/entities/modelos/types';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from '@/components/ui/dialog';
import { 
  Trash2, Copy, Save, Info, CheckCircle, AlertCircle, Image as ImageIcon, 
  Upload, X, Eye, EyeOff, Type, Link, Mail, Code, Globe, Download, 
  Palette, Layout, Smartphone, Monitor, Send, Settings, Zap, 
  FileText, Calendar, User, Building, DollarSign, Clock
} from 'lucide-react';
import { QuillEditor } from './QuillEditor';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { modeloCartaService } from '../services/modeloCartaService';
import { useToast } from '@/hooks/use-toast';

interface Props {
  modelo: Partial<ModeloCarta>;
  onSave: (data: ModeloFormData) => void;
  onDelete: (id: string) => void;
  isSaving?: boolean;
}

interface CampoDinamico {
  placeholder: string;
  descricao: string;
  categoria: 'morador' | 'condominio' | 'cobranca' | 'datas';
  icone: React.ReactNode;
}

interface CamposDinamicos {
  morador: CampoDinamico[];
  condominio: CampoDinamico[];
  cobranca: CampoDinamico[];
  datas: CampoDinamico[];
}

interface ImageState {
  url: string | null;
  preview: string | null;
  loading: boolean;
  error: string | null;
  cid?: string;
  progress: number;
}

interface PreviewMode {
  type: 'frontend' | 'email' | 'mobile' | 'desktop';
  showImages: boolean;
  showVariables: boolean;
}

/**
 * Editor Avançado de Modelos - Versão 5.0
 * 
 * @description Editor profissional com preview em tempo real, upload otimizado
 * e interface moderna estilo Mailchimp
 * @author Senior Software Engineer
 * @version 5.0.0
 */
export const AdvancedModeloEditor = ({ modelo, onSave, onDelete, isSaving }: Props) => {
  const { toast } = useToast();
  const headerFileInputRef = useRef<HTMLInputElement>(null);
  const footerFileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Estados principais
  const [camposDinamicos, setCamposDinamicos] = useState<CamposDinamicos | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [previewMode, setPreviewMode] = useState<PreviewMode>({
    type: 'desktop',
    showImages: true,
    showVariables: true
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Estados de imagem otimizados
  const [headerImage, setHeaderImage] = useState<ImageState>({
    url: modelo.headerImageUrl || null,
    preview: null,
    loading: false,
    error: null,
    cid: `header_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    progress: 0
  });

  const [footerImage, setFooterImage] = useState<ImageState>({
    url: modelo.footerImageUrl || null,
    preview: null,
    loading: false,
    error: null,
    cid: `footer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    progress: 0
  });

  // Formulário com validação avançada
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
   * Construtor de URLs otimizado
   */
  const buildPreviewUrl = useCallback((imageUrl: string | null): string | null => {
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Se já tem o prefixo completo, retorna como está
    if (imageUrl.startsWith('/api/static/uploads/')) {
      return imageUrl;
    }
    
    // Se tem apenas o nome do arquivo, adiciona o caminho completo
    if (!imageUrl.includes('/')) {
      return `/api/static/uploads/images/${imageUrl}`;
    }
    
    // Se tem caminho relativo, converte para o formato correto
    if (imageUrl.startsWith('/uploads/')) {
      return imageUrl.replace('/uploads/', '/api/static/uploads/');
    }
    
    // Fallback: assume que é apenas o nome do arquivo
    return `/api/static/uploads/images/${imageUrl}`;
  }, []);

  /**
   * Upload de imagem com progresso e retry
   */
  const handleImageUpload = useCallback(async (file: File, type: 'header' | 'footer') => {
    console.log(`=== UPLOAD AVANÇADO ${type.toUpperCase()} ===`);
    
    // Validações avançadas
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas imagens (JPG, PNG, GIF, WebP)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive"
      });
      return;
    }

    // Atualizar estado de loading com progresso
    const setImageState = type === 'header' ? setHeaderImage : setFooterImage;
    setImageState(prev => ({ ...prev, loading: true, error: null, progress: 0 }));

    try {
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setImageState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 100);

      const { cid, previewUrl } = await modeloCartaService.uploadImage(file);
      
      clearInterval(progressInterval);
      setImageState(prev => ({ ...prev, progress: 100 }));

      const fullPreviewUrl = buildPreviewUrl(previewUrl);
      
      setImageState({
        url: previewUrl,
        preview: fullPreviewUrl,
        loading: false,
        error: null,
        cid: cid,
        progress: 100
      });

      form.setValue(type === 'header' ? 'headerImageUrl' : 'footerImageUrl', previewUrl);

      toast({
        title: "Upload concluído!",
        description: `Imagem ${type} carregada com sucesso`,
        variant: "default"
      });

      // Reset progresso após 1 segundo
      setTimeout(() => {
        setImageState(prev => ({ ...prev, progress: 0 }));
      }, 1000);

    } catch (error) {
      console.error(`❌ Erro no upload ${type}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setImageState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage,
        progress: 0
      }));
      
      toast({
        title: "Erro no upload",
        description: `Falha ao fazer upload da imagem ${type}`,
        variant: "destructive"
      });
    }
  }, [form, buildPreviewUrl, toast]);

  /**
   * Drag & Drop handlers
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'header' | 'footer') => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageUpload(imageFile, type);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, arraste apenas arquivos de imagem",
        variant: "destructive"
      });
    }
  }, [handleImageUpload, toast]);

  /**
   * Remover imagem com confirmação
   */
  const removeImage = useCallback((type: 'header' | 'footer') => {
    if (confirm(`Tem certeza que deseja remover a imagem ${type}?`)) {
      const setImageState = type === 'header' ? setHeaderImage : setFooterImage;
      setImageState({ url: null, preview: null, loading: false, error: null, cid: undefined, progress: 0 });
      form.setValue(type === 'header' ? 'headerImageUrl' : 'footerImageUrl', '');
      
      toast({
        title: "Imagem removida",
        description: `Imagem ${type} removida com sucesso`,
        variant: "default"
      });
    }
  }, [form, toast]);

  /**
   * Carregamento de campos dinâmicos com ícones
   */
  useEffect(() => {
    const carregarCamposDinamicos = async () => {
      try {
        const response = await fetch('/api/modelo-carta/campos-dinamicos');
        const data = await response.json();
        
        // Adicionar ícones aos campos
        const camposComIcones = {
          morador: data.morador?.map((campo: CampoDinamico) => ({
            ...campo,
            categoria: 'morador' as const,
            icone: <User className="w-3 h-3" />
          })) || [],
          condominio: data.condominio?.map((campo: CampoDinamico) => ({
            ...campo,
            categoria: 'condominio' as const,
            icone: <Building className="w-3 h-3" />
          })) || [],
          cobranca: data.cobranca?.map((campo: CampoDinamico) => ({
            ...campo,
            categoria: 'cobranca' as const,
            icone: <DollarSign className="w-3 h-3" />
          })) || [],
          datas: data.datas?.map((campo: CampoDinamico) => ({
            ...campo,
            categoria: 'datas' as const,
            icone: <Calendar className="w-3 h-3" />
          })) || []
        };
        
        setCamposDinamicos(camposComIcones);
      } catch (error) {
        console.error('Erro ao carregar campos dinâmicos:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar campos dinâmicos",
          variant: "destructive"
        });
      }
    };

    carregarCamposDinamicos();
  }, [toast]);

  /**
   * Inicialização das imagens existentes
   */
  useEffect(() => {
    const initializeImages = async () => {
      if (modelo.headerImageUrl) {
        const preview = buildPreviewUrl(modelo.headerImageUrl);
        setHeaderImage(prev => ({ 
          ...prev, 
          url: modelo.headerImageUrl, 
          preview 
        }));
      }

      if (modelo.footerImageUrl) {
        const preview = buildPreviewUrl(modelo.footerImageUrl);
        setFooterImage(prev => ({ 
          ...prev, 
          url: modelo.footerImageUrl, 
          preview 
        }));
      }
    };

    initializeImages();
  }, [modelo.headerImageUrl, modelo.footerImageUrl, buildPreviewUrl]);

  /**
   * Auto-save
   */
  useEffect(() => {
    if (!autoSave) return;

    const autoSaveInterval = setInterval(() => {
      if (form.formState.isDirty) {
        const formData = form.getValues();
        onSave(formData);
        setLastSaved(new Date());
        
        toast({
          title: "Auto-save",
          description: "Alterações salvas automaticamente",
          variant: "default"
        });
      }
    }, 30000); // Auto-save a cada 30 segundos

    return () => clearInterval(autoSaveInterval);
  }, [autoSave, form, onSave, toast]);

  /**
   * Handler para cliques em variáveis
   */
  const handleVariableClick = useCallback((variavel: string) => {
    const currentValue = form.getValues('conteudo') || '';
    const newValue = currentValue ? `${currentValue} ${variavel}` : variavel;
    form.setValue('conteudo', newValue, { shouldValidate: true });
    
    toast({
      title: "Variável inserida",
      description: `Campo ${variavel} adicionado ao conteúdo`,
      variant: "default"
    });
  }, [form, toast]);

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
   * Componente de upload de imagem avançado
   */
  const AdvancedImageUpload = ({ type, imageState, onUpload, onRemove }: {
    type: 'header' | 'footer';
    imageState: ImageState;
    onUpload: (file: File) => void;
    onRemove: () => void;
  }) => {
    const isHeader = type === 'header';
    const recommendedSize = isHeader ? '800x200px' : '400x150px';

    return (
      <div className="space-y-3">
        {imageState.preview ? (
          <div className="relative group">
            <img 
              src={imageState.preview} 
              alt={`Preview ${type}`} 
              className="object-contain w-full transition-all bg-white border rounded-lg shadow-sm max-h-32 group-hover:shadow-md"
            />
            
            {/* Overlay com ações */}
            <div className="absolute inset-0 flex items-center justify-center transition-opacity rounded-lg opacity-0 group-hover:opacity-100 bg-black/20">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => isHeader ? headerFileInputRef.current?.click() : footerFileInputRef.current?.click()}
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Trocar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={onRemove}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remover
                </Button>
              </div>
            </div>

            {/* Info técnica */}
            <div className="mt-2 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>CID: {imageState.cid}</span>
                <span>URL: {imageState.url}</span>
              </div>
            </div>
          </div>
        ) : imageState.loading ? (
          <div className="p-6 text-center border-2 border-gray-300 border-dashed rounded-lg">
            <div className="w-8 h-8 mx-auto mb-2 border-2 border-gray-300 rounded-full border-t-blue-600 animate-spin" />
            <p className="mb-2 text-sm text-gray-600">Carregando imagem...</p>
            <Progress value={imageState.progress} className="w-full" />
            <p className="mt-1 text-xs text-gray-500">{imageState.progress}%</p>
          </div>
        ) : imageState.error ? (
          <div className="p-4 text-center border-2 border-red-300 border-dashed rounded-lg bg-red-50">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="mb-2 text-sm text-red-600">Erro ao carregar imagem</p>
            <p className="mb-3 text-xs text-red-500">{imageState.error}</p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => isHeader ? headerFileInputRef.current?.click() : footerFileInputRef.current?.click()}
            >
              Tentar Novamente
            </Button>
          </div>
        ) : (
          <div 
            ref={dropZoneRef}
            className={`p-6 text-center transition-all border-2 border-dashed rounded-lg cursor-pointer ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, type)}
            onClick={() => isHeader ? headerFileInputRef.current?.click() : footerFileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="mb-2 text-sm font-medium text-gray-600">
              Clique ou arraste uma imagem aqui
            </p>
            <p className="mb-3 text-xs text-gray-500">
              Medidas recomendadas: {recommendedSize}<br/>
              Formatos: JPG, PNG, GIF, WebP<br/>
              Máximo: 5MB
            </p>
            <Button type="button" variant="outline" size="sm">
              Selecionar Imagem
            </Button>
          </div>
        )}
        
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={isHeader ? headerFileInputRef : footerFileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
      </div>
    );
  };

  /**
   * Renderização de campos dinâmicos com categorias
   */
  const renderCamposDinamicos = useMemo(() => {
    if (!camposDinamicos) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="w-6 h-6 mr-2 border-2 border-gray-300 rounded-full border-t-blue-600 animate-spin" />
          <span className="text-sm text-gray-500">Carregando campos dinâmicos...</span>
        </div>
      );
    }

    const categorias = [
      { key: 'morador', title: 'Dados do Morador', icon: <User className="w-4 h-4" /> },
      { key: 'condominio', title: 'Dados do Condomínio', icon: <Building className="w-4 h-4" /> },
      { key: 'cobranca', title: 'Dados da Cobrança', icon: <DollarSign className="w-4 h-4" /> },
      { key: 'datas', title: 'Datas', icon: <Calendar className="w-4 h-4" /> }
    ];

    return (
      <div className="space-y-4">
        {categorias.map(({ key, title, icon }) => (
          <div key={key}>
            <h4 className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
              {icon}
              {title}
            </h4>
            <div className="flex flex-wrap gap-1">
              {camposDinamicos[key as keyof CamposDinamicos]?.map((campo, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="transition-colors cursor-pointer hover:bg-gray-100"
                        onClick={() => handleVariableClick(campo.placeholder)}
                      >
                        {campo.icone}
                        <span className="ml-1">{campo.placeholder}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{campo.descricao}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }, [camposDinamicos, handleVariableClick]);

  /**
   * Gera o conteúdo para preview
   */
  const getPreviewContent = useCallback(() => {
    const baseContent = previewMode.showVariables 
      ? gerarPreviewDinamico(conteudoValue || '') 
      : conteudoValue || 'Conteúdo do modelo';

    if (previewMode.type === 'email') {
      let content = baseContent;
      
      if (headerImage.cid && previewMode.showImages) {
        content = content.replace(
          /<img[^>]*src="[^"]*"[^>]*>/gi,
          `<img src="cid:${headerImage.cid}" alt="Header" style="max-width: 100%; height: auto;" />`
        );
      }
      
      if (footerImage.cid && previewMode.showImages) {
        content = content.replace(
          /<img[^>]*src="[^"]*"[^>]*>/gi,
          `<img src="cid:${footerImage.cid}" alt="Footer" style="max-width: 100%; height: auto;" />`
        );
      }
      
      return content;
    }
    
    return baseContent;
  }, [previewMode, conteudoValue, gerarPreviewDinamico, headerImage, footerImage]);

  /**
   * Gera o título processado para preview
   */
  const getPreviewTitle = useCallback(() => {
    if (previewMode.showVariables) {
      return gerarPreviewDinamico(tituloValue || '');
    }
    return tituloValue || 'Título do modelo';
  }, [previewMode.showVariables, tituloValue, gerarPreviewDinamico]);

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
          {/* Cabeçalho com informações */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                <FileText className="w-6 h-6" />
                {modelo.id ? 'Editar Modelo' : 'Novo Modelo'}
              </h2>
              <p className="text-muted-foreground">
                Editor avançado com preview em tempo real e upload otimizado
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
                <Label htmlFor="auto-save">Auto-save</Label>
              </div>
              
              {lastSaved && (
                <div className="text-xs text-gray-500">
                  Último save: {lastSaved.toLocaleTimeString()}
                </div>
              )}
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
                          <div className="space-y-2">
                            <Input 
                              placeholder="Ex: Cobrança de Condomínio - Janeiro 2024" 
                              {...field} 
                            />
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs text-gray-500 mr-2">Campos dinâmicos:</span>
                              {camposDinamicos && (
                                <>
                                  <Badge
                                    variant="outline"
                                    className="transition-colors cursor-pointer hover:bg-gray-100 text-xs"
                                    onClick={() => {
                                      const currentValue = field.value || '';
                                      const newValue = currentValue ? `${currentValue} {{nome_condominio}}` : '{{nome_condominio}}';
                                      field.onChange(newValue);
                                    }}
                                  >
                                    nome_condominio
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="transition-colors cursor-pointer hover:bg-gray-100 text-xs"
                                    onClick={() => {
                                      const currentValue = field.value || '';
                                      const newValue = currentValue ? `${currentValue} {{mes_referencia}}` : '{{mes_referencia}}';
                                      field.onChange(newValue);
                                    }}
                                  >
                                    mes_referencia
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="transition-colors cursor-pointer hover:bg-gray-100 text-xs"
                                    onClick={() => {
                                      const currentValue = field.value || '';
                                      const newValue = currentValue ? `${currentValue} {{data_atual}}` : '{{data_atual}}';
                                      field.onChange(newValue);
                                    }}
                                  >
                                    data_atual
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                </CardContent>
              </Card>

              {/* Imagem do Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Imagem do Cabeçalho
                  </CardTitle>
                  <CardDescription>
                    Adicione uma imagem para o cabeçalho do email. Suporte a drag & drop.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField 
                    control={form.control} 
                    name="headerImageUrl" 
                    render={({ field }) => (
                      <FormItem>
                        <AdvancedImageUpload
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

              {/* Editor de Conteúdo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Conteúdo da Mensagem
                  </CardTitle>
                  <CardDescription>
                    Editor rico com suporte a formatação e campos dinâmicos
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

              {/* Imagem do Footer */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Imagem do Rodapé/Assinatura
                  </CardTitle>
                  <CardDescription>
                    Adicione uma imagem para o rodapé do email. Suporte a drag & drop.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField 
                    control={form.control} 
                    name="footerImageUrl" 
                    render={({ field }) => (
                      <FormItem>
                        <AdvancedImageUpload
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
                    Clique nos campos para inserir no conteúdo. Eles serão substituídos pelos dados reais.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderCamposDinamicos}
                </CardContent>
              </Card>

              {/* Pré-visualização Avançada */}
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
                  <CardDescription>
                    Visualize como sua mensagem aparecerá
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showPreview ? (
                    <div className="space-y-4">
                      {/* Controles de Preview */}
                      <div className="space-y-3">
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant={previewMode.type === 'desktop' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreviewMode(prev => ({ ...prev, type: 'desktop' }))}
                            className="flex items-center gap-1"
                          >
                            <Monitor className="w-3 h-3" />
                            Desktop
                          </Button>
                          <Button
                            type="button"
                            variant={previewMode.type === 'mobile' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreviewMode(prev => ({ ...prev, type: 'mobile' }))}
                            className="flex items-center gap-1"
                          >
                            <Smartphone className="w-3 h-3" />
                            Mobile
                          </Button>
                          <Button
                            type="button"
                            variant={previewMode.type === 'email' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreviewMode(prev => ({ ...prev, type: 'email' }))}
                            className="flex items-center gap-1"
                          >
                            <Code className="w-3 h-3" />
                            Email
                          </Button>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={previewMode.showImages ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreviewMode(prev => ({ ...prev, showImages: !prev.showImages }))}
                          >
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Imagens
                          </Button>
                          <Button
                            type="button"
                            variant={previewMode.showVariables ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreviewMode(prev => ({ ...prev, showVariables: !prev.showVariables }))}
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Variáveis
                          </Button>
                        </div>
                      </div>
                      
                      {/* Preview do Email */}
                      <div className={`p-4 bg-white border rounded-lg ${
                        previewMode.type === 'mobile' ? 'max-w-sm mx-auto' : ''
                      }`}>
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                          <span>Preview: {previewMode.type}</span>
                          {previewMode.showImages && <ImageIcon className="w-3 h-3" />}
                          {previewMode.showVariables && <Zap className="w-3 h-3" />}
                        </div>
                        
                        {/* Header Image */}
                        {headerImage.preview && previewMode.showImages && previewMode.type !== 'email' && (
                          <div className="mb-4 text-center">
                            <img 
                              src={headerImage.preview} 
                              alt="Header" 
                              className="h-auto max-w-full mx-auto border rounded max-h-16"
                            />
                          </div>
                        )}
                        
                        {headerImage.cid && previewMode.showImages && previewMode.type === 'email' && (
                          <div className="p-2 mb-4 text-center border border-blue-200 rounded bg-blue-50">
                            <div className="font-mono text-xs text-blue-600">
                              [Header: cid:{headerImage.cid}]
                            </div>
                          </div>
                        )}
                        
                        {/* Título do Email */}
                        {previewMode.showVariables && (
                          <div className="mb-4 p-3 bg-gray-50 border rounded">
                            <div className="text-sm font-medium text-gray-700 mb-1">Assunto do Email:</div>
                            <div className="text-sm text-gray-900">{getPreviewTitle()}</div>
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
                        {footerImage.preview && previewMode.showImages && previewMode.type !== 'email' && (
                          <div className="text-center">
                            <img 
                              src={footerImage.preview} 
                              alt="Footer" 
                              className="h-auto max-w-full mx-auto border rounded max-h-16"
                            />
                          </div>
                        )}
                        
                        {footerImage.cid && previewMode.showImages && previewMode.type === 'email' && (
                          <div className="p-2 text-center border border-blue-200 rounded bg-blue-50">
                            <div className="font-mono text-xs text-blue-600">
                              [Footer: cid:{footerImage.cid}]
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Informações Técnicas */}
                      <Alert>
                        <Info className="w-4 h-4" />
                        <AlertDescription>
                          <strong>Modo {previewMode.type}:</strong>
                          {previewMode.type === 'email' 
                            ? ' Simula como será enviado no email usando CID.'
                            : previewMode.type === 'mobile'
                            ? ' Mostra como aparecerá em dispositivos móveis.'
                            : ' Mostra como aparecerá no desktop.'
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
                    toast({
                      title: "Copiado!",
                      description: "Conteúdo copiado para a área de transferência",
                      variant: "default"
                    });
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
