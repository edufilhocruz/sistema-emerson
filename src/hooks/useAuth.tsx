import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  nome: string;
  role: string;
  foto?: string; // Adicionado para avatar
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  setUser?: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token] = useState<string | null>(null); // Não usamos mais token
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Ao montar, tenta buscar o usuário autenticado
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/usuarios/me', { credentials: 'include' });
        if (response.ok) {
          const user = await response.json();
          setUser(user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
        // Silencia erro no console para 401 ou falha de rede
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (!response.ok) {
        // Tenta extrair mensagem de erro do JSON, se possível
        let errorMsg = 'Usuário ou senha inválidos';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) errorMsg = errorData.message;
        } catch {
          // Se não for JSON, mantém mensagem padrão
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setUser(data.user);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token: null, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}; 