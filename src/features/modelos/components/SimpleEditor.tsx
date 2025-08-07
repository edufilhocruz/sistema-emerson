'use client';

import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface SimpleEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SimpleEditor = ({ value, onChange, placeholder, className }: SimpleEditorProps) => {
  return (
    <div className={className}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px] resize-none"
        style={{
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.6'
        }}
      />
      <div className="mt-2 text-xs text-muted-foreground">
        <p>💡 Dica: Use <strong>**texto**</strong> para negrito, <em>*texto*</em> para itálico</p>
        <p>📝 Campos dinâmicos: {{nome_morador}}, {{valor}}, {{mes_referencia}}, etc.</p>
      </div>
    </div>
  );
};
