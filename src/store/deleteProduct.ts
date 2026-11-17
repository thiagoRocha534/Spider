import { atom } from 'jotai'
import type { Product } from '../services/products'

type DeleteProductDialogState = {
  open: boolean
  /** Produto a excluir. Guardado inteiro para a modal citar a descrição. */
  product: Product | null
}

/** Estado global da modal de confirmação de exclusão. O grid abre, a modal fecha. */
export const deleteProductDialogAtom = atom<DeleteProductDialogState>({
  open: false,
  product: null,
})

export const openDeleteProductDialogAtom = atom(null, (_get, set, product: Product) => {
  set(deleteProductDialogAtom, { open: true, product })
})

/** Fechar mantém o `product`, para o texto não sumir durante a animação de saída. */
export const closeDeleteProductDialogAtom = atom(null, (_get, set) => {
  set(deleteProductDialogAtom, (current) => ({ ...current, open: false }))
})
