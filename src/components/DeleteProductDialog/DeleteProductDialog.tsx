import { useAtomValue, useSetAtom } from 'jotai'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { productDelete } from '../../services/products'
import { closeDeleteProductDialogAtom, deleteProductDialogAtom } from '../../store'

/**
 * Confirmação de exclusão de produto.
 *
 * Não recebe props: lê o `deleteProductDialogAtom`, que o botão de lixeira do grid abre.
 */
function DeleteProductDialog() {
  const { open, product } = useAtomValue(deleteProductDialogAtom)
  const close = useSetAtom(closeDeleteProductDialogAtom)

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: productDelete,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto excluído com sucesso.')
      close()
    },
    onError: () => {
      toast.error('Erro inesperado ao excluir o produto, tente novamente.')
    },
  })

  const pending = mutation.isPending

  function handleClose() {
    if (!pending) close()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{ transition: { onExited: () => mutation.reset() } }}
      maxWidth="xs"
      fullWidth
      aria-labelledby="delete-product-title"
      aria-describedby="delete-product-description"
    >
      <DialogContent className="flex flex-col items-center pt-8! text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-danger-light">
          <WarningAmberRoundedIcon className="text-danger" sx={{ fontSize: 36 }} />
        </div>

        <DialogTitle id="delete-product-title" className="p-0! text-content" sx={{ fontWeight: 600 }}>
          Excluir produto?
        </DialogTitle>

        <DialogContentText id="delete-product-description" sx={{ mt: 1 }}>
          {product && (
            <>
              O produto <strong>{product.descricao}</strong> ({product.codigo}) será excluído.{' '}
            </>
          )}
          Tem certeza? Essa ação não pode ser desfeita.
        </DialogContentText>
      </DialogContent>

      <DialogActions className="flex-col-reverse gap-3 px-6! pb-6! sm:flex-row">
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={pending}
          fullWidth
          sx={{ m: '0 !important' }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={() => product && mutation.mutate(product.id)}
          disabled={pending || !product}
          fullWidth
          startIcon={pending ? <CircularProgress size={18} color="inherit" /> : undefined}
          sx={{ m: '0 !important' }}
        >
          {pending ? 'Excluindo...' : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteProductDialog
