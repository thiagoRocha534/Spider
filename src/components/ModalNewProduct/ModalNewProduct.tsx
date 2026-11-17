import { useAtomValue, useSetAtom } from 'jotai'
import { useQuery } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { productGet } from '../../services/products'
import { closeProductModalAtom, productModalAtom } from '../../store'
import ProductForm from './ProductForm'

/** Largura do painel no desktop. No mobile ele ocupa a tela inteira. */
const DRAWER_WIDTH = 560

/** Carrega o produto a editar e só então monta o formulário. */
function EditProductForm({ productId, onClose }: { productId: number; onClose: () => void }) {
  const query = useQuery({
    queryKey: ['products', 'detail', productId],
    queryFn: () => productGet(productId),
    gcTime: 0,
  })

  if (query.isPending) {
    return (
      <div
        className="flex flex-1 items-center justify-center"
        role="status"
        aria-label="Carregando produto"
      >
        <CircularProgress />
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="p-5 sm:p-6">
        <Alert
          severity="error"
          role="alert"
          action={
            <Button color="inherit" size="small" onClick={() => void query.refetch()}>
              Tentar novamente
            </Button>
          }
        >
          Não foi possível carregar o produto.
        </Alert>
      </div>
    )
  }

  return <ProductForm product={query.data} onClose={onClose} />
}

/**
 * Painel lateral de produto: cadastro ou edição, conforme o `productId`.
 * Abre pela direita sobre a listagem, que continua à vista ao fundo.
 */
function ModalNewProduct() {
  const { open, productId } = useAtomValue(productModalAtom)
  const close = useSetAtom(closeProductModalAtom)

  const isEdit = productId !== null

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={close}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': 'modal-new-product-title',
          sx: {
            width: { xs: '100%', sm: DRAWER_WIDTH },
            boxShadow: '-12px 0 40px rgba(28, 28, 30, 0.18)',
          },
        },
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
          <div className="flex flex-col gap-1">
            <h2 id="modal-new-product-title" className="text-xl font-semibold tracking-tight">
              {isEdit ? 'Editar produto' : 'Novo produto'}
            </h2>
            <p className="text-sm text-content-muted">
              {isEdit
                ? `Produto #${productId}`
                : 'Preencha os dados, o preço e as fotos do produto.'}
            </p>
          </div>
          <IconButton onClick={close} aria-label="Fechar" sx={{ color: 'text.secondary', mr: -1 }}>
            <CloseRoundedIcon />
          </IconButton>
        </div>

        {isEdit ? (
          <EditProductForm key={productId} productId={productId} onClose={close} />
        ) : (
          <ProductForm onClose={close} />
        )}
      </div>
    </Drawer>
  )
}

export default ModalNewProduct
