import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminAuthProvider, RequireAdmin } from './admin/AdminAuth'
import { AdminLayout } from './admin/AdminLayout'
import { AdminAttributesPage } from './admin/pages/AdminAttributesPage'
import { AdminCategoriesPage } from './admin/pages/AdminCategoriesPage'
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage'
import { AdminLoginPage } from './admin/pages/AdminLoginPage'
import { AdminOrderDetailPage } from './admin/pages/AdminOrderDetailPage'
import { AdminOrdersPage } from './admin/pages/AdminOrdersPage'
import { AdminProductFormPage } from './admin/pages/AdminProductFormPage'
import { AdminProductsPage } from './admin/pages/AdminProductsPage'
import { AdminSettingsPage } from './admin/pages/AdminSettingsPage'
import { Layout } from './components/layout/Layout'
import { CartPage } from './pages/CartPage'
import { CatalogPage } from './pages/CatalogPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderSentPage } from './pages/OrderSentPage'
import { ProductPage } from './pages/ProductPage'

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/menu" element={<Navigate to="/" replace />} />
            <Route path="/producto/:slug" element={<ProductPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/pedido-enviado" element={<OrderSentPage />} />

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/:id/edit" element={<AdminProductFormPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="attributes" element={<AdminAttributesPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
