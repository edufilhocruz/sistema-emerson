import React, { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { toast } from '../components/ui/use-toast';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  React.useEffect(() => {
    fetch('/api/usuarios/admin-exists')
      .then(res => res.json())
      .then(data => {
        if (!data.exists) setShowRegister(true);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err: unknown) {
      let message = 'Falha no login';
      if (err instanceof Error) message = err.message;
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full font-bold bg-[#CDA434] text-white rounded-md transition-none border-none"
            style={{ boxShadow: 'none' }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        {showRegister && (
          <Button
            asChild
            variant="ghost"
            className="w-full mt-2 font-semibold bg-[#F6F3EA] text-[#CDA434] hover:bg-[#EFE6CC] hover:text-[#CDA434] rounded-md transition-all shadow-none border-none"
          >
            <Link to="/register">
              Cadastre-se
            </Link>
          </Button>
        )}
      </Card>
    </div>
  );
};

export default Login; 