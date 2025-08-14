'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, EyeOff, Monitor, Smartphone, Mail, Code, Image as ImageIcon, 
  Zap, Download, Copy, CheckCircle, AlertCircle, Info, Globe
} from 'lucide-react';
import { modeloCartaService } from '../services/modeloCartaService';
import { useToast } from '@/hooks/use-toast';

interface EmailPreviewProps {
  htmlContent: string;
  headerImageUrl?: string;
  footerImageUrl?: string;
  showPreview?: boolean;
  onTogglePreview?: (show: boolean) => void;
}

interface PreviewMode {
  type: 'desktop' | 'mobile' | 'email' | 'code';
  showImages: boolean;
  showVariables: boolean;
}

interface ProcessedTemplate {
  html: string;
  attachments: Array<{ filename: string; cid: string; size: number }>;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  htmlContent,
  headerImageUrl,
  footerImageUrl,
  showPreview = true,
  onTogglePreview
}) => {
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState<PreviewMode>({
    type: 'desktop',
    showImages: true,
    showVariables: true
  });
  const [processedTemplate, setProcessedTemplate] = useState<ProcessedTemplate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    header: boolean | null;
    footer: boolean | null;
  } | null>(null);

  /**
   * Gera preview dinâmico com dados de exemplo
   */
  const generateDynamicPreview = useCallback((content: string): string => {
    return content
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
   * Processa o template para envio de email
   */
  const processTemplateForEmail = useCallback(async () => {
    if (!htmlContent) return;

    setIsProcessing(true);
    try {
      const result = await modeloCartaService.processEmailTemplate({
        htmlContent: previewMode.showVariables ? generateDynamicPreview(htmlContent) : htmlContent,
        headerImageUrl,
        footerImageUrl
      });

      setProcessedTemplate(result);
      toast({
        title: "Template processado!",
        description: `${result.attachments.length} anexos preparados para envio`,
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao processar template:', error);
      toast({
        title: "Erro no processamento",
        description: "Falha ao processar template para email",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [htmlContent, headerImageUrl, footerImageUrl, previewMode.showVariables, generateDynamicPreview, toast]);

  /**
   * Valida as imagens do template
   */
  const validateImages = useCallback(async () => {
    try {
      const results = await modeloCartaService.validateImages(headerImageUrl, footerImageUrl);
      setValidationResults(results);
      
      const validCount = [results.header, results.footer].filter(Boolean).length;
      toast({
        title: "Validação concluída",
        description: `${validCount} de 2 imagens válidas`,
        variant: validCount === 2 ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Erro na validação:', error);
      toast({
        title: "Erro na validação",
        description: "Falha ao validar imagens",
        variant: "destructive"
      });
    }
  }, [headerImageUrl, footerImageUrl, toast]);

  /**
   * Copia o HTML processado para a área de transferência
   */
  const copyProcessedHtml = useCallback(async () => {
    if (!processedTemplate) return;

    try {
      await navigator.clipboard.writeText(processedTemplate.html);
      toast({
        title: "Copiado!",
        description: "HTML processado copiado para a área de transferência",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Falha ao copiar HTML",
        variant: "destructive"
      });
    }
  }, [processedTemplate, toast]);

  /**
   * Gera o conteúdo para preview
   */
  const getPreviewContent = useCallback((): string => {
    let content = previewMode.showVariables 
      ? generateDynamicPreview(htmlContent) 
      : htmlContent;

    if (previewMode.type === 'email' && processedTemplate) {
      return processedTemplate.html;
    }

    return content;
  }, [htmlContent, previewMode, generateDynamicPreview, processedTemplate]);

  // Processar template quando mudar o modo
  useEffect(() => {
    if (previewMode.type === 'email') {
      processTemplateForEmail();
    }
  }, [previewMode.type, processTemplateForEmail]);

  // Validar imagens quando mudar
  useEffect(() => {
    if (headerImageUrl || footerImageUrl) {
      validateImages();
    }
  }, [headerImageUrl, footerImageUrl, validateImages]);

  if (!showPreview) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Pré-visualização
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTogglePreview?.(true)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            <EyeOff className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Pré-visualização desativada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Pré-visualização Avançada
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePreview?.(false)}
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          Visualize como sua mensagem aparecerá em diferentes dispositivos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
              <Mail className="w-3 h-3" />
              Email
            </Button>
            <Button
              type="button"
              variant={previewMode.type === 'code' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode(prev => ({ ...prev, type: 'code' }))}
              className="flex items-center gap-1"
            >
              <Code className="w-3 h-3" />
              Código
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

        {/* Status das Imagens */}
        {validationResults && (
          <div className="flex gap-2">
            {headerImageUrl && (
              <Badge variant={validationResults.header ? "default" : "destructive"}>
                {validationResults.header ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                Header
              </Badge>
            )}
            {footerImageUrl && (
              <Badge variant={validationResults.footer ? "default" : "destructive"}>
                {validationResults.footer ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                Footer
              </Badge>
            )}
          </div>
        )}

        {/* Preview do Email */}
        <Tabs value={previewMode.type} onValueChange={(value) => setPreviewMode(prev => ({ ...prev, type: value as any }))}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="desktop">Desktop</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="code">Código</TabsTrigger>
          </TabsList>

          <TabsContent value="desktop" className="space-y-4">
            <div className="p-4 bg-white border rounded-lg">
              <div className="mb-2 text-xs text-gray-500 flex items-center gap-2">
                <Monitor className="w-3 h-3" />
                <span>Preview Desktop</span>
                {previewMode.showImages && <ImageIcon className="w-3 h-3" />}
                {previewMode.showVariables && <Zap className="w-3 h-3" />}
              </div>
              
              {/* Header Image */}
              {headerImageUrl && previewMode.showImages && (
                <div className="mb-4 text-center">
                  <img 
                    src={headerImageUrl.startsWith('http') ? headerImageUrl : `/api/static${headerImageUrl}`}
                    alt="Header" 
                    className="h-auto max-w-full mx-auto border rounded max-h-16"
                  />
                </div>
              )}
              
              {/* Conteúdo */}
              <div className="mb-4 prose-sm prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: getPreviewContent() }} />
              </div>
              
              {/* Footer Image */}
              {footerImageUrl && previewMode.showImages && (
                <div className="text-center">
                  <img 
                    src={footerImageUrl.startsWith('http') ? footerImageUrl : `/api/static${footerImageUrl}`}
                    alt="Footer" 
                    className="h-auto max-w-full mx-auto border rounded max-h-16"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-4">
            <div className="max-w-sm mx-auto p-4 bg-white border rounded-lg">
              <div className="mb-2 text-xs text-gray-500 flex items-center gap-2">
                <Smartphone className="w-3 h-3" />
                <span>Preview Mobile</span>
                {previewMode.showImages && <ImageIcon className="w-3 h-3" />}
                {previewMode.showVariables && <Zap className="w-3 h-3" />}
              </div>
              
              {/* Header Image */}
              {headerImageUrl && previewMode.showImages && (
                <div className="mb-4 text-center">
                  <img 
                    src={headerImageUrl.startsWith('http') ? headerImageUrl : `/api/static${headerImageUrl}`}
                    alt="Header" 
                    className="h-auto w-full mx-auto border rounded max-h-12"
                  />
                </div>
              )}
              
              {/* Conteúdo */}
              <div className="mb-4 prose-sm prose max-w-none text-sm">
                <div dangerouslySetInnerHTML={{ __html: getPreviewContent() }} />
              </div>
              
              {/* Footer Image */}
              {footerImageUrl && previewMode.showImages && (
                <div className="text-center">
                  <img 
                    src={footerImageUrl.startsWith('http') ? footerImageUrl : `/api/static${footerImageUrl}`}
                    alt="Footer" 
                    className="h-auto w-full mx-auto border rounded max-h-12"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="p-4 bg-white border rounded-lg">
              <div className="mb-2 text-xs text-gray-500 flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span>Preview Email (CID)</span>
                {isProcessing && <div className="w-3 h-3 border-2 border-blue-600 rounded-full border-t-transparent animate-spin" />}
              </div>
              
              {isProcessing ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 mx-auto mb-2 border-2 border-gray-300 rounded-full border-t-blue-600 animate-spin" />
                  <p className="text-sm text-gray-600">Processando template para email...</p>
                </div>
              ) : processedTemplate ? (
                <>
                  {/* Header Image CID */}
                  {headerImageUrl && previewMode.showImages && (
                    <div className="p-2 mb-4 text-center border border-blue-200 rounded bg-blue-50">
                      <div className="font-mono text-xs text-blue-600">
                        [Header: cid:{processedTemplate.attachments.find(a => a.filename.includes('header'))?.cid || 'header_cid'}]
                      </div>
                    </div>
                  )}
                  
                  {/* Conteúdo */}
                  <div className="mb-4 prose-sm prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: processedTemplate.html }} />
                  </div>
                  
                  {/* Footer Image CID */}
                  {footerImageUrl && previewMode.showImages && (
                    <div className="p-2 text-center border border-blue-200 rounded bg-blue-50">
                      <div className="font-mono text-xs text-blue-600">
                        [Footer: cid:{processedTemplate.attachments.find(a => a.filename.includes('footer'))?.cid || 'footer_cid'}]
                      </div>
                    </div>
                  )}
                  
                  {/* Informações dos Anexos */}
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <h4 className="text-sm font-medium mb-2">Anexos Preparados:</h4>
                    <div className="space-y-1">
                      {processedTemplate.attachments.map((att, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          📎 {att.filename} (CID: {att.cid}) - {att.size} bytes
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Clique em "Email" para processar o template</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <div className="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm overflow-auto max-h-96">
              <div className="mb-2 text-xs text-gray-400">
                HTML Processado para Email:
              </div>
              <pre className="whitespace-pre-wrap">
                {processedTemplate?.html || getPreviewContent()}
              </pre>
            </div>
            
            {processedTemplate && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyProcessedHtml}
                  className="flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copiar HTML
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([processedTemplate.html], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'template-email.html';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Baixar HTML
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Informações Técnicas */}
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            <strong>Modo {previewMode.type}:</strong>
            {previewMode.type === 'email' 
              ? ' Simula como será enviado no email usando CID (Content-ID).'
              : previewMode.type === 'mobile'
              ? ' Mostra como aparecerá em dispositivos móveis.'
              : previewMode.type === 'code'
              ? ' Exibe o código HTML processado.'
              : ' Mostra como aparecerá no desktop.'
            }
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
