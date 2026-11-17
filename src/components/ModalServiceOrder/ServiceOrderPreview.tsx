import { maskCurrency } from '../../utils/masks'
import PreviewField from '../PdfPreview/PreviewField'
import PreviewPage from '../PdfPreview/PreviewPage'
import PreviewSection from '../PdfPreview/PreviewSection'
import { isBlankItem, itemTotalCents, itemsTotalCents } from './serviceOrderValues'
import type { ServiceOrderFormValues } from './serviceOrderValues'

/** Mesmas proporções das colunas do ServiceOrderPdf (11% / 49% / 20% / 20%). */
const TABLE_COLUMNS = 'grid grid-cols-[11fr_49fr_20fr_20fr]'

type ServiceOrderPreviewProps = {
  values: ServiceOrderFormValues
}

/**
 * Pré-visualização da ordem de serviço em HTML, atualizada a cada tecla.
 * Espelha o layout do ServiceOrderPdf; mudou o PDF, ajuste aqui também.
 */
function ServiceOrderPreview({ values }: ServiceOrderPreviewProps) {
  const items = values.items.filter((item) => !isBlankItem(item))
  const total = itemsTotalCents(items)
  const orderNumber = String(values.orderNumber).padStart(6, '0')

  return (
    <PreviewPage showPhone>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-bold tracking-wide text-deep-black">
          ORDEM DE SERVIÇO Nº {orderNumber}
        </span>
      </div>

      <PreviewSection title="DADOS DA ORDEM">
        <div className="grid grid-cols-20 gap-x-3 gap-y-2">
          <PreviewField
            label="Data"
            value={values.date.split('-').reverse().join('/')}
            className="col-span-8"
          />
          <PreviewField label="Placa" value={values.plate} className="col-span-8" />
        </div>
      </PreviewSection>

      {values.mode === 'orcamento' ? (
        <>
          <PreviewSection title="PRODUTOS E SERVIÇOS">
            <div className="overflow-hidden rounded border border-line-strong">
              <div
                className={`${TABLE_COLUMNS} border-b border-line-strong bg-light-red text-[8.5px] font-bold tracking-[0.08em] text-spider-red`}
              >
                <span className="px-2 py-1.5 text-center">QUANT.</span>
                <span className="px-2 py-1.5">PRODUTO / SERVIÇO</span>
                <span className="px-2 py-1.5 text-right">PREÇO UNIT.</span>
                <span className="px-2 py-1.5 text-right">SUBTOTAL</span>
              </div>

              {items.length === 0 ? (
                <p className="px-2 py-3 text-center text-content-subtle italic">
                  Os itens aparecem aqui.
                </p>
              ) : (
                items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`${TABLE_COLUMNS} border-b border-line-strong last:border-b-0 ${index % 2 === 1 ? 'bg-[#f7f9fc]' : ''}`}
                  >
                    <span className="px-2 py-1.5 text-center tabular-nums">{item.quantity}</span>
                    <span className="px-2 py-1.5 wrap-break-word">{item.description.trim()}</span>
                    <span className="px-2 py-1.5 text-right tabular-nums">
                      {maskCurrency(item.unitPrice)}
                    </span>
                    <span className="px-2 py-1.5 text-right tabular-nums">
                      {maskCurrency(String(itemTotalCents(item)))}
                    </span>
                  </div>
                ))
              )}
            </div>
          </PreviewSection>

          <div className="ml-auto flex w-[45%] min-w-52 flex-col whitespace-nowrap">
            <div className="flex items-center justify-between gap-3 rounded bg-deep-black px-2.5 py-1.5 text-white">
              <span className="text-[10px] font-bold tracking-[0.15em]">TOTAL</span>
              <span className="text-[14px] font-bold tabular-nums">
                {maskCurrency(String(total)) || 'R$ 0,00'}
              </span>
            </div>
          </div>
        </>
      ) : (
        <PreviewSection title="MANUTENÇÃO">
          <p className="rounded border-l-[3px] border-spider-red bg-light-red p-3 wrap-break-word whitespace-pre-wrap">
            {values.maintenanceDescription.trim() || 'A descrição aparece aqui.'}
          </p>
        </PreviewSection>
      )}

      {values.observation.trim() && (
        <PreviewSection title="OBSERVAÇÕES GERAIS">
          <p className="rounded border-l-[3px] border-spider-red bg-light-red p-3 wrap-break-word whitespace-pre-wrap">
            {values.observation.trim()}
          </p>
        </PreviewSection>
      )}
    </PreviewPage>
  )
}

export default ServiceOrderPreview
