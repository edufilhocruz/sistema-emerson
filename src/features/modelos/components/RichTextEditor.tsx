'use client';

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  Heading3, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Image as ImageIcon,
  Upload,
  X
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertImage = () => {
    if (imageUrl.trim()) {
      execCommand('insertImage', imageUrl);
      setImageUrl('');
      setShowImageUpload(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        execCommand('insertImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      execCommand('insertParagraph');
    }
  };

  // Inicializar o editor com o valor correto
  React.useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value || '';
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Atualizar o conteúdo quando o valor mudar externamente
  React.useEffect(() => {
    if (editorRef.current && isInitialized && editorRef.current.innerHTML !== value) {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const wasAtEnd = range && range.collapsed && range.startOffset === range.endOffset;
      
      editorRef.current.innerHTML = value || '';
      
      // Manter o cursor no final se estava no final
      if (wasAtEnd && editorRef.current.lastChild) {
        const newRange = document.createRange();
        newRange.selectNodeContents(editorRef.current);
        newRange.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(newRange);
      }
    }
  }, [value, isInitialized]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border rounded-lg bg-muted/50">
        {/* Formatação de texto */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('bold')}
          className="w-8 h-8 p-0"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('italic')}
          className="w-8 h-8 p-0"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('underline')}
          className="w-8 h-8 p-0"
        >
          <Underline className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 mx-1 bg-border" />

        {/* Cabeçalhos */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('formatBlock', '<h1>')}
          className="h-8 px-2 text-xs"
        >
          H1
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('formatBlock', '<h2>')}
          className="h-8 px-2 text-xs"
        >
          H2
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('formatBlock', '<h3>')}
          className="h-8 px-2 text-xs"
        >
          H3
        </Button>

        <div className="w-px h-6 mx-1 bg-border" />

        {/* Alinhamento */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('justifyLeft')}
          className="w-8 h-8 p-0"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('justifyCenter')}
          className="w-8 h-8 p-0"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('justifyRight')}
          className="w-8 h-8 p-0"
        >
          <AlignRight className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 mx-1 bg-border" />

        {/* Imagens */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowImageUpload(!showImageUpload)}
          className="w-8 h-8 p-0"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Upload de imagem */}
      {showImageUpload && (
        <Card className="p-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Upload className="w-4 h-4" />
              Inserir Imagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="image-url">URL da imagem:</Label>
              <div className="flex gap-2">
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="flex-1"
                />
                <Button type="button" size="sm" onClick={insertImage}>
                  Inserir
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-upload">Ou fazer upload:</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowImageUpload(false)}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className="min-h-[200px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background"
        style={{ 
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          direction: 'ltr',
          textAlign: 'left'
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
};
