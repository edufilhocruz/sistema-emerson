import React, { useMemo, useCallback } from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, X, UserPlus, User } from 'lucide-react';
import { useCondominios } from '@/features/condominio/hooks/useCondominios';
import { useMoradorForm } from '../hooks/useMoradorForm';
import { MoradorFormFields } from './form-fields/MoradorFormFields';
import { MoradorFormContext, Morador } from '../types';

// ============================================================================
// INTERFACES
// ============================================================================

interface MoradorFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Morador>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  open: boolean;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const MoradorForm: React.FC<MoradorFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  open
}) => {
  // ============================================================================
  // HOOKS
  // ============================================================================

  const { condominios, loading: loadingCondominios } = useCondominios();

  // ============================================================================
  // CONTEXTO DO FORMULÁRIO
  // ============================================================================

  const formContext: MoradorFormContext = useMemo(() => ({
    mode,
    initialData,
    onSubmit,
    onCancel
  }), [mode, initialData, onSubmit, onCancel]);

  // ============================================================================
  // HOOK CUSTOMIZADO DO FORMULÁRIO
  // ============================================================================

  const {
    form,
    formState,
    handleSubmit,
    handleCancel,
    handleTelefoneChange,
    handleValorAluguelChange,
    handleValorAluguelBlur,
    formatCurrencyForDisplay,
    isEditMode,
    isCreateMode
  } = useMoradorForm(formContext);

  // ============================================================================
  // OPÇÕES DE CONDOMÍNIO
  // ============================================================================

  const condominioOptions = useMemo(() => {
    return condominios.map(condo => ({
      value: condo.id,
      label: condo.nome
    }));
  }, [condominios]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFormCancel = useCallback(() => {
    handleCancel();
  }, [handleCancel]);

  // ============================================================================
  // RENDERIZAÇÃO CONDICIONAL
  // ============================================================================

  if (!open) {
    return null;
  }

  // ============================================================================
  // RENDERIZAÇÃO PRINCIPAL
  // ============================================================================

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            {isCreateMode ? (
              <UserPlus className="h-5 w-5 text-blue-600" />
            ) : (
              <User className="h-5 w-5 text-orange-600" />
            )}
            <CardTitle className="text-xl">
              {isCreateMode ? 'Novo Morador' : 'Editar Morador'}
            </CardTitle>
          </div>
          <CardDescription>
            {isCreateMode 
              ? 'Preencha os dados para cadastrar um novo morador no sistema.'
              : 'Atualize as informações do morador conforme necessário.'
            }
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campos do Formulário */}
              <MoradorFormFields
                control={form.control}
                condominioOptions={condominioOptions}
                loadingCondominios={loadingCondominios}
                onTelefoneChange={handleTelefoneChange}
                onValorAluguelChange={handleValorAluguelChange}
                onValorAluguelBlur={handleValorAluguelBlur}
                formatCurrencyForDisplay={formatCurrencyForDisplay}
              />

              <Separator />

              {/* Botões de Ação */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFormCancel}
                  disabled={formState.isSubmitting}
                  className="min-w-[100px]"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={formState.isSubmitting || !formState.isValid}
                  className="min-w-[100px]"
                >
                  {formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isCreateMode ? 'Criar' : 'Salvar'}
                    </>
                  )}
                </Button>
              </div>

              {/* Indicadores de Estado */}
              {formState.isDirty && (
                <div className="text-sm text-muted-foreground text-center">
                  ⚠️ Você tem alterações não salvas
                </div>
              )}

              {Object.keys(formState.errors).length > 0 && (
                <div className="text-sm text-destructive text-center">
                  ⚠️ Existem erros no formulário. Verifique os campos destacados.
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};