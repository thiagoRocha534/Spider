import { useSetAtom } from 'jotai'
import Skeleton from '@mui/material/Skeleton'
import type { Product } from '../../services/products'
import { openEditProductModalAtom } from '../../store'
import { maskCurrency } from '../../utils/masks'
import DeleteProductButton from './DeleteProductButton'
import ProductsEmptyState from './ProductsEmptyState'
import ProductThumb from './ProductThumb'

type ProductsCardListProps = {
  rows: Product[]
  loading: boolean
}

/**
 * Versão mobile da listagem: um card por produto no lugar das colunas do
 * DataGrid, que não cabem numa tela estreita.
 */
function ProductsCardList({ rows, loading }: ProductsCardListProps) {
  const openEdit = useSetAtom(openEditProductModalAtom)

  if (loading) {
    return (
      <ul aria-busy="true" aria-label="Carregando produtos" className="divide-y divide-line">
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index} className="flex items-center gap-3 px-4 py-4">
            <Skeleton variant="rounded" width={40} height={40} />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton width="55%" height={22} />
              <Skeleton width="40%" />
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (rows.length === 0) return <ProductsEmptyState />

  return (
    <ul className="divide-y divide-line">
      {rows.map((row) => (
        <li key={row.id} className="relative">
          <button
            type="button"
            onClick={() => openEdit(row.id)}
            className="flex w-full items-center gap-3 px-4 py-4 pr-14 text-left transition-colors hover:bg-[#f7f9fd]"
          >
            <ProductThumb photos={row.fotos} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate font-semibold">{row.descricao}</span>
              <span className="truncate text-sm text-content-muted">
                {row.marca} · {row.codigo}
              </span>
              <div className="flex items-center gap-2 text-xs text-content-muted">
                <span className="font-semibold text-deep-black tabular-nums">
                  {maskCurrency(String(row.valorAVista))}
                </span>
                <span>· {row.estoqueAtual} em estoque</span>
              </div>
            </div>
          </button>
          <div className="absolute top-3 right-2">
            <DeleteProductButton product={row} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default ProductsCardList
