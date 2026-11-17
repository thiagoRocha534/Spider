import { useAtom } from 'jotai'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { servicesReportFromAtom, servicesReportToAtom } from '../../store'

/**
 * Período do relatório: data inicial e final, inclusive. Sem nenhuma das
 * duas, mostra todos os serviços.
 */
function ServicesReportFilters() {
  const [from, setFrom] = useAtom(servicesReportFromAtom)
  const [to, setTo] = useAtom(servicesReportToAtom)

  const hasFilter = from !== '' || to !== ''

  function clear() {
    setFrom('')
    setTo('')
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <TextField
        label="De"
        type="date"
        value={from}
        onChange={(event) => setFrom(event.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        size="small"
        className="sm:w-48"
      />
      <TextField
        label="Até"
        type="date"
        value={to}
        onChange={(event) => setTo(event.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        size="small"
        className="sm:w-48"
      />
      {hasFilter && (
        <Button variant="text" onClick={clear} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
          Limpar período
        </Button>
      )}
    </div>
  )
}

export default ServicesReportFilters
