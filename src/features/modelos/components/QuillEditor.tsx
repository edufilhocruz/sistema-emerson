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

  // Configuração simplificada dos módulos do Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  // Configuração dos formatos permitidos
  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'color',
    'align',
    'link', 'image'
  ];

  const handleChange = (content: string, delta: any, source: any, editor: any) => {
    setEditorValue(content);
    onChange(content);
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
        style={{
          height: '400px',
          marginBottom: '50px'
        }}
      />
      
      {/* Barra de status */}
      <div className="quill-status-bar">
        <div className="flex items-center justify-between text-xs text-gray-500 px-2 py-1">
          <span>Editor de Texto Rico</span>
          <span>{editorValue.replace(/<[^>]*>/g, '').length} caracteres</span>
        </div>
      </div>
    </div>
  );
};
