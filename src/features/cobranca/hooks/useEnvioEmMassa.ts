import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EnvioEmMassaFormData, envioEmMassaSchema, MoradorParaSelecao } from '@/entities/cobranca/types';

// Dados de exemplo que seriam obtidos de uma API no futuro
const mockMoradores: { [key: string]: MoradorParaSelecao[] } = {
  '1': [
    { id: '101', nome: 'Sofia Almeida', unidade: 'A-101', email: 'sofia@email.com' },
    { id: '102', nome: 'Carlos Pereira', unidade: 'A-102', email: 'carlos@email.com' },
  ],
  '2': [
    { id: '201', nome: 'Ana Costa', unidade: 'Casa 201', email: 'ana@email.com' },
    { id: '202', nome: 'Ricardo Santos', unidade: 'Casa 202', email: 'ricardo@email.com' },
  ],
};

/**
 * Hook para gerir a lógica e o estado do formulário de envio em massa.
 */
export const useEnvioEmMassa = () => {
  const form = useForm<EnvioEmMassaFormData>({
    resolver: zodResolver(envioEmMassaSchema),
    defaultValues: { moradoresIds: [] },
  });

  const selectedCondominioId = form.watch('condominioId');

  // Memoiza a lista de moradores para evitar recálculos desnecessários
  const moradoresDoCondominio = useMemo(() => {
    return selectedCondominioId ? mockMoradores[selectedCondominioId] || [] : [];
  }, [selectedCondominioId]);

  const onSubmit = (data: EnvioEmMassaFormData) => {
    console.log('Dados para envio em massa:', data);
    alert(`${data.moradoresIds.length} cobranças enviadas com sucesso!`);
  };

  return {
    form,
    moradoresDoCondominio,
    selectedCondominioId,
    onSubmit,
  };
};