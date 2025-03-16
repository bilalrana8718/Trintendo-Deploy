import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import PrivateRoute from "./components/PrivateRoute"

// Pages
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import CreateRestaurant from "./pages/CreateRestaurant"
import RestaurantDetails from "./pages/RestaurantDetails"
import MenuManagement from "./pages/MenuManagement"
import Home from "./pages/Home"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

