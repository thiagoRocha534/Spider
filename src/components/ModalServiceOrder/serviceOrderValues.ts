import { today } from '../../utils/today'

/**
 * Estado do formulário de ordem de serviço, no modelo do talão de papel da
 * loja (número, data, placa e os produtos/serviços ou só a manutenção).
 *
 * Tudo texto, como o input entrega; valores em centavos, para as máscaras
 * ficarem só na exibição.
 */
export type ServiceOrderMode = 'orcamento' | 'manutencao'

export type ServiceOrderItem = {
  /** Chave estável da linha, para o React não misturar linhas ao remover. */
  id: string
  quantity: string
  description: string
  /** Preço unitário em centavos. */
  unitPrice: string
}

export type ServiceOrderFormValues = {
  /** Número sequencial, só exibição — não é digitado. */
  orderNumber: number
  date: string
  plate: string
  mode: ServiceOrderMode
  items: ServiceOrderItem[]
  /** Usado só no modo "apenas manutenção". */
  maintenanceDescription: string
  /** Campo livre, igual ao "Observações Gerais" do talão. */
  observation: string
}

export const OBSERVATION_MAX_LENGTH = 500
export const MAINTENANCE_MAX_LENGTH = 800

type ItemErrors = Partial<Record<'quantity' | 'description' | 'unitPrice', string>>

export type ServiceOrderFormErrors = Partial<Record<'plate' | 'maintenanceDescription', string>> & {
  /** Erros por linha da tabela, pela `id` do item. */
  items?: Record<string, ItemErrors>
  /** Erro da ordem como um todo (ex.: nada para cobrar). */
  general?: string
}

/** De 3 a 7 letras ou números, em qualquer ordem: aceita placa parcial ou completa. */
const PLATE_PATTERN = /^[A-Z0-9]{3,7}$/

export function emptyItem(): ServiceOrderItem {
  return { id: crypto.randomUUID(), quantity: '1', description: '', unitPrice: '' }
}

export function initialValues(orderNumber: number): ServiceOrderFormValues {
  return {
    orderNumber,
    date: today(),
    plate: '',
    mode: 'orcamento',
    items: [emptyItem()],
    maintenanceDescription: '',
    observation: '',
  }
}

/** Linha sem produto nem preço: não entra no PDF nem na validação. */
export function isBlankItem(item: ServiceOrderItem) {
  return !item.description.trim() && !item.unitPrice
}

/** Quantidade × preço unitário, em centavos. */
export function itemTotalCents(item: ServiceOrderItem) {
  return Number(item.quantity || 0) * Number(item.unitPrice || 0)
}

/** Soma dos itens, em centavos. */
export function itemsTotalCents(items: ServiceOrderItem[]) {
  return items.reduce((sum, item) => sum + itemTotalCents(item), 0)
}

/**
 * Devolve só os campos com erro; objeto vazio = formulário válido.
 *
 * No modo "orçamento" é preciso ao menos um item; no modo "apenas manutenção",
 * a descrição da manutenção é obrigatória.
 */
export function validate(values: ServiceOrderFormValues): ServiceOrderFormErrors {
  const errors: ServiceOrderFormErrors = {}

  if (values.plate && !PLATE_PATTERN.test(values.plate)) {
    errors.plate = 'Informe ao menos 3 letras ou números.'
  }

  if (values.mode === 'manutencao') {
    if (!values.maintenanceDescription.trim()) {
      errors.maintenanceDescription = 'Descreva a manutenção realizada.'
    }
    return errors
  }

  const itemErrors: Record<string, ItemErrors> = {}
  for (const item of values.items) {
    if (isBlankItem(item)) continue

    const error: ItemErrors = {}
    if (!Number(item.quantity)) error.quantity = 'Informe a quantidade.'
    if (!item.description.trim()) error.description = 'Informe o produto ou serviço.'
    if (!item.unitPrice) error.unitPrice = 'Informe o preço.'
    if (Object.keys(error).length > 0) itemErrors[item.id] = error
  }
  if (Object.keys(itemErrors).length > 0) errors.items = itemErrors

  const hasItems = values.items.some((item) => !isBlankItem(item))
  if (!hasItems) errors.general = 'Adicione ao menos um produto ou serviço.'

  return errors
}
