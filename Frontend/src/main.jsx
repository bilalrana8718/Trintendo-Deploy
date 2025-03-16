import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { AuthProvider } from "./context/AuthContext"
import { CustomerProvider } from "./context/CustomerContext"
import { CartProvider } from "./context/CartContext"
import { OrderProvider } from "./context/OrderContext"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CustomerProvider>
        <CartProvider>
          <OrderProvider>
            <App />
          </OrderProvider>
        </CartProvider>
      </CustomerProvider>
    </AuthProvider>
  </React.StrictMode>,
)

