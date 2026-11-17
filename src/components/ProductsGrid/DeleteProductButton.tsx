import type { MouseEvent } from 'react'
import { useSetAtom } from 'jotai'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineRounded'
import type { Product } from '../../services/products'
import { openDeleteProductDialogAtom } from '../../store'

type DeleteProductButtonProps = {
  product: Product
}

/** Lixeira da linha: só abre a confirmação, quem exclui é a DeleteProductDialog. */
function DeleteProductButton({ product }: DeleteProductButtonProps) {
  const openDelete = useSetAtom(openDeleteProductDialogAtom)

  function handleClick(event: MouseEvent) {
    event.stopPropagation()
    openDelete(product)
  }

  return (
    <Tooltip title="Excluir">
      <IconButton
        size="small"
        onClick={handleClick}
        aria-label="Excluir produto"
        sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'error.light' } }}
      >
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  )
}

export default DeleteProductButton
