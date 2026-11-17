import { ApiError, mockDelay } from '../utils/api'

/** Corpo do login. Mesmos nomes da API original, para o resto do app não mudar. */
export type LoginCredentials = {
  email: string
  senha: string
}

/** Resposta do login. `tipo` é sempre "Bearer". */
export type LoginResponse = {
  token: string
  tipo: string
}

/** Usuário de demonstração deste mock. Mostrado também na tela de login. */
export const DEMO_CREDENTIALS = { email: 'admin@spider.com.br', senha: '123456' } as const

/** "texto" -> "dGV4dG8" (base64url, sem padding), para montar um JWT fake. */
function base64Url(value: string) {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Monta um token no formato de um JWT (header.payload.assinatura) só para o
 * resto do app (store/auth.ts) conseguir ler o e-mail e a expiração do mesmo
 * jeito que leria um token de verdade. A "assinatura" aqui é decorativa.
 */
function buildMockToken(email: string) {
  const header = base64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const payload = base64Url(
    JSON.stringify({ sub: email, exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 }),
  )
  return `${header}.${payload}.mock`
}

/**
 * Login mockado: sem backend, aceita só o usuário de demonstração.
 * Falhas chegam como ApiError, igual a uma API de verdade.
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  await mockDelay()

  const email = credentials.email.trim().toLowerCase()
  if (!email || !credentials.senha) {
    throw new ApiError('Preencha o e-mail e a senha.', 400, 'HTTP_400')
  }
  if (email !== DEMO_CREDENTIALS.email || credentials.senha !== DEMO_CREDENTIALS.senha) {
    throw new ApiError('E-mail ou senha incorretos.', 401, 'HTTP_401')
  }

  return { token: buildMockToken(email), tipo: 'Bearer' }
}
