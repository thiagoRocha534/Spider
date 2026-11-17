import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { applyProductsSearchAtom, clearProductsSearchAtom, productsSearchAtom } from '../../store'

/** Espera depois da última tecla antes de filtrar. */
const SEARCH_DEBOUNCE_MS = 300

/**
 * Busca da listagem de produtos: procura o texto na referência, no código, na
 * descrição e na marca ao mesmo tempo (tudo em memória, sem round-trip).
 */
function ProductsFilters() {
  const appliedSearch = useAtomValue(productsSearchAtom)
  const applySearch = useSetAtom(applyProductsSearchAtom)
  const clearSearch = useSetAtom(clearProductsSearchAtom)

  const [search, setSearch] = useState(appliedSearch)

  useEffect(() => {
    const timer = setTimeout(() => applySearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search, applySearch])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    applySearch(search)
  }

  function handleClear() {
    setSearch('')
    clearSearch()
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="w-full sm:max-w-105">
      <TextField
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar por referência, código, descrição ou marca"
        fullWidth
        slotProps={{
          htmlInput: {
            'aria-label': 'Buscar produtos',
            type: 'search',
            enterKeyHint: 'search',
          },
          input: {
            sx: {
              height: 44,
              '& input::-webkit-search-cancel-button': { display: 'none' },
            },
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton size="small" edge="end" onClick={handleClear} aria-label="Limpar busca">
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </form>
  )
}

export default ProductsFilters
