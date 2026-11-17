import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

/** A modal de ordem de serviço está aberta? Estado global: a Sidebar abre, a modal fecha. */
export const serviceOrderModalAtom = atom(false)

export const openServiceOrderModalAtom = atom(null, (_get, set) => {
  set(serviceOrderModalAtom, true)
})

export const closeServiceOrderModalAtom = atom(null, (_get, set) => {
  set(serviceOrderModalAtom, false)
})

/**
 * Próximo número de ordem de serviço, sequencial. Persistido para números
 * novos não repetirem entre uma gravação de PDF e outra.
 */
export const nextServiceOrderNumberAtom = atomWithStorage<number>(
  'spider:next-service-order-number',
  1,
  undefined,
  { getOnInit: true },
)
