import { createElement } from 'react'
import type { ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { saveBlob } from '../../utils/download'
import { normalizePlate } from '../../utils/masks'
import { today } from '../../utils/today'
import type { ServiceOrderFormValues } from './serviceOrderValues'

/**
 * Gera o PDF da ordem de serviço e baixa o arquivo.
 *
 * O react-pdf e o documento são importados sob demanda, como no orçamento: a
 * biblioteca é grande e só é necessária quando alguém clica em "Gerar PDF".
 */
export async function generateServiceOrderPdf(values: ServiceOrderFormValues) {
  const [{ pdf }, { default: ServiceOrderPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./ServiceOrderPdf'),
  ])

  const issuedAt = today()

  const orderDocument = createElement(ServiceOrderPdf, {
    values,
    issuedAt,
  }) as ReactElement<DocumentProps>
  const blob = await pdf(orderDocument).toBlob()

  const orderNumber = String(values.orderNumber).padStart(6, '0')
  const reference = normalizePlate(values.plate) || orderNumber
  saveBlob(blob, `ordem-servico-${orderNumber}-${reference}-${issuedAt}.pdf`)
}
