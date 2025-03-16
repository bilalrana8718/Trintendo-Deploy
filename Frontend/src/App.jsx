import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import PrivateRoute from "./components/PrivateRoute"
import CustomerRoute from "./components/CustomerRoute"
import { AuthProvider } from "./context/AuthContext"
import { CustomerProvider } from "./context/CustomerContext"
import { CartProvider } from "./context/CartContext"
import { OrderProvider } from "./context/OrderContext"

// Pages
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import CreateRestaurant from "./pages/CreateRestaurant"
import RestaurantDetails from "./pages/RestaurantDetails"
import MenuManagement from "./pages/MenuManagement"
import Home from "./pages/Home"
import CustomerLogin from "./pages/CustomerLogin"
import CustomerRegister from "./pages/CustomerRegister"
import RestaurantMenu from "./pages/RestaurantMenu"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import OrderSuccess from "./pages/OrderSuccess"
import CustomerOrders from "./pages/CustomerOrders"
import OrderDetails from "./pages/OrderDetails"

function App() {
  return (
    <Router>
      <AuthProvider>
        <CustomerProvider>
          <CartProvider>
            <OrderProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />

                {/* Restaurant owner routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/restaurants/create"
                  element={
                    <PrivateRoute>
                      <CreateRestaurant />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/restaurants/:id"
                  element={
                    <PrivateRoute>
                      <RestaurantDetails />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/restaurants/:id/menu"
                  element={
                    <PrivateRoute>
                      <MenuManagement />
                    </PrivateRoute>
                  }
                />

                {/* Customer routes */}
                <Route path="/customer/login" element={<CustomerLogin />} />
                <Route path="/customer/register" element={<CustomerRegister />} />
                <Route path="/restaurants/:id/view" element={<RestaurantMenu />} />
                <Route
                  path="/cart"
                  element={
                    <CustomerRoute>
                      <Cart />
                    </CustomerRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <CustomerRoute>
                      <Checkout />
                    </CustomerRoute>
                  }
                />
                <Route
                  path="/order-success/:id"
                  element={
                    <CustomerRoute>
                      <OrderSuccess />
                    </CustomerRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <CustomerRoute>
                      <CustomerOrders />
                    </CustomerRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <CustomerRoute>
                      <OrderDetails />
                    </CustomerRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </OrderProvider>
          </CartProvider>
        </CustomerProvider>
      </AuthProvider>
    </Router>
  )
}

export default App

