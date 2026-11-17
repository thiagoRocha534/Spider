import ServicesReportFilters from '../../components/ServicesReportFilters/ServicesReportFilters'
import ServicesReportGrid from '../../components/ServicesReportGrid/ServicesReportGrid'

/** Tela de relatório: todos os serviços realizados num período escolhido. */
function ServicesReport() {
  return (
    <>
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
          Serviços por período
        </h1>
        <p className="text-sm text-content-muted">
          Escolha um período para ver todos os serviços realizados nele. Clique num serviço para
          abrir o atendimento.
        </p>
      </header>

      <ServicesReportFilters />
      <ServicesReportGrid />
    </>
  )
}

export default ServicesReport
