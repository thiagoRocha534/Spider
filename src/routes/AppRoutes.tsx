import { useAtomValue } from 'jotai'
import { Navigate, Route, Routes } from 'react-router'
import App from '../App'
import Login from '../pages/Login/Login'
import Orders from '../pages/Orders/Orders'
import Products from '../pages/Products/Products'
import ServicesReport from '../pages/ServicesReport/ServicesReport'
import RequireAuth from './RequireAuth'
import { isAuthenticatedAtom } from '../store'

/**
 * Mapa de rotas da aplicação.
 *
 * `/login` é a única rota pública. Todo o resto fica abaixo do RequireAuth,
 * com o App como casca (Layout) das páginas: Atendimentos (índice), Produtos
 * e o relatório de Serviços por período.
 */
function AppRoutes() {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)

  return (
    <Routes>
      {/* Quem já está logado não tem por que ver a tela de login de novo. */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />

      <Route element={<RequireAuth />}>
        <Route element={<App />}>
          <Route index element={<Orders />} />
          <Route path="produtos" element={<Products />} />
          <Route path="servicos-por-periodo" element={<ServicesReport />} />
        </Route>
      </Route>

      {/* Qualquer URL desconhecida volta para a raiz, que por sua vez decide
          entre o app e o login conforme a sessão. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
