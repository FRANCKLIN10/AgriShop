import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { NotificationProvider } from './context/NotificationContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/public/Home'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import Products from './pages/public/Products'
import ProductDetails from './pages/public/ProductDetails'

import BuyerDashboard from './pages/buyer/BuyerDashboard'
import Cart from './pages/buyer/Cart'
import Checkout from './pages/buyer/Checkout'
import MyOrders from './pages/buyer/MyOrders'
import OrderDetails from './pages/buyer/OrderDetails'

import AdminDashboard from './pages/admin/AdminDashboard'
import FarmerDashboard from './pages/farmer/FarmerDashboard'
import DeliveryDashboard from './pages/delivery/DeliveryDashboard'

function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 text-slate-800">
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          {/* Customer / buyer flows */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/buyer/dashboard" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
          <Route path="/buyer/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/buyer/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />

          {/* Role-specific dashboards */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['FARMER']} requireApprovedFarmer>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/delivery/dashboard"
            element={
              <ProtectedRoute allowedRoles={['DELIVERY_SERVICE']}>
                <DeliveryDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App