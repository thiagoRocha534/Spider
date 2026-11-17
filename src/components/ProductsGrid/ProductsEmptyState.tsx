import { useAtomValue, useSetAtom } from 'jotai'
import Button from '@mui/material/Button'
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { clearProductsSearchAtom, openNewProductModalAtom, productsSearchAtom } from '../../store'

/**
 * Lista vazia. Com busca aplicada, sugere limpar; sem busca, ainda não há
 * produtos, então convida a cadastrar o primeiro.
 */
function ProductsEmptyState() {
  const search = useAtomValue(productsSearchAtom)
  const clearSearch = useSetAtom(clearProductsSearchAtom)
  const openNewProduct = useSetAtom(openNewProductModalAtom)

  const Icon = search ? SearchOffRoundedIcon : Inventory2OutlinedIcon

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2.5 px-5 py-14 text-center">
      <div className="mb-1 flex size-13 items-center justify-center rounded-[14px] bg-light-red text-spider-red">
        <Icon aria-hidden="true" />
      </div>
      <span className="text-[15px] font-semibold">
        {search ? 'Nenhum produto encontrado' : 'Nenhum produto ainda'}
      </span>
      <span className="text-sm text-content-muted">
        {search
          ? 'Tente outro termo ou limpe a busca para ver todos.'
          : 'Cadastre o primeiro produto para ele aparecer aqui.'}
      </span>
      <Button variant="outlined" onClick={search ? clearSearch : openNewProduct} sx={{ mt: 1 }}>
        {search ? 'Limpar busca' : 'Novo produto'}
      </Button>
    </div>
  )
}

export default ProductsEmptyState
