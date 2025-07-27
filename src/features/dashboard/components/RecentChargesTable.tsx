import { ChargeStatus } from '@/entities/dashboard/types';

const statusConfig: Record<ChargeStatus, { label: string, className: string }> = {
  paid: { label: 'Pago', className: 'bg-success-light text-success border-success/20' },
  sent: { label: 'Enviado', className: 'bg-info-light text-info border-info/20' },
  overdue: { label: 'Atrasado', className: 'bg-danger-light text-danger border-danger/20' },
};

interface RecentChargesTableProps {
  recentCharges: any[];
}

export function RecentChargesTable({ recentCharges }: RecentChargesTableProps) {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden h-full">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground">Últimos Envios de Cobrança</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-text-secondary">
          <thead className="text-xs text-foreground uppercase bg-bg-secondary">
            <tr>
              <th scope="col" className="px-6 py-3">Data</th>
              <th scope="col" className="px-6 py-3">Condomínio</th>
              <th scope="col" className="px-6 py-3">Morador</th>
              <th scope="col" className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentCharges.map((charge, index) => (
              <tr key={charge.id || index} className="bg-background border-b border-border">
                <td className="px-6 py-4 font-medium text-foreground">{charge.dataEnvio ? new Date(charge.dataEnvio).toLocaleDateString('pt-BR') : '-'}</td>
                <td className="px-6 py-4">{charge.condominio?.nome || '-'}</td>
                <td className="px-6 py-4">{charge.morador?.nome || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[charge.status === 'PAGO' ? 'paid' : charge.status === 'ATRASADO' ? 'overdue' : 'sent'].className}`}>
                    {statusConfig[charge.status === 'PAGO' ? 'paid' : charge.status === 'ATRASADO' ? 'overdue' : 'sent'].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}