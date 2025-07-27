import { Controller, useFormContext } from 'react-hook-form';
import { MoradorParaSelecao } from '@/entities/cobranca/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { FormLabel, FormMessage } from '@/components/ui/form';

interface Props {
  moradores: MoradorParaSelecao[];
}

export const EnvioMassaTabela = ({ moradores }: Props) => {
  const { control, setValue, watch } = useFormContext();
  const selectedIds = watch('moradoresIds');

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    setValue('moradoresIds', checked ? moradores.map(m => m.id) : []);
  };

  return (
    <div>
      <FormLabel>3. Selecione os Moradores</FormLabel>
      <div className="mt-2 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedIds?.length === moradores.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {moradores.map((morador) => (
              <TableRow key={morador.id}>
                <TableCell>
                  <Controller
                    name="moradoresIds"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value?.includes(morador.id)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...field.value, morador.id]
                            : field.value?.filter((id) => id !== morador.id);
                          field.onChange(newValue);
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>{morador.nome}</TableCell>
                <TableCell>{morador.unidade}</TableCell>
                <TableCell>{morador.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <FormMessage />
    </div>
  );
};