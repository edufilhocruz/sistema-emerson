import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { toast } from '../components/ui/use-toast';

const Register: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se já existe Admin
    fetch('/api/usuarios/admin-exists')
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          toast({ title: 'Acesso negado', description: 'Já existe um administrador cadastrado.', variant: 'destructive' });
          navigate('/login', { replace: true });
        }
      })
      .finally(() => setChecking(false));
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });
      if (!response.ok) {
        let msg = 'Erro ao cadastrar.';
        try {
          const err = await response.json();
          if (err && err.message) msg = err.message;
        } catch {/* ignorar erro de parse do json */}
        toast({ title: 'Erro', description: msg, variant: 'destructive' });
        return;
      }
      toast({ title: 'Cadastro realizado', description: 'Admin cadastrado com sucesso! Faça login.', variant: 'default' });
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Cadastro</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} required minLength={3} />
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="senha">Senha</Label>
            <Input id="senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} required minLength={8} />
            <span className="text-xs text-gray-500">Mínimo 8 caracteres</span>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Button>
        </form>
      </Card>
    </div>
  );
};

export default Register; 