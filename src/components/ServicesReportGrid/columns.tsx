import type { GridColDef } from '@mui/x-data-grid'
import type { ServiceReportRow } from '../../services/orders'
import { formatDate } from '../../utils/formatDate'
import { maskCurrency } from '../../utils/masks'
import PlateChip from '../OrdersGrid/PlateChip'

export const columns: GridColDef<ServiceReportRow>[] = [
  {
    field: 'data',
    headerName: 'Data',
    width: 112,
    valueFormatter: (value: string) => formatDate(value),
    cellClassName: 'cell-muted',
  },
  {
    field: 'cliente',
    headerName: 'Cliente',
    flex: 1.2,
    minWidth: 170,
    valueFormatter: (value: string | null) => value ?? '—',
  },
  {
    field: 'veiculo',
    headerName: 'Veículo',
    flex: 1,
    minWidth: 140,
    valueFormatter: (value: string | null) => value ?? '—',
  },
  {
    field: 'placa',
    headerName: 'Placa',
    width: 116,
    renderCell: ({ value }) => <PlateChip plate={value} />,
  },
  {
    field: 'descricao',
    headerName: 'Serviço',
    flex: 1.6,
    minWidth: 220,
  },
  {
    field: 'valor',
    headerName: 'Valor',
    width: 120,
    align: 'right',
    headerAlign: 'right',
    cellClassName: 'cell-strong',
    // `valor` vem em reais (igual ao resto do app); maskCurrency espera centavos.
    valueFormatter: (value: number | null) =>
      value === null ? '—' : maskCurrency(String(Math.round(value * 100))),
  },
]
