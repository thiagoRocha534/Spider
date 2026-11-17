import type { ReactElement, Ref } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Slide from '@mui/material/Slide'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import type { TransitionProps } from '@mui/material/transitions'
import { serviceOrderModalAtom, closeServiceOrderModalAtom } from '../../store'
import ServiceOrderForm from './ServiceOrderForm'

type TransitionSlotProps = TransitionProps & {
  children: ReactElement<unknown>
  ref?: Ref<unknown>
}

/** Entrada deslizando de baixo para cima, igual às outras modais. */
function SlideUpTransition(props: TransitionSlotProps) {
  return <Slide direction="up" {...props} />
}

/**
 * Modal fullscreen de ordem de serviço, no mesmo formato da de orçamento:
 * barra branca no topo, formulário em cards e ações num rodapé fixo (ServiceOrderForm).
 *
 * Não recebe props: lê o estado do `serviceOrderModalAtom`. Quem abre é a Sidebar
 * (`openServiceOrderModalAtom`).
 */
function ModalServiceOrder() {
  const open = useAtomValue(serviceOrderModalAtom)
  const close = useSetAtom(closeServiceOrderModalAtom)

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={close}
      slots={{ transition: SlideUpTransition }}
      slotProps={{ paper: { sx: { borderRadius: 0 } } }}
      aria-labelledby="modal-service-order-title"
    >
      <header className="flex items-center gap-3 border-b border-line bg-surface px-3 py-3 sm:px-6 lg:px-8">
        <IconButton onClick={close} aria-label="Fechar" sx={{ color: 'text.secondary' }}>
          <CloseRoundedIcon />
        </IconButton>
        <div className="flex min-w-0 flex-col leading-tight">
          <h2 id="modal-service-order-title" className="text-[17px] font-semibold tracking-tight">
            Nova ordem de serviço
          </h2>
          <p className="truncate text-[13px] text-content-muted">
            Preencha os dados e confira a pré-visualização antes de gerar o PDF.
          </p>
        </div>
      </header>

      <ServiceOrderForm onClose={close} />
    </Dialog>
  )
}

export default ModalServiceOrder
