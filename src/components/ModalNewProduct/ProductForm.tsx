import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined'
import { productCreate, productUpdate } from '../../services/products'
import type { Product } from '../../services/products'
import { maskCurrency, onlyDigits } from '../../utils/masks'
import Section from '../FormSection/FormSection'
import ProductPhotosField from './ProductPhotosField'
import { initialValues, toPayload, validate, valuesFromProduct } from './productFormValues'
import type { ProductFormValues } from './productFormValues'

type ProductFormProps = {
  /** Produto a editar. Sem ele, o formulário cadastra um novo. */
  product?: Product
  onClose: () => void
}

/** Moeda digitada da direita para a esquerda: só dígitos, em centavos. */
function toCents(value: string) {
  return String(Number(onlyDigits(value).slice(0, 10)) || '')
}

/**
 * Formulário de produto: cadastra ou, recebendo `product`, edita. Sem abas —
 * os campos cabem todos numa tela só.
 */
function ProductForm({ product, onClose }: ProductFormProps) {
  const isEdit = product !== undefined
  const [values, setValues] = useState<ProductFormValues>(() =>
    product ? valuesFromProduct(product) : initialValues(),
  )
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? validate(values) : {}

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      product ? productUpdate(product.id, toPayload(values)) : productCreate(toPayload(values)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(isEdit ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.')
      onClose()
    },
    onError: () => {
      toast.error(
        isEdit
          ? 'Erro inesperado ao atualizar o produto, tente novamente.'
          : 'Erro inesperado ao cadastrar o produto, tente novamente.',
      )
    },
  })

  function setField<K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(validate(values)).length > 0) return
    mutation.mutate()
  }

  const disabled = mutation.isPending

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-5">
          <Section
            title="Identificação"
            description="Referência, código e descrição do produto."
            icon={<InventoryOutlinedIcon fontSize="small" />}
          >
            <TextField
              label="Referência"
              value={values.referencia}
              onChange={(event) => setField('referencia', event.target.value)}
              error={!!errors.referencia}
              helperText={errors.referencia}
              placeholder="REF-1006"
              autoFocus
              required
              disabled={disabled}
              className="sm:col-span-3"
            />

            <TextField
              label="Código"
              value={values.codigo}
              onChange={(event) => setField('codigo', event.target.value)}
              error={!!errors.codigo}
              helperText={errors.codigo}
              placeholder="CX6-BOMB"
              required
              disabled={disabled}
              className="sm:col-span-3"
            />

            <TextField
              label="Descrição do produto"
              value={values.descricao}
              onChange={(event) => setField('descricao', event.target.value)}
              error={!!errors.descricao}
              helperText={errors.descricao}
              placeholder="Alto-falante coaxial 6&quot; 200W"
              required
              disabled={disabled}
              className="sm:col-span-6"
            />

            <TextField
              label="Marca do produto"
              value={values.marca}
              onChange={(event) => setField('marca', event.target.value)}
              error={!!errors.marca}
              helperText={errors.marca}
              placeholder="Bomber"
              required
              disabled={disabled}
              className="sm:col-span-6"
            />
          </Section>

          <Section
            title="Preço e estoque"
            description="Valor à vista e quantidade disponível."
            icon={<InventoryOutlinedIcon fontSize="small" />}
          >
            <TextField
              label="Valor à vista"
              value={maskCurrency(values.valorAVista)}
              onChange={(event) => setField('valorAVista', toCents(event.target.value))}
              error={!!errors.valorAVista}
              helperText={errors.valorAVista}
              placeholder="R$ 0,00"
              required
              disabled={disabled}
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
              className="sm:col-span-3"
            />

            <TextField
              label="Estoque atual (qtd.)"
              value={values.estoqueAtual}
              onChange={(event) =>
                setField('estoqueAtual', onlyDigits(event.target.value).slice(0, 6))
              }
              error={!!errors.estoqueAtual}
              helperText={errors.estoqueAtual}
              placeholder="0"
              required
              disabled={disabled}
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
              className="sm:col-span-3"
            />
          </Section>

          <Section
            title="Fotos"
            description="Fotos do produto para identificação visual rápida."
            icon={<PhotoLibraryOutlinedIcon fontSize="small" />}
          >
            <ProductPhotosField
              existing={values.photos}
              files={values.newPhotos}
              onFilesChange={(newPhotos) => setField('newPhotos', newPhotos)}
              onRemoveExisting={(photoId) =>
                setField(
                  'photos',
                  values.photos.filter((photo) => photo.id !== photoId),
                )
              }
              disabled={disabled}
            />
          </Section>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-line bg-surface-subtle px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Button variant="outlined" size="large" onClick={onClose} disabled={disabled}>
          Cancelar
        </Button>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={disabled}
          startIcon={disabled ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {disabled ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Cadastrar produto'}
        </Button>
      </div>
    </form>
  )
}

export default ProductForm
