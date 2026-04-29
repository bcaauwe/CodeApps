import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { Home } from './pages/Home'
import { Office365 } from './pages/Office365'
import { Customers } from './pages/Customers'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/office365" element={<Office365 />} />
        <Route path="/customers" element={<Customers />} />
      </Routes>
    </Layout>
  )
}

export default App
