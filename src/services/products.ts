import { ApiError, mockDelay } from '../utils/api'

/** Foto de um produto, guardada como data URL (base64) para sobreviver no estado do app. */
export type ProductPhoto = {
  id: number
  nome: string
  dataUrl: string
}

/** Produto do catálogo da loja. */
export type Product = {
  id: number
  referencia: string
  codigo: string
  descricao: string
  marca: string
  /** Valor à vista, em centavos. */
  valorAVista: number
  /** Quantidade em estoque. */
  estoqueAtual: number
  fotos: ProductPhoto[]
}

export type ListProductsParams = {
  busca?: string
}

export type ProductInput = {
  referencia: string
  codigo: string
  descricao: string
  marca: string
  valorAVista: number
  estoqueAtual: number
  /** Fotos já salvas que o usuário manteve. */
  fotosExistentes: ProductPhoto[]
  /** Fotos novas, ainda só no navegador. */
  novasFotos: File[]
}

let nextProductId = 1
let nextPhotoId = 1

/** "arquivo.jpg" -> "data:image/jpeg;base64,...". */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function buildPhotos(files: File[]): Promise<ProductPhoto[]> {
  return Promise.all(
    files.map(async (file) => ({
      id: nextPhotoId++,
      nome: file.name,
      dataUrl: await fileToDataUrl(file),
    })),
  )
}

function seedProduct(data: Omit<Product, 'id' | 'fotos'>): Product {
  return { ...data, id: nextProductId++, fotos: [] }
}

let products: Product[] = [
  seedProduct({
    referencia: 'REF-1001',
    codigo: 'CX6-BOMB',
    descricao: 'Alto-falante coaxial 6" 200W',
    marca: 'Bomber',
    valorAVista: 18900,
    estoqueAtual: 14,
  }),
  seedProduct({
    referencia: 'REF-1002',
    codigo: 'MOD4-TAR',
    descricao: 'Módulo amplificador 4 canais 800W RMS',
    marca: 'Taramps',
    valorAVista: 89900,
    estoqueAtual: 5,
  }),
  seedProduct({
    referencia: 'REF-1003',
    codigo: 'MM9-PIO',
    descricao: 'Central multimídia 9" Android Auto/CarPlay',
    marca: 'Pioneer',
    valorAVista: 149900,
    estoqueAtual: 3,
  }),
  seedProduct({
    referencia: 'REF-1004',
    codigo: 'INS-G5',
    descricao: 'Película de insulfilm G5 (rolo 75cm)',
    marca: 'Llumar',
    valorAVista: 32000,
    estoqueAtual: 22,
  }),
  seedProduct({
    referencia: 'REF-1005',
    codigo: 'ALM-PRES',
    descricao: 'Alarme automotivo com sensor de presença',
    marca: 'Positron',
    valorAVista: 42000,
    estoqueAtual: 8,
  }),
]

function matchesSearch(product: Product, search: string) {
  const haystack = [product.referencia, product.codigo, product.descricao, product.marca]
    .join(' ')
    .toLowerCase()
  return haystack.includes(search.toLowerCase())
}

/** Lista os produtos do catálogo (tudo em memória). */
export async function productList(params: ListProductsParams = {}): Promise<Product[]> {
  await mockDelay()
  const filtered = params.busca ? products.filter((p) => matchesSearch(p, params.busca!)) : products
  return [...filtered].sort((a, b) => b.id - a.id)
}

/** Busca um produto pelo id. */
export async function productGet(id: number): Promise<Product> {
  await mockDelay()
  const product = products.find((p) => p.id === id)
  if (!product) throw new ApiError('Produto não encontrado.', 404, 'HTTP_404')
  return product
}

/** Cadastra um produto com suas fotos. */
export async function productCreate(input: ProductInput): Promise<Product> {
  await mockDelay()
  const product: Product = {
    id: nextProductId++,
    referencia: input.referencia,
    codigo: input.codigo,
    descricao: input.descricao,
    marca: input.marca,
    valorAVista: input.valorAVista,
    estoqueAtual: input.estoqueAtual,
    fotos: [...input.fotosExistentes, ...(await buildPhotos(input.novasFotos))],
  }
  products = [product, ...products]
  return product
}

/** Atualiza um produto. */
export async function productUpdate(id: number, input: ProductInput): Promise<Product> {
  await mockDelay()
  const current = products.find((p) => p.id === id)
  if (!current) throw new ApiError('Produto não encontrado.', 404, 'HTTP_404')

  const updated: Product = {
    ...current,
    referencia: input.referencia,
    codigo: input.codigo,
    descricao: input.descricao,
    marca: input.marca,
    valorAVista: input.valorAVista,
    estoqueAtual: input.estoqueAtual,
    fotos: [...input.fotosExistentes, ...(await buildPhotos(input.novasFotos))],
  }
  products = products.map((p) => (p.id === id ? updated : p))
  return updated
}

/** Exclui um produto. */
export async function productDelete(id: number): Promise<void> {
  await mockDelay()
  products = products.filter((p) => p.id !== id)
}
