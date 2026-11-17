import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import type { ProductPhoto } from '../../services/products'

type ProductThumbProps = {
  photos: ProductPhoto[]
}

/** Miniatura da primeira foto do produto, ou um ícone quando não há nenhuma. */
function ProductThumb({ photos }: ProductThumbProps) {
  const [first] = photos

  if (!first) {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-light-red text-spider-red">
        <Inventory2OutlinedIcon fontSize="small" />
      </span>
    )
  }

  return (
    <img
      src={first.dataUrl}
      alt=""
      className="size-10 shrink-0 rounded-lg border border-line object-cover"
    />
  )
}

export default ProductThumb
