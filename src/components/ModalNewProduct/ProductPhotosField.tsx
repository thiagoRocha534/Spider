import { useEffect, useId, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import IconButton from '@mui/material/IconButton'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import type { ProductPhoto } from '../../services/products'

type ProductPhotosFieldProps = {
  /** Fotos já salvas (só na edição). */
  existing: ProductPhoto[]
  /** Arquivos escolhidos agora, ainda não enviados. */
  files: File[]
  onFilesChange: (files: File[]) => void
  onRemoveExisting: (photoId: number) => void
  disabled?: boolean
}

/** Mesmo arquivo escolhido duas vezes não entra repetido. */
const fileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`

/** Preview local de um File, enquanto ele não é enviado. */
function NewPhotoThumb({ file, onRemove, disabled }: { file: File; onRemove: () => void; disabled?: boolean }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  return (
    <li className="group relative size-20 shrink-0 overflow-hidden rounded-lg border border-line">
      {url && <img src={url} alt={file.name} className="size-full object-cover" />}
      <IconButton
        size="small"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Remover ${file.name}`}
        sx={{
          position: 'absolute',
          top: 2,
          right: 2,
          bgcolor: 'rgba(15, 23, 42, 0.55)',
          color: '#fff',
          '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.75)' },
        }}
      >
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
    </li>
  )
}

/**
 * Campo de fotos do produto: várias imagens do computador ou, no celular, da
 * galeria/câmera. Mostra miniaturas das fotos já salvas e das novas.
 */
function ProductPhotosField({
  existing,
  files,
  onFilesChange,
  onRemoveExisting,
  disabled,
}: ProductPhotosFieldProps) {
  const inputId = useId()
  const [dragging, setDragging] = useState(false)

  function addFiles(selected: File[]) {
    const images = selected.filter((file) => file.type.startsWith('image/'))
    const known = new Set(files.map(fileKey))
    const added = images.filter((file) => !known.has(fileKey(file)))
    if (added.length > 0) onFilesChange([...files, ...added])
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    if (!disabled) addFiles(Array.from(event.dataTransfer.files))
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  const hasItems = existing.length > 0 || files.length > 0

  return (
    <div className="flex flex-col gap-2 sm:col-span-6">
      <span className="text-sm font-medium text-content-muted">Fotos do produto</span>

      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          'flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors',
          dragging
            ? 'border-spider-red bg-light-red'
            : 'border-line-strong hover:border-spider-red',
          disabled ? 'pointer-events-none opacity-60' : '',
        ].join(' ')}
      >
        <CloudUploadOutlinedIcon className="text-spider-red" />
        <span className="text-sm font-medium">Adicionar fotos</span>
        <span className="text-xs text-content-subtle">Clique ou arraste imagens aqui.</span>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInput}
          disabled={disabled}
          className="sr-only"
        />
      </label>

      {hasItems && (
        <ul className="flex flex-wrap gap-3 pt-1">
          {existing.map((photo) => (
            <li
              key={`photo-${photo.id}`}
              className="group relative size-20 shrink-0 overflow-hidden rounded-lg border border-line"
            >
              <img src={photo.dataUrl} alt={photo.nome} className="size-full object-cover" />
              <IconButton
                size="small"
                onClick={() => onRemoveExisting(photo.id)}
                disabled={disabled}
                aria-label={`Remover ${photo.nome}`}
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  bgcolor: 'rgba(15, 23, 42, 0.55)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.75)' },
                }}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </li>
          ))}

          {files.map((file, index) => (
            <NewPhotoThumb
              key={fileKey(file)}
              file={file}
              onRemove={() => removeFile(index)}
              disabled={disabled}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default ProductPhotosField
