import type { ReactNode } from 'react'
import logo from '../../assets/logo-spider.jpg'
import { WORKSHOP } from '../../constants/workshop'
import { formatDate } from '../../utils/formatDate'
import { today } from '../../utils/today'

type PreviewPageProps = {
  /** Mostra o telefone da loja em destaque, como o PdfHeader do orçamento. */
  showPhone?: boolean
  children: ReactNode
}

/**
 * Folha da pré-visualização em HTML: cabeçalho timbrado, conteúdo e rodapé,
 * espelhando o PdfHeader e o PdfFooter. Mudou o PDF, ajuste aqui também.
 */
function PreviewPage({ showPhone = false, children }: PreviewPageProps) {
  return (
    <div
      aria-hidden="true"
      className="flex min-h-160 flex-col overflow-hidden rounded-md border border-line bg-white text-[11.5px] leading-normal text-content shadow-[0_12px_32px_rgba(28,28,30,0.10),0_2px_6px_rgba(28,28,30,0.06)]"
    >
      <div className="flex items-start justify-between gap-4 bg-deep-black px-7 py-3.5 text-white">
        <img src={logo} alt="" className="size-11 shrink-0 rounded-full object-cover" />
        <div className="mr-auto flex min-w-0 flex-col gap-0.5">
          <span className="text-[15px] font-bold tracking-wide">
            {WORKSHOP.tradeName.toUpperCase()}
          </span>
          <span className="text-[9px] opacity-75">CNPJ {WORKSHOP.cnpj}</span>
          <span className="text-[9px] opacity-75">
            {WORKSHOP.street} · {WORKSHOP.district} · {WORKSHOP.city}
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {showPhone && <span className="text-[11px] font-bold">Fone {WORKSHOP.phone}</span>}
          <span className="text-[9px] opacity-75">Emitido em {formatDate(today())}</span>
        </div>
      </div>
      <div className="h-1 bg-spider-red" />

      <div className="flex flex-1 flex-col gap-5 px-7 pt-6 pb-4">
        {children}

        <span className="mt-auto border-t border-line-strong pt-1.5 text-[9px] text-content-muted">
          {WORKSHOP.tradeName} · CNPJ {WORKSHOP.cnpj}
        </span>
      </div>
    </div>
  )
}

export default PreviewPage
