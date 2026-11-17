import type { MouseEvent } from 'react'
import { useSetAtom } from 'jotai'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { openEditProductModalAtom } from '../../store'

type EditProductButtonProps = {
  productId: number
}

/** Ícone de edição da linha. Faz o mesmo que clicar na linha. */
function EditProductButton({ productId }: EditProductButtonProps) {
  const openEdit = useSetAtom(openEditProductModalAtom)

  function handleClick(event: MouseEvent) {
    event.stopPropagation()
    openEdit(productId)
  }

  return (
    <Tooltip title="Editar">
      <IconButton
        size="small"
        onClick={handleClick}
        aria-label="Editar produto"
        sx={{
          color: 'text.secondary',
          '&:hover': { color: 'primary.main', bgcolor: 'primary.light' },
        }}
      >
        <EditOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  )
}

export default EditProductButton
