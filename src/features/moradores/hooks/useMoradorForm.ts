import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { 
  MoradorFormData, 
  MoradorFormState, 
  MoradorFormContext,
  moradorFormSchema,
  moradorEditSchema,
  Morador 
} from '../types';

// ============================================================================
// HOOK CUSTOMIZADO PARA FORMULÁRIO DE MORADOR
// ============================================================================

export const useMoradorForm = (context: MoradorFormContext) => {
  const { mode, initialData, onSubmit, onCancel } = context;

  // ============================================================================
  // ESTADO INTERNO
  // ============================================================================

  const [formState, setFormState] = useState<MoradorFormState>({
    isSubmitting: false,
    isDirty: false,
    isValid: false,
    errors: {}
  });

  // ============================================================================
  // CONFIGURAÇÃO DO FORMULÁRIO
  // ============================================================================

  const schema = useMemo(() => {
    return mode === 'edit' ? moradorEditSchema : moradorFormSchema;
  }, [mode]);

  const defaultValues = useMemo(() => {
    const baseDefaults = {
      nome: '',
      email: '',
      telefone: '',
      condominioId: undefined,
      bloco: '',
      apartamento: '',
      valorAluguel: undefined
    };

    if (mode === 'edit' && initialData) {
      return {
        ...baseDefaults,
        ...initialData,
        telefone: initialData.telefone || '',
        valorAluguel: initialData.valorAluguel || undefined,
        condominioId: initialData.condominioId || initialData.condominio?.id
      };
    }

    return baseDefaults;
  }, [mode, initialData]);

  // ============================================================================
  // REACT HOOK FORM
  // ============================================================================

  const form = useForm<MoradorFormData>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange', // Validação em tempo real
    reValidateMode: 'onChange'
  });

  // ============================================================================
  // OBSERVADORES DE ESTADO
  // ============================================================================

  const { 
    watch, 
    formState: { errors, isDirty, isValid, isSubmitting },
    handleSubmit,
    reset,
    setValue,
    getValues,
    trigger
  } = form;

  // Monitorar mudanças no formulário
  const watchedValues = watch();

  // ============================================================================
  // EFEITOS PARA SINCRONIZAR ESTADO
  // ============================================================================

  useEffect(() => {
    setFormState({
      isSubmitting,
      isDirty,
      isValid,
      errors: Object.keys(errors).reduce((acc, key) => {
        acc[key] = errors[key]?.message ? [errors[key]!.message!] : [];
        return acc;
      }, {} as Record<string, string[]>)
    });
  }, [isSubmitting, isDirty, isValid, errors]);

  // ============================================================================
  // FUNÇÕES UTILITÁRIAS
  // ============================================================================

  const formatCurrencyForDisplay = useCallback((value: number | undefined | null): string => {
    if (value === undefined || value === null) return '';
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value;
    if (isNaN(numValue)) return '';
    return numValue.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }, []);

  const parseCurrencyValue = useCallback((value: string): number | null => {
    if (!value || value === '' || value === '0' || value === '0,00') {
      return null;
    }
    const numValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
    return isNaN(numValue) ? null : numValue;
  }, []);

  // ============================================================================
  // HANDLERS DE CAMPOS ESPECÍFICOS
  // ============================================================================

  const handleTelefoneChange = useCallback((value: string) => {
    setValue('telefone', value, { 
      shouldValidate: true, 
      shouldDirty: true 
    });
  }, [setValue]);

  const handleValorAluguelChange = useCallback((value: string) => {
    const parsedValue = parseCurrencyValue(value);
    setValue('valorAluguel', parsedValue, { 
      shouldValidate: true, 
      shouldDirty: true 
    });
  }, [setValue, parseCurrencyValue]);

  const handleValorAluguelBlur = useCallback((value: string) => {
    if (!value || value === '' || value === '0,00') {
      setValue('valorAluguel', null, { 
        shouldValidate: true, 
        shouldDirty: true 
      });
    }
  }, [setValue]);

  // ============================================================================
  // HANDLER DE SUBMISSÃO
  // ============================================================================

  const handleFormSubmit = useCallback(async (data: MoradorFormData) => {
    try {
      setFormState(prev => ({ ...prev, isSubmitting: true }));

      // Log para debug
      console.log(`[useMoradorForm] Submetendo dados (${mode}):`, data);

      // Processar dados antes de enviar
      const processedData = {
        ...data,
        telefone: data.telefone || null,
        valorAluguel: data.valorAluguel || null
      };

      console.log('[useMoradorForm] Dados processados:', processedData);

      // Chamar função de submissão
      await onSubmit(processedData);

      // Sucesso
      toast({
        title: mode === 'edit' ? 'Morador atualizado com sucesso!' : 'Morador criado com sucesso!',
        variant: 'default'
      });

      // Resetar formulário se for criação
      if (mode === 'create') {
        reset(defaultValues);
      }

    } catch (error) {
      console.error('[useMoradorForm] Erro na submissão:', error);
      
      // Tratar erro
      let errorMessage = 'Erro ao salvar morador.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }

      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [mode, onSubmit, reset, defaultValues]);

  const handleCancel = useCallback(() => {
    if (formState.isDirty) {
      // Confirmar se quer descartar mudanças
      if (window.confirm('Tem certeza que deseja descartar as alterações?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  }, [formState.isDirty, onCancel]);

  // ============================================================================
  // VALIDAÇÃO EM TEMPO REAL
  // ============================================================================

  const validateField = useCallback(async (fieldName: keyof MoradorFormData) => {
    try {
      await trigger(fieldName);
    } catch (error) {
      console.error(`[useMoradorForm] Erro ao validar campo ${fieldName}:`, error);
    }
  }, [trigger]);

  const validateAllFields = useCallback(async () => {
    try {
      await trigger();
    } catch (error) {
      console.error('[useMoradorForm] Erro ao validar todos os campos:', error);
    }
  }, [trigger]);

  // ============================================================================
  // RESET E LIMPEZA
  // ============================================================================

  const resetForm = useCallback(() => {
    reset(defaultValues);
    setFormState({
      isSubmitting: false,
      isDirty: false,
      isValid: false,
      errors: {}
    });
  }, [reset, defaultValues]);

  // ============================================================================
  // RETORNO DO HOOK
  // ============================================================================

  return {
    // Estado do formulário
    form,
    formState,
    watchedValues,
    
    // Handlers
    handleSubmit: handleSubmit(handleFormSubmit),
    handleCancel,
    handleTelefoneChange,
    handleValorAluguelChange,
    handleValorAluguelBlur,
    
    // Funções utilitárias
    formatCurrencyForDisplay,
    parseCurrencyValue,
    validateField,
    validateAllFields,
    resetForm,
    
    // Informações do contexto
    mode,
    isEditMode: mode === 'edit',
    isCreateMode: mode === 'create'
  };
}; 