/**
 * Erro normalizado da camada de dados. Os serviços mockados (services/auth.ts,
 * services/orders.ts, services/products.ts) lançam este tipo, para a UI tratar
 * falhas do mesmo jeito que trataria uma API de verdade.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: unknown

  constructor(message: string, status: number, code: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  /** Erro de rede, DNS, CORS ou servidor fora do ar — nenhuma resposta chegou. */
  get isNetworkError() {
    return this.code === 'NETWORK' || this.code === 'TIMEOUT'
  }

  /** Requisição abortada de propósito; normalmente não deve virar mensagem na tela. */
  get isCanceled() {
    return this.code === 'CANCELED'
  }

  /** 401/403: sessão expirada ou sem permissão. */
  get isAuthError() {
    return this.status === 401 || this.status === 403
  }
}

/** Simula a latência de uma requisição de verdade, para loading/skeleton aparecerem. */
export function mockDelay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/* ------------------------------------------------------------------ */
/* Compatibilidade com o store/auth.ts                                 */
/* ------------------------------------------------------------------ */

/**
 * Este app mock não fala com um backend de verdade, então não existe um
 * cliente HTTP para carregar o Bearer token. As funções abaixo existem só
 * para o store/auth.ts continuar com a mesma interface.
 */
export function setAuthToken(_token: string | null) {}

type UnauthorizedHandler = (rejectedToken: string) => void

export function onUnauthorized(_handler: UnauthorizedHandler | null) {}
