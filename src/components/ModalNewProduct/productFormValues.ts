import type { Product, ProductInput, ProductPhoto } from '../../services/products'
import { onlyDigits } from '../../utils/masks'

/** Estado do formulário de produto. Valores em centavos, para a máscara ficar só na exibição. */
export type ProductFormValues = {
  referencia: string
  codigo: string
  descricao: string
  marca: string
  /** Valor à vista em centavos. */
  valorAVista: string
  /** Quantidade em estoque. */
  estoqueAtual: string
  /** Fotos já salvas (só na edição) que o usuário não removeu. */
  photos: ProductPhoto[]
  /** Fotos novas, ainda só no navegador. */
  newPhotos: File[]
}

export type ProductFormErrors = Partial<
  Record<'referencia' | 'codigo' | 'descricao' | 'marca' | 'valorAVista' | 'estoqueAtual', string>
>

export function initialValues(): ProductFormValues {
  return {
    referencia: '',
    codigo: '',
    descricao: '',
    marca: '',
    valorAVista: '',
    estoqueAtual: '',
    photos: [],
    newPhotos: [],
  }
}

export function valuesFromProduct(product: Product): ProductFormValues {
  return {
    referencia: product.referencia,
    codigo: product.codigo,
    descricao: product.descricao,
    marca: product.marca,
    valorAVista: String(product.valorAVista),
    estoqueAtual: String(product.estoqueAtual),
    photos: product.fotos,
    newPhotos: [],
  }
}

export function validate(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {}

  if (!values.referencia.trim()) errors.referencia = 'Informe a referência.'
  if (!values.codigo.trim()) errors.codigo = 'Informe o código.'
  if (!values.descricao.trim()) errors.descricao = 'Informe a descrição do produto.'
  if (!values.marca.trim()) errors.marca = 'Informe a marca do produto.'
  if (!values.valorAVista) errors.valorAVista = 'Informe o valor à vista.'
  if (!values.estoqueAtual) errors.estoqueAtual = 'Informe a quantidade em estoque.'

  return errors
}

export function toPayload(values: ProductFormValues): ProductInput {
  return {
    referencia: values.referencia.trim(),
    codigo: values.codigo.trim(),
    descricao: values.descricao.trim(),
    marca: values.marca.trim(),
    valorAVista: Number(values.valorAVista || 0),
    estoqueAtual: Number(onlyDigits(values.estoqueAtual) || 0),
    fotosExistentes: values.photos,
    novasFotos: values.newPhotos,
  }
}
