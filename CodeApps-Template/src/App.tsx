import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { Home } from './pages/Home'
import { Office365 } from './pages/Office365'
import { Customers } from './pages/Customers'
import { TMDB } from './pages/TMDB'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/office365" element={<Office365 />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/tmdb" element={<TMDB />} />
      </Routes>
    </Layout>
  )
}

export default App
