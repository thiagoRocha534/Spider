import { useAtomValue, useSetAtom } from 'jotai'
import { useQuery } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined'
import { DataGrid } from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import { serviceListByPeriod } from '../../services/orders'
import {
  openEditOrderModalAtom,
  servicesReportFromAtom,
  servicesReportToAtom,
} from '../../store'
import { ApiError } from '../../utils/api'
import { maskCurrency } from '../../utils/masks'
import { columns } from './columns'

const ROW_BORDER = '#eef1f5'
const ROW_HEIGHT = 56
const HEADER_HEIGHT = 44
const PAGE_SIZE = 10

/** Mensagem de lista vazia: muda conforme há ou não período aplicado. */
function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2.5 px-5 py-14 text-center">
      <div className="mb-1 flex size-13 items-center justify-center rounded-[14px] bg-light-red text-spider-red">
        <EventBusyOutlinedIcon aria-hidden="true" />
      </div>
      <span className="text-[15px] font-semibold">Nenhum serviço encontrado</span>
      <span className="text-sm text-content-muted">
        {hasFilter
          ? 'Não há serviços registrados nesse período.'
          : 'Ainda não há serviços registrados.'}
      </span>
    </div>
  )
}

/**
 * Lista todos os serviços realizados (de todos os atendimentos) dentro do
 * período escolhido em ServicesReportFilters. Clicar numa linha abre o
 * atendimento daquele serviço para edição.
 */
function ServicesReportGrid() {
  const from = useAtomValue(servicesReportFromAtom)
  const to = useAtomValue(servicesReportToAtom)
  const openEdit = useSetAtom(openEditOrderModalAtom)

  const query = useQuery({
    queryKey: ['services-report', from, to],
    queryFn: () => serviceListByPeriod({ from: from || undefined, to: to || undefined }),
  })

  const errorMessage =
    query.error instanceof ApiError
      ? query.error.message
      : query.error
        ? 'Não foi possível carregar os serviços. Tente novamente.'
        : null

  const rows = query.data ?? []
  const hasFilter = from !== '' || to !== ''
  // `valor` vem em reais; soma primeiro e converte para centavos só na exibição.
  const totalReais = rows.reduce((sum, row) => sum + (row.valor ?? 0), 0)

  return (
    <div className="flex flex-col gap-4">
      {errorMessage && (
        <Alert severity="error" role="alert">
          {errorMessage}
        </Alert>
      )}

      <section
        aria-label="Serviços do período"
        className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(20,23,26,0.04)]"
      >
        <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <span className="text-[13px] text-content-muted tabular-nums" aria-live="polite">
            {query.data
              ? `${rows.length} ${rows.length === 1 ? 'serviço' : 'serviços'}`
              : null}
          </span>
          {query.data && rows.length > 0 && (
            <div className="flex items-baseline gap-2 rounded-lg bg-canvas px-3 py-1.5">
              <span className="text-xs font-semibold tracking-wide text-content-muted uppercase">
                Total
              </span>
              <span className="text-base font-semibold text-deep-black tabular-nums">
                {maskCurrency(String(Math.round(totalReais * 100)))}
              </span>
            </div>
          )}
        </div>

        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.serviceId}
          loading={query.isPending}
          initialState={{ pagination: { paginationModel: { pageSize: PAGE_SIZE, page: 0 } } }}
          pageSizeOptions={[PAGE_SIZE]}
          rowHeight={ROW_HEIGHT}
          columnHeaderHeight={HEADER_HEIGHT}
          slots={{
            noRowsOverlay: () => <EmptyState hasFilter={hasFilter} />,
            noResultsOverlay: () => <EmptyState hasFilter={hasFilter} />,
          }}
          slotProps={{
            loadingOverlay: { variant: 'skeleton', noRowsVariant: 'skeleton' },
          }}
          onRowClick={({ row }) => openEdit(row.orderId)}
          disableRowSelectionOnClick
          disableColumnMenu
          disableColumnResize
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          sx={{
            border: 0,
            borderRadius: 0,
            bgcolor: 'background.paper',
            fontSize: 14,
            borderTop: '1px solid',
            borderTopColor: ROW_BORDER,
            '& .MuiDataGrid-columnHeader, & .MuiDataGrid-filler, & .MuiDataGrid-scrollbarFiller': {
              bgcolor: '#fafbfc',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontSize: 12,
              fontWeight: 500,
              color: 'text.secondary',
              letterSpacing: '0.02em',
            },
            '& .MuiDataGrid-columnSeparator': { display: 'none' },
            '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader': { borderColor: ROW_BORDER },
            '& .MuiDataGrid-cell': { borderColor: ROW_BORDER, display: 'flex', alignItems: 'center' },
            '& .cell-muted': { color: 'text.secondary', fontVariantNumeric: 'tabular-nums' },
            '& .cell-strong': { fontWeight: 600, fontVariantNumeric: 'tabular-nums' },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within':
              { outline: 'none' },
            '& .MuiDataGrid-row': { cursor: 'pointer', transition: 'background-color .15s' },
            '& .MuiDataGrid-row:hover': { bgcolor: '#f7f9fd' },
            '& .MuiDataGrid-footerContainer': { borderColor: ROW_BORDER, minHeight: 52 },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-input': { display: 'none' },
          }}
        />
      </section>
    </div>
  )
}

export default ServicesReportGrid
