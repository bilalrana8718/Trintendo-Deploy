"use client"

import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { CustomerContext } from "../context/CustomerContext"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { ShoppingCart, User, ChevronDown } from "lucide-react"

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const { customer, logout: customerLogout } = useContext(CustomerContext)
  const navigate = useNavigate()
  const [isCustomer, setIsCustomer] = useState(true)

  const handleLogout = () => {
    if (isCustomer && customer) {
      customerLogout()
      navigate("/customer/login")
    } else if (user) {
      logout()
      navigate("/login")
    }
  }

  const toggleUserType = () => {
    setIsCustomer(!isCustomer)
  }

  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center py-4 px-8 bg-white shadow-sm">
      <Link to="/" className="text-primary font-bold text-2xl no-underline">
        Trintendo
      </Link>

      <div className="flex items-center gap-6">
        {customer && isCustomer ? (
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Hi, {customer.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/customer/profile" className="cursor-pointer">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/customer/orders" className="cursor-pointer">
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/cart">
              <Button variant="outline" size="icon">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : user ? (
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Hi, {user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="cursor-pointer">
                    Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Label htmlFor="user-type" className={isCustomer ? "text-primary font-medium" : "text-muted-foreground"}>
                Customer
              </Label>
              <Switch id="user-type" checked={!isCustomer} onCheckedChange={toggleUserType} />
              <Label htmlFor="user-type" className={!isCustomer ? "text-primary font-medium" : "text-muted-foreground"}>
                Restaurant Owner
              </Label>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={isCustomer ? "/customer/login" : "/login"}>Login</Link>
              </Button>
              <Button asChild>
                <Link to={isCustomer ? "/customer/register" : "/register"}>Register</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

