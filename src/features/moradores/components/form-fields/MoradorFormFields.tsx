import React, { memo } from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IMaskInput } from 'react-imask';
import { MoradorFormData } from '../../types';

// ============================================================================
// INTERFACES
// ============================================================================

interface CondominioOption {
  value: string;
  label: string;
}

interface MoradorFormFieldsProps {
  control: Control<MoradorFormData>;
  condominioOptions: CondominioOption[];
  loadingCondominios: boolean;
  onTelefoneChange: (value: string) => void;
  onValorAluguelChange: (value: string) => void;
  onValorAluguelBlur: (value: string) => void;
  formatCurrencyForDisplay: (value: number | undefined | null) => string;
}

// ============================================================================
// COMPONENTE DE CAMPO DE NOME
// ============================================================================

const NomeField = memo(({ control }: { control: Control<MoradorFormData> }) => (
  <FormField
    control={control}
    name="nome"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Nome Completo *</FormLabel>
        <FormControl>
          <Input 
            placeholder="Digite o nome completo" 
            {...field} 
            autoComplete="name"
            maxLength={100}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
));

NomeField.displayName = 'NomeField';

// ============================================================================
// COMPONENTE DE CAMPO DE EMAIL
// ============================================================================

const EmailField = memo(({ control }: { control: Control<MoradorFormData> }) => (
  <FormField
    control={control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>E-mail *</FormLabel>
        <FormControl>
          <Input 
            type="email" 
            placeholder="email@exemplo.com" 
            {...field} 
            autoComplete="email"
            maxLength={100}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
));

EmailField.displayName = 'EmailField';

// ============================================================================
// COMPONENTE DE CAMPO DE EMAILS ADICIONAIS
// ============================================================================

const EmailsAdicionaisField = memo(({ control }: { control: Control<MoradorFormData> }) => (
  <FormField
    control={control}
    name="emailsAdicionais"
    render={({ field }) => (
      <FormItem>
        <FormLabel>E-mails Adicionais</FormLabel>
        <FormControl>
          <Input 
            type="text" 
            placeholder="email1@exemplo.com, email2@exemplo.com" 
            {...field} 
            autoComplete="off"
            maxLength={500}
          />
        </FormControl>
        <FormMessage />
        <p className="text-xs text-muted-foreground">
          Separe múltiplos e-mails por vírgula. As cobranças serão enviadas para todos os e-mails.
        </p>
      </FormItem>
    )}
  />
));

EmailsAdicionaisField.displayName = 'EmailsAdicionaisField';

// ============================================================================
// COMPONENTE DE CAMPO DE CONDOMÍNIO
// ============================================================================

const CondominioField = memo(({ 
  control, 
  condominioOptions, 
  loadingCondominios 
}: { 
  control: Control<MoradorFormData>;
  condominioOptions: CondominioOption[];
  loadingCondominios: boolean;
}) => (
  <FormField
    control={control}
    name="condominioId"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Condomínio *</FormLabel>
        <Select 
          onValueChange={field.onChange} 
          defaultValue={field.value} 
          disabled={loadingCondominios}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue 
                placeholder={loadingCondominios ? "Carregando..." : "Selecione o condomínio"} 
              />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {condominioOptions.map((condo) => (
              <SelectItem key={condo.value} value={condo.value}>
                {condo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
));

CondominioField.displayName = 'CondominioField';

// ============================================================================
// COMPONENTE DE CAMPOS DE BLOCO E APARTAMENTO
// ============================================================================

const LocalizacaoFields = memo(({ control }: { control: Control<MoradorFormData> }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormField
      control={control}
      name="bloco"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Bloco *</FormLabel>
          <FormControl>
            <Input 
              placeholder="Ex: A" 
              {...field} 
              maxLength={10}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    
    <FormField
      control={control}
      name="apartamento"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Apartamento *</FormLabel>
          <FormControl>
            <Input 
              placeholder="Ex: 101" 
              {...field} 
              maxLength={10}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
));

LocalizacaoFields.displayName = 'LocalizacaoFields';

// ============================================================================
// COMPONENTE DE CAMPO DE TELEFONE
// ============================================================================

const TelefoneField = memo(({ 
  control, 
  onTelefoneChange 
}: { 
  control: Control<MoradorFormData>;
  onTelefoneChange: (value: string) => void;
}) => (
  <FormField
    control={control}
    name="telefone"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Telefone</FormLabel>
        <FormControl>
          <IMaskInput
            mask="(00) 00000-0000"
            placeholder="(11) 98765-4321"
            value={field.value || ''}
            onAccept={(value) => {
              field.onChange(value);
              onTelefoneChange(value);
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
));

TelefoneField.displayName = 'TelefoneField';

// ============================================================================
// COMPONENTE DE CAMPO DE VALOR DO ALUGUEL
// ============================================================================

const ValorAluguelField = memo(({ 
  control, 
  onValorAluguelChange, 
  onValorAluguelBlur,
  formatCurrencyForDisplay 
}: { 
  control: Control<MoradorFormData>;
  onValorAluguelChange: (value: string) => void;
  onValorAluguelBlur: (value: string) => void;
  formatCurrencyForDisplay: (value: number | undefined | null) => string;
}) => (
  <FormField
    control={control}
    name="valorAluguel"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Valor do Aluguel</FormLabel>
        <FormControl>
          <IMaskInput
            mask={Number}
            scale={2}
            radix=","
            mapToRadix={["."]}
            placeholder="0,00"
            value={formatCurrencyForDisplay(field.value)}
            onAccept={(value) => {
              field.onChange(value);
              onValorAluguelChange(value);
            }}
            onBlur={(e) => {
              field.onBlur();
              onValorAluguelBlur(e.target.value);
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
));

ValorAluguelField.displayName = 'ValorAluguelField';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const MoradorFormFields = memo(({
  control,
  condominioOptions,
  loadingCondominios,
  onTelefoneChange,
  onValorAluguelChange,
  onValorAluguelBlur,
  formatCurrencyForDisplay
}: MoradorFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <NomeField control={control} />
      <EmailField control={control} />
      <EmailsAdicionaisField control={control} />
      <CondominioField 
        control={control} 
        condominioOptions={condominioOptions} 
        loadingCondominios={loadingCondominios} 
      />
      <LocalizacaoFields control={control} />
      <TelefoneField 
        control={control} 
        onTelefoneChange={onTelefoneChange} 
      />
      <ValorAluguelField 
        control={control} 
        onValorAluguelChange={onValorAluguelChange}
        onValorAluguelBlur={onValorAluguelBlur}
        formatCurrencyForDisplay={formatCurrencyForDisplay}
      />
    </div>
  );
});

MoradorFormFields.displayName = 'MoradorFormFields'; 