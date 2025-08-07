'use client';

import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill-custom.css';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const QuillEditor = ({ value, onChange, placeholder, className }: QuillEditorProps) => {
  const [editorValue, setEditorValue] = useState(value);

  // Configuração dos módulos do Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
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
    'align',
    'link', 'image',
    'list', 'bullet'
  ];

  const handleChange = (content: string, delta: any, source: any, editor: any) => {
    setEditorValue(content);
    onChange(content);
  };

  return (
    <div className={className}>
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          height: '200px',
          marginBottom: '50px'
        }}
      />
    </div>
  );
};
