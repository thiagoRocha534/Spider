import { useSetAtom } from 'jotai'
import Button from '@mui/material/Button'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { openNewProductModalAtom } from '../../store'

/** Cabeçalho da tela de produtos: título, descrição e a ação principal. */
function ProductsHeader() {
  const openNewProduct = useSetAtom(openNewProductModalAtom)

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Produtos</h1>
        <p className="text-sm text-content-muted">
          Catálogo da loja. Clique em um produto para editar.
        </p>
      </div>

      <Button
        variant="contained"
        size="large"
        onClick={openNewProduct}
        startIcon={<AddRoundedIcon />}
        sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'auto' } }}
      >
        Novo produto
      </Button>
    </header>
  )
}

export default ProductsHeader
