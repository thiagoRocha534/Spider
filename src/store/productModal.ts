import { atom } from 'jotai'

type ProductModalState = {
  open: boolean
  /** null = cadastro de um novo produto; número = edição do produto com esse id. */
  productId: number | null
}

/** Estado global da modal de produto. O cabeçalho da página abre para cadastro, o grid para edição. */
export const productModalAtom = atom<ProductModalState>({ open: false, productId: null })

export const openNewProductModalAtom = atom(null, (_get, set) => {
  set(productModalAtom, { open: true, productId: null })
})

export const openEditProductModalAtom = atom(null, (_get, set, productId: number) => {
  set(productModalAtom, { open: true, productId })
})

/** Fechar mantém o `productId`: durante a animação de saída a modal não pisca o título. */
export const closeProductModalAtom = atom(null, (_get, set) => {
  set(productModalAtom, (current) => ({ ...current, open: false }))
})
