'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { UploadCloud, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import cobrancaService from '../services/cobrancaService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCondominios } from '@/features/condominio/hooks/useCondominios';
import { useModelos } from '@/features/modelos/hooks/useModelos';
import * as XLSX from 'xlsx';
import apiClient from '@/services/apiClient';

type MoradorImportado = {
  condominio: string;
  endereco: string;
  nome: string;
  bloco: string;
  apto: string;
  email: string;
};

export const ImportacaoForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [condominioId, setCondominioId] = useState<string | null>(null);
  const [modeloCartaId, setModeloCartaId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedData, setImportedData] = useState<MoradorImportado[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { condominioOptions, loading: loadingCondominios } = useCondominios();
  const { modelos } = useModelos();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (jsonData.length < 2) return;
      // Mapeamento automático dos cabeçalhos (removendo acentos e deixando minúsculo)
      const normalize = (str: string) => str.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]/g, '').trim();
      const headers = jsonData[0].map((h: string) => normalize(h));
      const indices = {
        condominio: headers.findIndex((h: string) => h.includes('condominio')),
        endereco: headers.findIndex((h: string) => h.includes('endereco')),
        nome: headers.findIndex((h: string) => h.includes('nome')),
        bloco: headers.findIndex((h: string) => h.includes('bloco')),
        apto: headers.findIndex((h: string) => h.includes('apto')),
        email: headers.findIndex((h: string) => h.includes('email')),
      };
      const mapped: MoradorImportado[] = jsonData.slice(1).map((row: string[]) => ({
        condominio: row[indices.condominio] || '',
        endereco: row[indices.endereco] || '',
        nome: row[indices.nome] || '',
        bloco: row[indices.bloco] || '',
        apto: row[indices.apto] || '',
        email: row[indices.email] || '',
      }));
      setImportedData(mapped);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!file || !condominioId || !modeloCartaId) {
      toast({ variant: "destructive", title: "Erro de Validação", description: "Por favor, selecione o condomínio, o modelo de carta e o arquivo." });
      return;
    }

    setIsProcessing(true);
    try {
      const summary = await cobrancaService.importarPlanilha({ file, condominioId, modeloCartaId });
      toast({
        title: "Arquivo Enviado!",
        description: summary.message, // Exibe a mensagem de sucesso da API
      });
    } catch (error) {
      console.error("Falha na importação:", error);
      toast({ variant: "destructive", title: "Erro na Importação", description: "Não foi possível processar a requisição." });
    } finally {
      setIsProcessing(false);
      setFile(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await apiClient.post('/morador/importar', importedData);
      const { duplicados, total } = response.data;
      toast({ title: `Moradores salvos com sucesso! (${total})` });
      if (duplicados && duplicados.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Alguns contatos não foram importados',
          description: `Já existem no sistema: ${duplicados.join(', ')}`,
        });
      }
      setImportedData([]);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar os moradores.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-4">Importar Moradores</h2>
      <div className="bg-card p-8 rounded-2xl shadow-sm border space-y-6 flex flex-col items-center">
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold text-foreground">Importar Moradores da Planilha</h3>
        <p className="mt-1 text-sm text-muted-foreground">Selecione o arquivo Excel (.xlsx) para importar os moradores.</p>
        <Button asChild variant="outline" className="w-full max-w-xs">
          <label htmlFor="file-upload" className="cursor-pointer w-full text-center">
            Selecionar Arquivo
            <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx, .xls" />
          </label>
        </Button>
        {importedData.length > 0 && (
          <>
            <div className="overflow-x-auto border rounded-lg w-full mt-6">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1">Condomínio</th>
                    <th className="px-2 py-1">Endereço</th>
                    <th className="px-2 py-1">Nome</th>
                    <th className="px-2 py-1">Bloco</th>
                    <th className="px-2 py-1">Apto</th>
                    <th className="px-2 py-1">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {importedData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1">{row.condominio}</td>
                      <td className="border px-2 py-1">{row.endereco}</td>
                      <td className="border px-2 py-1">{row.nome}</td>
                      <td className="border px-2 py-1">{row.bloco}</td>
                      <td className="border px-2 py-1">{row.apto}</td>
                      <td className="border px-2 py-1">{row.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              className="mt-6 bg-gold hover:bg-gold-hover text-white font-semibold py-2 px-6 rounded disabled:opacity-60"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar Moradores'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
