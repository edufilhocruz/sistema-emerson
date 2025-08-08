'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill-custom.css';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export const QuillEditor = ({ 
  value, 
  onChange, 
  placeholder, 
  className,
  readOnly = false 
}: QuillEditorProps) => {
  const [editorValue, setEditorValue] = useState(value);
  const quillRef = useRef<ReactQuill>(null);

  // Sincronizar valor externo
  useEffect(() => {
    if (value !== editorValue) {
      setEditorValue(value);
    }
  }, [value]);

  // Configuração avançada dos módulos do Quill (estilo Listmonk)
  const modules = {
    toolbar: {
      container: [
        // Primeira linha: formatação de texto
        [
          { 'header': [1, 2, 3, 4, 5, 6, false] },
          { 'font': ['sans-serif', 'serif', 'monospace'] },
          { 'size': ['small', false, 'large', 'huge'] }
        ],
        // Segunda linha: estilo e cores
        [
          'bold', 'italic', 'underline', 'strike',
          { 'color': [] },
          { 'background': [] }
        ],
        // Terceira linha: alinhamento e listas
        [
          { 'align': [] },
          { 'list': 'ordered' },
          { 'list': 'bullet' },
          { 'indent': '-1' },
          { 'indent': '+1' }
        ],
        // Quarta linha: links e mídia
        [
          'link', 'image', 'video',
          'blockquote', 'code-block'
        ],
        // Quinta linha: limpar formatação
        ['clean']
      ],
      handlers: {
        // Handler customizado para upload de imagens
        image: () => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
              try {
                // Upload da imagem
                const formData = new FormData();
                formData.append('image', file);

                const response = await fetch('/api/modelo-carta/upload-image', {
                  method: 'POST',
                  body: formData,
                });

                if (response.ok) {
                  const result = await response.json();
                  const imageUrl = `${window.location.origin}/api${result.url}`;
                  
                  // Inserir imagem no editor
                  const quill = quillRef.current?.getEditor();
                  if (quill) {
                    const range = quill.getSelection();
                    quill.insertEmbed(range?.index || 0, 'image', imageUrl);
                  }
                } else {
                  console.error('Erro no upload da imagem');
                }
              } catch (error) {
                console.error('Erro ao fazer upload:', error);
              }
            }
          };
        }
      }
    },
    clipboard: {
      matchVisual: false,
    },
    history: {
      delay: 2000,
      maxStack: 500,
      userOnly: true
    }
  };

  // Configuração completa dos formatos permitidos
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align', 'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'blockquote', 'code-block',
    'script'
  ];

  const handleChange = (content: string, delta: any, source: any, editor: any) => {
    setEditorValue(content);
    onChange(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Atalhos de teclado customizados
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          // Toggle bold
          break;
        case 'i':
          e.preventDefault();
          // Toggle italic
          break;
        case 'u':
          e.preventDefault();
          // Toggle underline
          break;
      }
    }
  };

  return (
    <div className={`quill-editor-container ${className || ''}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        onKeyDown={handleKeyDown}
        style={{
          height: '500px',
          marginBottom: '50px'
        }}
      />
      
      {/* Barra de status */}
      <div className="quill-status-bar">
        <div className="flex items-center justify-between text-xs text-gray-500 px-2 py-1">
          <span>Editor de Texto Rico - Use Ctrl+B, Ctrl+I, Ctrl+U para formatação rápida</span>
          <span>{editorValue.replace(/<[^>]*>/g, '').length} caracteres</span>
        </div>
      </div>
    </div>
  );
};
