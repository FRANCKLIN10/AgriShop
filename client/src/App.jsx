import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import BuyerDashboard from './pages/public/About'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/login" element={<Order />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App