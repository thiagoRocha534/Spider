import type { GridColDef } from '@mui/x-data-grid'
import type { Product } from '../../services/products'
import { maskCurrency } from '../../utils/masks'
import DeleteProductButton from './DeleteProductButton'
import EditProductButton from './EditProductButton'
import ProductThumb from './ProductThumb'

export const columns: GridColDef<Product>[] = [
  {
    field: 'fotos',
    headerName: '',
    renderHeader: () => <span className="sr-only">Foto</span>,
    width: 64,
    sortable: false,
    renderCell: ({ value }) => (
      <div className="flex h-full items-center">
        <ProductThumb photos={value} />
      </div>
    ),
  },
  {
    field: 'descricao',
    headerName: 'Produto',
    flex: 1.6,
    minWidth: 200,
    renderCell: ({ row }) => (
      <div className="flex min-w-0 flex-col justify-center gap-0.5 leading-tight">
        <span className="truncate font-semibold">{row.descricao}</span>
        <span className="text-[12.5px] text-content-muted">{row.marca}</span>
      </div>
    ),
  },
  {
    field: 'referencia',
    headerName: 'Referência',
    width: 120,
    cellClassName: 'cell-muted',
  },
  {
    field: 'codigo',
    headerName: 'Código',
    width: 120,
    cellClassName: 'cell-muted',
  },
  {
    field: 'valorAVista',
    headerName: 'Valor à vista',
    width: 130,
    align: 'right',
    headerAlign: 'right',
    cellClassName: 'cell-strong',
    valueFormatter: (value: number) => maskCurrency(String(value)),
  },
  {
    field: 'estoqueAtual',
    headerName: 'Estoque',
    width: 100,
    align: 'right',
    headerAlign: 'right',
    cellClassName: 'cell-muted',
  },
  {
    field: 'actions',
    headerName: 'Ações',
    renderHeader: () => <span className="sr-only">Ações</span>,
    width: 92,
    sortable: false,
    align: 'right',
    renderCell: ({ row }) => (
      <div className="row-actions flex h-full items-center justify-end gap-0.5">
        <EditProductButton productId={row.id} />
        <DeleteProductButton product={row} />
      </div>
    ),
  },
]
