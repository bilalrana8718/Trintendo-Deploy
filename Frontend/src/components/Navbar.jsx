"use client"

import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="flex justify-between items-center py-4 px-8 bg-white shadow-sm">
      <Link to="/" className="text-primary font-bold text-2xl no-underline">
        FoodDelivery
      </Link>

      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span>Welcome, {user.name}</span>
            <Link to="/dashboard" className="no-underline text-text-primary">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="bg-transparent border-none text-primary cursor-pointer font-bold">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="no-underline text-text-primary">
              Login
            </Link>
            <Link to="/register" className="no-underline text-text-primary">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

