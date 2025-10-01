import React from 'react';
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import processoService, { Processo, ProcessoCreate } from "@/features/processos/services/processoService";
import React from 'react';
import { Construction, FileText } from 'lucide-react';

const ProcessosPage = () => {
  return (
    <div className="flex h-screen bg-bg-secondary">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Gestão de Processos" />
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          <ProcessosTable />
        </div>
      </main>
    </div>
  );
};

export default ProcessosPage;

function ProcessosTable() {
  const [items, setItems] = React.useState<Processo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState<Partial<ProcessoCreate>>({
    nome: '', unidade: '', acaoDe: '', situacao: '', numeroProcesso: '', valorDivida: undefined, movimentacoes: ''
  });
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await processoService.list();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'valorDivida' ? (value ? Number(value.replace(',', '.')) : undefined) : value }));
  };

  const handleCreate = async () => {
    if (!form.nome || !form.unidade || !form.acaoDe || !form.situacao || !form.numeroProcesso) return;
    setSaving(true);
    try {
      await processoService.create({
        nome: form.nome!,
        unidade: form.unidade!,
        acaoDe: form.acaoDe!,
        situacao: form.situacao!,
        numeroProcesso: form.numeroProcesso!,
        valorDivida: form.valorDivida ?? null,
        movimentacoes: form.movimentacoes ?? '',
        condominioId: null,
      });
      setForm({ nome: '', unidade: '', acaoDe: '', situacao: '', numeroProcesso: '', valorDivida: undefined, movimentacoes: '' });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, patch: Partial<Processo>) => {
    await processoService.update(id, patch);
    await load();
  };

  const handleDelete = async (id: string) => {
    await processoService.remove(id);
    await load();
  };

  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader>
        <CardTitle>Processos</CardTitle>
        <CardDescription>Gerenciamento de processos jurídicos</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Formulário inline para adicionar */}
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-2 mb-4">
          <Input name="nome" placeholder="Nome" value={form.nome || ''} onChange={handleChange} />
          <Input name="unidade" placeholder="Unidade" value={form.unidade || ''} onChange={handleChange} />
          <Input name="acaoDe" placeholder="Ação de" value={form.acaoDe || ''} onChange={handleChange} />
          <Input name="situacao" placeholder="Situação" value={form.situacao || ''} onChange={handleChange} />
          <Input name="numeroProcesso" placeholder="N. Processo" value={form.numeroProcesso || ''} onChange={handleChange} />
          <Input name="valorDivida" placeholder="Valor Dívida" value={form.valorDivida?.toString() || ''} onChange={handleChange} />
          <Input name="movimentacoes" placeholder="Movimentações" value={form.movimentacoes || ''} onChange={handleChange} />
          <Button disabled={saving} onClick={handleCreate}>{saving ? 'Salvando...' : 'Adicionar'}</Button>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-black text-gold">
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">Unidade</th>
                <th className="p-2 text-left">Ação de</th>
                <th className="p-2 text-left">Situação</th>
                <th className="p-2 text-left">N. Processo</th>
                <th className="p-2 text-left">Valor Dívida</th>
                <th className="p-2 text-left">Movimentações</th>
                <th className="p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-4" colSpan={8}>Carregando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="p-4" colSpan={8}>Nenhum processo cadastrado.</td></tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-2"><InlineEdit value={p.nome} onSave={(v) => handleUpdate(p.id, { nome: v })} /></td>
                    <td className="p-2"><InlineEdit value={p.unidade} onSave={(v) => handleUpdate(p.id, { unidade: v })} /></td>
                    <td className="p-2"><InlineEdit value={p.acaoDe} onSave={(v) => handleUpdate(p.id, { acaoDe: v })} /></td>
                    <td className="p-2"><InlineEdit value={p.situacao} onSave={(v) => handleUpdate(p.id, { situacao: v })} /></td>
                    <td className="p-2"><InlineEdit value={p.numeroProcesso} onSave={(v) => handleUpdate(p.id, { numeroProcesso: v })} /></td>
                    <td className="p-2"><InlineEdit value={p.valorDivida?.toString() || ''} onSave={(v) => handleUpdate(p.id, { valorDivida: v ? Number(v.replace(',', '.')) : null })} /></td>
                    <td className="p-2"><InlineEdit value={p.movimentacoes || ''} onSave={(v) => handleUpdate(p.id, { movimentacoes: v })} /></td>
                    <td className="p-2"><Button variant="outline" onClick={() => handleDelete(p.id)}>Excluir</Button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function InlineEdit({ value, onSave }: { value: string; onSave: (v: string) => Promise<void> | void }) {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(value);
  React.useEffect(() => setVal(value), [value]);
  if (!editing) return <span onDoubleClick={() => setEditing(true)}>{value || '-'}</span>;
  return (
    <div className="flex items-center gap-2">
      <Input value={val} onChange={(e) => setVal(e.target.value)} />
      <Button size="sm" onClick={async () => { await onSave(val); setEditing(false); }}>Salvar</Button>
      <Button size="sm" variant="outline" onClick={() => { setVal(value); setEditing(false); }}>Cancelar</Button>
    </div>
  );
}

