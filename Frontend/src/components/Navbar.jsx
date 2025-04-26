"use client";

import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CustomerContext } from "../context/CustomerContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { ShoppingCart, User, ChevronDown } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { customer, logout: customerLogout } = useContext(CustomerContext);
  const navigate = useNavigate();
  const [userType, setUserType] = useState("customer");

  const handleLogout = () => {
    if (userType === "customer" && customer) {

      customerLogout();
      navigate("/customer/login");
    } else if (user) {
      logout();
      if (userType === "owner") {
        navigate("/login");
      } else {
        navigate("/rider/login");
      }
    }
  };

  const getLoginPath = () => {
    switch (userType) {
      case "customer":
        return "/customer/login";
      case "owner":
        return "/login";
      case "rider":
        return "/rider/login";
      default:
        return "/customer/login";
    }
  };

  const getRegisterPath = () => {
    switch (userType) {
      case "customer":
        return "/customer/register";
      case "owner":
        return "/register";
      case "rider":
        return "/rider/register";
      default:
        return "/customer/register";
    }
  };

  const getDashboardPath = () => {
    switch (userType) {
      case "customer":
        return "/customer/profile";
      case "owner":
        return "/dashboard";
      case "rider":
        return "/rider/dashboard";
      default:
        return "/";
    }

  };

  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center py-4 px-8 bg-white shadow-sm">
      <Link to="/" className="text-primary font-bold text-2xl no-underline">
        Trintendo
      </Link>

      <div className="flex items-center gap-6">
        {customer && userType === "customer" ? (

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
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
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
                {user.role === "owner" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/restaurant/orders" className="cursor-pointer">
                        Orders
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {user.role === "rider" && (
                  <DropdownMenuItem asChild>
                    <Link to="/rider/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <Button
                variant={userType === "customer" ? "default" : "outline"}
                onClick={() => setUserType("customer")}
                className="text-sm"
              >
                Customer
              </Button>
              <Button
                variant={userType === "owner" ? "default" : "outline"}
                onClick={() => setUserType("owner")}
                className="text-sm"
              >
                Restaurant Owner
              </Button>
              <Button
                variant={userType === "rider" ? "default" : "outline"}
                onClick={() => setUserType("rider")}
                className="text-sm"
              >
                Rider
              </Button>

            </div>

            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={getLoginPath()}>Login</Link>
              </Button>
              <Button asChild>
                <Link to={getRegisterPath()}>Register</Link>

              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
