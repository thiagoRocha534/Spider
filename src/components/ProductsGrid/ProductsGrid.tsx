import { useAtomValue, useSetAtom } from 'jotai'
import { useQuery } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'
import { DataGrid } from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import { productList } from '../../services/products'
import { openEditProductModalAtom, productsSearchAtom } from '../../store'
import { ApiError } from '../../utils/api'
import ProductsFilters from '../ProductsFilters/ProductsFilters'
import { columns } from './columns'
import { FOOTER_HEIGHT, HEADER_HEIGHT, PAGE_SIZE, ROW_HEIGHT } from './constants'
import ProductsCardList from './ProductsCardList'
import ProductsEmptyState from './ProductsEmptyState'

/** Borda entre linhas: mais clara que a do card, para separar sem pesar. */
const ROW_BORDER = '#eef1f5'

/** Altura de até uma página cheia; acima disso o grid ganha rolagem própria. */
const GRID_HEIGHT = HEADER_HEIGHT + ROW_HEIGHT * PAGE_SIZE + FOOTER_HEIGHT

/**
 * Listagem de produtos dentro de um card, com a busca no topo. Catálogo
 * inteiro em memória: busca e paginação acontecem no navegador.
 *
 * Desktop (md+): DataGrid. Mobile: lista de cards (ProductsCardList).
 */
function ProductsGrid() {
  const search = useAtomValue(productsSearchAtom)
  const openEdit = useSetAtom(openEditProductModalAtom)
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'), { noSsr: true })

  const query = useQuery({
    queryKey: ['products', search],
    queryFn: () => productList({ busca: search || undefined }),
  })

  const errorMessage =
    query.error instanceof ApiError
      ? query.error.message
      : query.error
        ? 'Não foi possível carregar os produtos. Tente novamente.'
        : null

  const rows = query.data ?? []
  const countLabel = query.data
    ? search
      ? `${rows.length} ${rows.length === 1 ? 'resultado' : 'resultados'}`
      : `${rows.length} ${rows.length === 1 ? 'produto' : 'produtos'}`
    : null

  return (
    <div className="flex flex-col gap-4">
      {errorMessage && (
        <Alert severity="error" role="alert">
          {errorMessage}
        </Alert>
      )}

      <section
        aria-label="Lista de produtos"
        className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(20,23,26,0.04)]"
      >
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <ProductsFilters />
          {countLabel && (
            <span className="text-[13px] text-content-muted tabular-nums" aria-live="polite">
              {countLabel}
            </span>
          )}
        </div>

        {isMobile ? (
          <div className="border-t border-line">
            <ProductsCardList rows={rows} loading={query.isPending} />
          </div>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            loading={query.isPending}
            initialState={{ pagination: { paginationModel: { pageSize: PAGE_SIZE, page: 0 } } }}
            pageSizeOptions={[PAGE_SIZE]}
            rowHeight={ROW_HEIGHT}
            columnHeaderHeight={HEADER_HEIGHT}
            slots={{ noRowsOverlay: ProductsEmptyState, noResultsOverlay: ProductsEmptyState }}
            slotProps={{
              loadingOverlay: { variant: 'skeleton', noRowsVariant: 'skeleton' },
            }}
            onRowClick={({ row }) => openEdit(row.id)}
            disableRowSelectionOnClick
            disableColumnMenu
            disableColumnResize
            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            sx={{
              height: GRID_HEIGHT,
              border: 0,
              borderRadius: 0,
              bgcolor: 'background.paper',
              fontSize: 14,
              '& .MuiDataGrid-columnHeader, & .MuiDataGrid-filler, & .MuiDataGrid-scrollbarFiller':
                { bgcolor: '#fafbfc' },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontSize: 12,
                fontWeight: 500,
                color: 'text.secondary',
                letterSpacing: '0.02em',
              },
              '& .MuiDataGrid-columnSeparator': { display: 'none' },
              '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader': {
                borderColor: ROW_BORDER,
              },
              '& .MuiDataGrid-cell': {
                borderColor: ROW_BORDER,
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiDataGrid-cell--textRight': { justifyContent: 'flex-end' },
              '& .cell-muted': { color: 'text.secondary', fontVariantNumeric: 'tabular-nums' },
              '& .cell-strong': { fontWeight: 600, fontVariantNumeric: 'tabular-nums' },
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within':
                { outline: 'none' },
              '& .MuiDataGrid-row': { cursor: 'pointer', transition: 'background-color .15s' },
              '& .MuiDataGrid-row:hover': { bgcolor: '#f7f9fd' },
              '& .MuiDataGrid-footerContainer': { borderColor: ROW_BORDER, minHeight: 52 },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-input': { display: 'none' },
              '@media (hover: hover)': {
                '& .row-actions': { opacity: 0, transition: 'opacity .15s' },
                '& .MuiDataGrid-row:hover .row-actions, & .MuiDataGrid-row:focus-within .row-actions':
                  { opacity: 1 },
              },
            }}
          />
        )}
      </section>
    </div>
  )
}

export default ProductsGrid
