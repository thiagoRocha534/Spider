import { ApiError, mockDelay } from '../utils/api'

/** Anexo de um serviço. */
export type Attachment = {
  id: number
  nome: string
  /** Content-Type do arquivo (ex.: "image/jpeg"). */
  tipo: string
  caminho: string
}

/** Serviço realizado num atendimento. Um atendimento tem um ou mais. */
export type Service = {
  id: number
  descricao: string
  valor: number | null
  /** Data no formato ISO (AAAA-MM-DD). */
  data: string | null
  anexos: Attachment[]
}

/** Atendimento (cliente + veículo + serviços realizados). */
export type Order = {
  id: number
  cliente: string | null
  veiculo: string | null
  /** Cor do veículo. */
  cor: string | null
  placa: string | null
  telefone: string | null
  observacao: string | null
  servicos: Service[]
  /** Soma dos valores dos serviços. */
  valorTotal: number
}

/** Uma linha do relatório de serviços por período: o serviço com os dados do atendimento. */
export type ServiceReportRow = {
  orderId: number
  serviceId: number
  data: string
  cliente: string | null
  veiculo: string | null
  placa: string | null
  descricao: string
  valor: number | null
}

export type ServiceReportParams = {
  /** Data inicial (AAAA-MM-DD), inclusive. Vazia = sem limite inferior. */
  from?: string
  /** Data final (AAAA-MM-DD), inclusive. Vazia = sem limite superior. */
  to?: string
}

export type ListOrdersParams = {
  busca?: string
  page: number
  size: number
  /** "campo,asc" ou "campo,desc" (ex.: "cliente,asc"). */
  sort?: string
}

export type Page<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export type ServiceInput = {
  id?: number
  descricao: string
  valor: number
  data: string
  /** Arquivos novos deste serviço, somados aos anexos que ele já tem. */
  files: File[]
  /** Apaga todos os anexos atuais do serviço antes de gravar os `files`. */
  apagarAnexos?: boolean
}

export type OrderInput = {
  cliente: string
  veiculo: string
  cor: string
  placa: string
  telefone: string
  observacao: string | null
  servicos: ServiceInput[]
}

/** Limite para o total de arquivos novos de uma gravação. */
export const ATTACHMENTS_MAX_BYTES = 100 * 1024 * 1024

/* ------------------------------------------------------------------ */
/* "Banco" em memória — reinicia a cada carga da página                */
/* ------------------------------------------------------------------ */

let nextOrderId = 1
let nextServiceId = 1
let nextAttachmentId = 1

/** Conteúdo real dos anexos novos, para o "download" devolver algo de verdade. */
const attachmentBlobs = new Map<number, Blob>()

function makeAttachment(file: File): Attachment {
  const id = nextAttachmentId++
  attachmentBlobs.set(id, file)
  return { id, nome: file.name, tipo: file.type || 'application/octet-stream', caminho: 'mock' }
}

function makeService(input: ServiceInput, existing?: Service): Service {
  const anexosAtuais = input.apagarAnexos ? [] : (existing?.anexos ?? [])
  return {
    id: input.id ?? nextServiceId++,
    descricao: input.descricao,
    valor: input.valor,
    data: input.data,
    anexos: [...anexosAtuais, ...input.files.filter((f) => f.size > 0).map(makeAttachment)],
  }
}

function valorTotal(servicos: Service[]) {
  return servicos.reduce((sum, s) => sum + (s.valor ?? 0), 0)
}

function seedOrder(data: Omit<Order, 'id' | 'valorTotal'>): Order {
  const servicos = data.servicos.map((s) => ({ ...s, id: nextServiceId++ }))
  return { ...data, id: nextOrderId++, servicos, valorTotal: valorTotal(servicos) }
}

let orders: Order[] = [
  seedOrder({
    cliente: 'Carlos Eduardo Ramos',
    veiculo: 'Honda Civic',
    cor: 'Prata',
    placa: 'PYG8754',
    telefone: '14991234567',
    observacao: 'Cliente pediu para priorizar o acabamento do porta-malas.',
    servicos: [
      {
        id: 0,
        descricao: 'Instalação de central multimídia Android 9" + câmera de ré',
        valor: 980,
        data: '2026-10-12',
        anexos: [],
      },
      {
        id: 0,
        descricao: 'Troca do conjunto de alto-falantes dianteiros (Bomber 6")',
        valor: 420,
        data: '2026-10-12',
        anexos: [],
      },
    ],
  }),
  seedOrder({
    cliente: 'Marina Toledo Ferraz',
    veiculo: 'Jeep Compass',
    cor: 'Branco',
    placa: 'ABC1234',
    telefone: '14998877665',
    observacao: null,
    servicos: [
      {
        id: 0,
        descricao: 'Aplicação de insulfilm G5 em todo o veículo',
        valor: 650,
        data: '2026-10-18',
        anexos: [],
      },
    ],
  }),
  seedOrder({
    cliente: 'Roberto Nakamura',
    veiculo: 'Fiat Toro',
    cor: 'Preto',
    placa: 'QWE9988',
    telefone: '14997766554',
    observacao: 'Veículo com alarme de terceiros, verificar compatibilidade.',
    servicos: [
      {
        id: 0,
        descricao: 'Instalação de alarme automotivo com sensor de presença',
        valor: 380,
        data: '2026-09-30',
        anexos: [],
      },
      {
        id: 0,
        descricao: 'Instalação de módulo amplificador 4 canais + subwoofer 10"',
        valor: 1150,
        data: '2026-10-05',
        anexos: [],
      },
    ],
  }),
  seedOrder({
    cliente: 'Juliana Prado',
    veiculo: 'Chevrolet Onix',
    cor: 'Vermelho',
    placa: 'XYZ5566',
    telefone: '14996655443',
    observacao: null,
    servicos: [
      {
        id: 0,
        descricao: 'Revisão da fiação do som original, ruído em marcha-lenta',
        valor: 150,
        data: '2026-10-22',
        anexos: [],
      },
    ],
  }),
  seedOrder({
    cliente: 'Eduardo Lima Santos',
    veiculo: 'Volkswagen Polo',
    cor: 'Azul',
    placa: 'JLK4321',
    telefone: '14995544332',
    observacao: 'Troca agendada para buscar peça importada.',
    servicos: [
      {
        id: 0,
        descricao: 'Troca de película traseira (quebrou ao desembaçar)',
        valor: 180,
        data: '2026-10-27',
        anexos: [],
      },
    ],
  }),
]

/* ------------------------------------------------------------------ */
/* "Endpoints" — todos aceitam `signal` só por compatibilidade          */
/* ------------------------------------------------------------------ */

function matchesSearch(order: Order, search: string) {
  const haystack = [
    order.cliente,
    order.veiculo,
    order.cor,
    order.placa,
    order.telefone,
    order.observacao,
    ...order.servicos.map((s) => s.descricao),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(search.toLowerCase())
}

function compareBy(field: string, direction: 'asc' | 'desc') {
  return (a: Order, b: Order) => {
    const av = (a[field as keyof Order] ?? '') as string
    const bv = (b[field as keyof Order] ?? '') as string
    const result = String(av).localeCompare(String(bv))
    return direction === 'desc' ? -result : result
  }
}

/** Lista os atendimentos com busca, ordenação e paginação (tudo em memória). */
export async function serviceList(
  params: ListOrdersParams,
  _signal?: AbortSignal,
): Promise<Page<Order>> {
  await mockDelay()

  let filtered = params.busca ? orders.filter((o) => matchesSearch(o, params.busca!)) : orders
  // Mais recentes primeiro por padrão, como um banco faria pela data de criação.
  filtered = [...filtered].sort((a, b) => b.id - a.id)

  if (params.sort) {
    const [field, direction] = params.sort.split(',') as [string, 'asc' | 'desc']
    filtered = [...filtered].sort(compareBy(field, direction))
  }

  const totalElements = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalElements / params.size))
  const start = params.page * params.size
  const content = filtered.slice(start, start + params.size)

  return { content, totalElements, totalPages, number: params.page, size: params.size }
}

/** Busca um atendimento pelo id. */
export async function serviceGet(id: number, _signal?: AbortSignal): Promise<Order> {
  await mockDelay()
  const order = orders.find((o) => o.id === id)
  if (!order) throw new ApiError('Atendimento não encontrado.', 404, 'HTTP_404')
  return order
}

/** Cadastra um atendimento com seus serviços e anexos. */
export async function serviceCreate(body: OrderInput): Promise<Order> {
  await mockDelay()
  const servicos = body.servicos.map((input) => makeService(input))
  const order: Order = {
    id: nextOrderId++,
    cliente: body.cliente,
    veiculo: body.veiculo,
    cor: body.cor,
    placa: body.placa,
    telefone: body.telefone,
    observacao: body.observacao,
    servicos,
    valorTotal: valorTotal(servicos),
  }
  orders = [order, ...orders]
  return order
}

/** Exclui um atendimento. */
export async function serviceDelete(id: number): Promise<void> {
  await mockDelay()
  orders = orders.filter((o) => o.id !== id)
}

/** Atualiza um atendimento. Serviços fora da lista enviada são excluídos. */
export async function serviceUpdate(id: number, body: OrderInput): Promise<Order> {
  await mockDelay()
  const current = orders.find((o) => o.id === id)
  if (!current) throw new ApiError('Atendimento não encontrado.', 404, 'HTTP_404')

  const servicos = body.servicos.map((input) => {
    const existing = input.id ? current.servicos.find((s) => s.id === input.id) : undefined
    return makeService(input, existing)
  })

  const updated: Order = {
    ...current,
    cliente: body.cliente,
    veiculo: body.veiculo,
    cor: body.cor,
    placa: body.placa,
    telefone: body.telefone,
    observacao: body.observacao,
    servicos,
    valorTotal: valorTotal(servicos),
  }
  orders = orders.map((o) => (o.id === id ? updated : o))
  return updated
}

/** Baixa o conteúdo de um anexo (o arquivo real, enquanto a aba não recarrega). */
export async function serviceDownloadAttachment(
  _serviceId: number,
  attachmentId: number,
): Promise<Blob> {
  await mockDelay(150)
  return (
    attachmentBlobs.get(attachmentId) ?? new Blob(['Anexo de demonstração.'], { type: 'text/plain' })
  )
}

/** Exclui um único anexo de um serviço. */
export async function serviceDeleteAttachment(
  serviceId: number,
  attachmentId: number,
): Promise<void> {
  await mockDelay(150)
  attachmentBlobs.delete(attachmentId)
  orders = orders.map((order) => ({
    ...order,
    servicos: order.servicos.map((service) =>
      service.id === serviceId
        ? { ...service, anexos: service.anexos.filter((a) => a.id !== attachmentId) }
        : service,
    ),
  }))
}

/**
 * Lista os serviços realizados num período, de todos os atendimentos, do
 * mais recente para o mais antigo. Serviço sem data não entra: não dá para
 * saber se cai dentro do período.
 */
export async function serviceListByPeriod(params: ServiceReportParams = {}): Promise<ServiceReportRow[]> {
  await mockDelay()

  const rows: ServiceReportRow[] = []
  for (const order of orders) {
    for (const service of order.servicos) {
      if (!service.data) continue
      if (params.from && service.data < params.from) continue
      if (params.to && service.data > params.to) continue

      rows.push({
        orderId: order.id,
        serviceId: service.id,
        data: service.data,
        cliente: order.cliente,
        veiculo: order.veiculo,
        placa: order.placa,
        descricao: service.descricao,
        valor: service.valor,
      })
    }
  }

  return rows.sort((a, b) => b.data.localeCompare(a.data))
}
