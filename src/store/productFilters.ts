import { atom } from 'jotai'

/**
 * Texto da busca aplicada na listagem de produtos. Estado global: o
 * ProductsFilters escreve, o ProductsGrid lê e filtra em memória.
 * Vazio = sem filtro.
 */
export const productsSearchAtom = atom('')

export const applyProductsSearchAtom = atom(null, (_get, set, search: string) => {
  set(productsSearchAtom, search.trim())
})

export const clearProductsSearchAtom = atom(null, (_get, set) => {
  set(productsSearchAtom, '')
})
