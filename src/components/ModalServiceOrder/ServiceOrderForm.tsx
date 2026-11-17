import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAtom } from 'jotai'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined'
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined'
import { nextServiceOrderNumberAtom } from '../../store'
import { maskCurrency, normalizePlate, onlyDigits } from '../../utils/masks'
import Section from '../FormSection/FormSection'
import {
  MAINTENANCE_MAX_LENGTH,
  OBSERVATION_MAX_LENGTH,
  emptyItem,
  initialValues,
  isBlankItem,
  itemTotalCents,
  itemsTotalCents,
  validate,
} from './serviceOrderValues'
import type { ServiceOrderFormValues, ServiceOrderItem, ServiceOrderMode } from './serviceOrderValues'
import { generateServiceOrderPdf } from './generateServiceOrderPdf'
import ServiceOrderPreview from './ServiceOrderPreview'

type ServiceOrderFormProps = {
  /** Chamado ao cancelar. Gerar o PDF não fecha: dá para ajustar e gerar de novo. */
  onClose: () => void
}

const MAX_VISIBLE_ITEMS = 5

type ItemField = Exclude<keyof ServiceOrderItem, 'id'>

/** Moeda digitada da direita para a esquerda, como nos outros forms: só dígitos, em centavos. */
function toCents(value: string) {
  return String(Number(onlyDigits(value).slice(0, 10)) || '')
}

/**
 * Formulário da ordem de serviço, no modelo do talão da loja. Não salva nada:
 * só monta o PDF com o que foi preenchido. O número é sequencial e avança a
 * cada PDF gerado com sucesso.
 */
function ServiceOrderForm({ onClose }: ServiceOrderFormProps) {
  const [nextNumber, setNextNumber] = useAtom(nextServiceOrderNumberAtom)
  const [values, setValues] = useState(() => initialValues(nextNumber))

  const [focusItemId, setFocusItemId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? validate(values) : {}

  const mutation = useMutation({
    mutationFn: generateServiceOrderPdf,
    onSuccess: () => {
      toast.success('PDF da ordem de serviço gerado com sucesso.')
      setNextNumber((current) => current + 1)
      setValues((current) => initialValues(current.orderNumber + 1))
      setSubmitted(false)
    },
    onError: () => toast.error('Erro inesperado ao gerar o PDF, tente novamente.'),
  })

  function setField<K extends keyof ServiceOrderFormValues>(
    field: K,
    value: ServiceOrderFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function setMode(mode: ServiceOrderMode | null) {
    if (mode) setField('mode', mode)
  }

  function setItemField(id: string, field: ItemField, value: string) {
    setValues((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }))
  }

  function addItem() {
    const item = emptyItem()
    setFocusItemId(item.id)
    setValues((current) => ({ ...current, items: [...current.items, item] }))
  }

  function removeItem(id: string) {
    setValues((current) => {
      const items = current.items.filter((item) => item.id !== id)
      return { ...current, items: items.length > 0 ? items : [emptyItem()] }
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(validate(values)).length > 0) return
    mutation.mutate(values)
  }

  const disabled = mutation.isPending
  const items = values.items.filter((item) => !isBlankItem(item))
  const total = itemsTotalCents(items)
  const orderNumberLabel = String(values.orderNumber).padStart(6, '0')

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto bg-canvas px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex max-w-320 flex-col gap-8 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <Section
              title="Dados da ordem"
              description="Número, data e placa do veículo."
              icon={<NumbersOutlinedIcon fontSize="small" />}
            >
              <TextField
                label="Número da ordem"
                value={orderNumberLabel}
                disabled
                slotProps={{ inputLabel: { shrink: true } }}
                className="sm:col-span-2"
              />

              <TextField
                label="Data"
                type="date"
                value={values.date}
                onChange={(event) => setField('date', event.target.value)}
                disabled={disabled}
                slotProps={{ inputLabel: { shrink: true } }}
                className="sm:col-span-2"
              />

              <TextField
                label="Placa"
                value={values.plate}
                onChange={(event) => setField('plate', normalizePlate(event.target.value))}
                error={!!errors.plate}
                helperText={errors.plate}
                placeholder="ABC1D23"
                disabled={disabled}
                slotProps={{ htmlInput: { autoCapitalize: 'characters' } }}
                className="sm:col-span-2"
              />
            </Section>

            <Section
              title="Produtos e serviços"
              description="Faça um orçamento por item ou registre apenas uma manutenção."
              icon={<Inventory2OutlinedIcon fontSize="small" />}
            >
              <ToggleButtonGroup
                value={values.mode}
                exclusive
                onChange={(_event, mode) => setMode(mode)}
                disabled={disabled}
                className="sm:col-span-6"
              >
                <ToggleButton value="orcamento" sx={{ textTransform: 'none', fontWeight: 600 }}>
                  Orçamento por produto e serviço
                </ToggleButton>
                <ToggleButton value="manutencao" sx={{ textTransform: 'none', fontWeight: 600 }}>
                  Apenas manutenção
                </ToggleButton>
              </ToggleButtonGroup>

              {values.mode === 'orcamento' ? (
                <div className="flex flex-col gap-3 sm:col-span-6">
                  <div className="hidden grid-cols-12 gap-3 px-1 text-xs font-semibold tracking-wide text-content-muted uppercase sm:grid">
                    <span className="col-span-2">Quant.</span>
                    <span className="col-span-5">Produto / serviço</span>
                    <span className="col-span-2">Preço unit.</span>
                    <span className="col-span-2 text-right">Subtotal</span>
                  </div>

                  <div
                    className={
                      values.items.length > MAX_VISIBLE_ITEMS
                        ? 'flex max-h-[41rem] flex-col gap-3 overflow-y-auto pt-2 pr-1 sm:max-h-[16.5rem]'
                        : 'flex flex-col gap-3 pt-2'
                    }
                  >
                    {values.items.map((item, index) => {
                      const itemErrors = errors.items?.[item.id] ?? {}

                      return (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 items-start gap-3 rounded-xl border border-line p-3 sm:rounded-none sm:border-0 sm:p-0"
                        >
                          <TextField
                            label="Quant."
                            value={item.quantity}
                            onChange={(event) =>
                              setItemField(
                                item.id,
                                'quantity',
                                onlyDigits(event.target.value).slice(0, 4),
                              )
                            }
                            error={!!itemErrors.quantity}
                            size="small"
                            disabled={disabled}
                            slotProps={{
                              htmlInput: {
                                inputMode: 'numeric',
                                'aria-label': `Quantidade do item ${index + 1}`,
                              },
                            }}
                            className="col-span-3 sm:col-span-2"
                          />

                          <TextField
                            label="Produto / serviço"
                            value={item.description}
                            onChange={(event) =>
                              setItemField(item.id, 'description', event.target.value)
                            }
                            error={!!itemErrors.description}
                            helperText={itemErrors.description}
                            placeholder="Instalação de alarme"
                            size="small"
                            autoFocus={item.id === focusItemId}
                            disabled={disabled}
                            className="col-span-9 sm:col-span-5"
                          />

                          <TextField
                            label="Preço unit."
                            value={maskCurrency(item.unitPrice)}
                            onChange={(event) =>
                              setItemField(item.id, 'unitPrice', toCents(event.target.value))
                            }
                            error={!!itemErrors.unitPrice}
                            helperText={itemErrors.unitPrice}
                            placeholder="R$ 0,00"
                            size="small"
                            disabled={disabled}
                            slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                            className="col-span-5 sm:col-span-2"
                          />

                          <span
                            className="col-span-5 self-center text-right text-sm font-semibold text-deep-black tabular-nums sm:col-span-2"
                            aria-label={`Subtotal do item ${index + 1}`}
                          >
                            {maskCurrency(String(itemTotalCents(item))) || 'R$ 0,00'}
                          </span>

                          <Tooltip title="Excluir">
                            <span className="col-span-2 justify-self-end sm:col-span-1">
                              <IconButton
                                onClick={() => removeItem(item.id)}
                                disabled={disabled}
                                aria-label={`Excluir item ${index + 1}`}
                                size="small"
                                sx={{
                                  color: 'text.secondary',
                                  '&:hover': { color: 'error.main', bgcolor: 'error.light' },
                                }}
                              >
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </div>
                      )
                    })}
                  </div>

                  <Button
                    type="button"
                    variant="text"
                    onClick={addItem}
                    disabled={disabled}
                    startIcon={<AddRoundedIcon />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Adicionar item
                  </Button>

                  <div className="flex items-center justify-between gap-3 rounded-xl bg-canvas p-4">
                    <span className="text-sm font-semibold tracking-wide text-deep-black uppercase">
                      Total
                    </span>
                    <span className="text-2xl font-semibold text-deep-black tabular-nums">
                      {maskCurrency(String(total)) || 'R$ 0,00'}
                    </span>
                  </div>
                </div>
              ) : (
                <TextField
                  label="Descrição da manutenção"
                  value={values.maintenanceDescription}
                  onChange={(event) =>
                    setField(
                      'maintenanceDescription',
                      event.target.value.slice(0, MAINTENANCE_MAX_LENGTH),
                    )
                  }
                  error={!!errors.maintenanceDescription}
                  helperText={
                    errors.maintenanceDescription ??
                    `${values.maintenanceDescription.length}/${MAINTENANCE_MAX_LENGTH} caracteres`
                  }
                  placeholder="Troca de óleo e revisão geral..."
                  multiline
                  minRows={4}
                  slotProps={{ htmlInput: { maxLength: MAINTENANCE_MAX_LENGTH } }}
                  disabled={disabled}
                  className="sm:col-span-6"
                />
              )}
            </Section>

            <Section
              title="Observações gerais"
              description="Campo livre para qualquer anotação extra."
              icon={<NotesOutlinedIcon fontSize="small" />}
            >
              <TextField
                label="Observações gerais"
                value={values.observation}
                onChange={(event) =>
                  setField('observation', event.target.value.slice(0, OBSERVATION_MAX_LENGTH))
                }
                helperText={`${values.observation.length}/${OBSERVATION_MAX_LENGTH} caracteres`}
                placeholder="Veículo com avaria no para-choque dianteiro..."
                multiline
                minRows={3}
                slotProps={{ htmlInput: { maxLength: OBSERVATION_MAX_LENGTH } }}
                disabled={disabled}
                className="sm:col-span-6"
              />
            </Section>

            {errors.general && (
              <Alert severity="error" role="alert">
                {errors.general}
              </Alert>
            )}
          </div>

          <aside
            aria-label="Pré-visualização do PDF"
            className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-0 lg:w-[440px] lg:shrink-0 xl:w-[480px]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">Pré-visualização</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-content-muted">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-spider-red" />
                Atualiza enquanto você digita
              </span>
            </div>
            <ServiceOrderPreview values={values} />
          </aside>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-line bg-surface px-4 py-3.5 sm:flex-row sm:justify-end sm:px-6 lg:px-8">
        <Button variant="outlined" size="large" onClick={onClose} disabled={disabled}>
          Cancelar
        </Button>

        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={disabled}
          loadingPosition="start"
          startIcon={<FileDownloadOutlinedIcon />}
        >
          {disabled ? 'Gerando PDF...' : 'Gerar PDF'}
        </Button>
      </div>
    </form>
  )
}

export default ServiceOrderForm
