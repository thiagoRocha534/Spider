import { Outlet } from 'react-router'
import Layout from './components/Layout/Layout'

/** Casca das telas autenticadas; qual página aparece vem do AppRoutes. */
function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default App
