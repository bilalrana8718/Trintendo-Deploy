// "use client";

// import { useContext, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import { CustomerContext } from "../context/CustomerContext";
// import { Button } from "./ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "./ui/dropdown-menu";
// import { Switch } from "./ui/switch";
// import { Label } from "./ui/label";
// import { ShoppingCart, User, ChevronDown } from "lucide-react";

// const Navbar = () => {
//   const { user, logout } = useContext(AuthContext);
//   const { customer, logout: customerLogout } = useContext(CustomerContext);
//   const navigate = useNavigate();
//   const [userType, setUserType] = useState("customer");

//   const handleLogout = () => {
//     if (userType === "customer" && customer) {

//       customerLogout();
//       navigate("/customer/login");
//     } else if (user) {
//       logout();
//       if (userType === "owner") {
//         navigate("/login");
//       } else {
//         navigate("/rider/login");
//       }
//     }
//   };

//   const getLoginPath = () => {
//     switch (userType) {
//       case "customer":
//         return "/customer/login";
//       case "owner":
//         return "/login";
//       case "rider":
//         return "/rider/login";
//       default:
//         return "/customer/login";
//     }
//   };

//   const getRegisterPath = () => {
//     switch (userType) {
//       case "customer":
//         return "/customer/register";
//       case "owner":
//         return "/register";
//       case "rider":
//         return "/rider/register";
//       default:
//         return "/customer/register";
//     }
//   };

//   const getDashboardPath = () => {
//     switch (userType) {
//       case "customer":
//         return "/customer/profile";
//       case "owner":
//         return "/dashboard";
//       case "rider":
//         return "/rider/dashboard";
//       default:
//         return "/";
//     }

//   };

//   return (
//     <nav className="sticky top-0 z-50 flex justify-between items-center py-4 px-8 bg-white shadow-sm">
//       <Link to="/" className="text-primary font-bold text-2xl no-underline">
//         Trintendo
//       </Link>

//       <div className="flex items-center gap-6">
//         {customer && userType === "customer" ? (

//           <div className="flex items-center gap-4">
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" className="flex items-center gap-2">
//                   <User className="h-4 w-4" />
//                   <span>Hi, {customer.name}</span>
//                   <ChevronDown className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem asChild>
//                   <Link to="/customer/profile" className="cursor-pointer">
//                     Profile
//                   </Link>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem asChild>
//                   <Link to="/customer/orders" className="cursor-pointer">
//                     My Orders
//                   </Link>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem
//                   onClick={handleLogout}
//                   className="cursor-pointer"
//                 >
//                   Logout
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>

//             <Link to="/cart">
//               <Button variant="outline" size="icon">
//                 <ShoppingCart className="h-4 w-4" />
//               </Button>
//             </Link>
//           </div>
//         ) : user ? (
//           <div className="flex items-center gap-4">
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" className="flex items-center gap-2">
//                   <User className="h-4 w-4" />
//                   <span>Hi, {user.name}</span>
//                   <ChevronDown className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 {user.role === "owner" && (
//                   <>
//                     <DropdownMenuItem asChild>
//                       <Link to="/dashboard" className="cursor-pointer">
//                         Dashboard
//                       </Link>
//                     </DropdownMenuItem>
//                     <DropdownMenuItem asChild>
//                       <Link to="/restaurant/orders" className="cursor-pointer">
//                         Orders
//                       </Link>
//                     </DropdownMenuItem>
//                   </>
//                 )}
//                 {user.role === "rider" && (
//                   <DropdownMenuItem asChild>
//                     <Link to="/rider/dashboard" className="cursor-pointer">
//                       Dashboard
//                     </Link>
//                   </DropdownMenuItem>
//                 )}

//                 <DropdownMenuItem asChild>
//                   <Link to="/profile" className="cursor-pointer">
//                     Profile
//                   </Link>
//                 </DropdownMenuItem>

//                 <DropdownMenuItem
//                   onClick={handleLogout}
//                   className="cursor-pointer"
//                 >
//                   Logout
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         ) : (
//           <div className="flex items-center gap-6">
//             <div className="flex items-center gap-4">
//               <Button
//                 variant={userType === "customer" ? "default" : "outline"}
//                 onClick={() => setUserType("customer")}
//                 className="text-sm"
//               >
//                 Customer
//               </Button>
//               <Button
//                 variant={userType === "owner" ? "default" : "outline"}
//                 onClick={() => setUserType("owner")}
//                 className="text-sm"
//               >
//                 Restaurant Owner
//               </Button>
//               <Button
//                 variant={userType === "rider" ? "default" : "outline"}
//                 onClick={() => setUserType("rider")}
//                 className="text-sm"
//               >
//                 Rider
//               </Button>

//             </div>

//             <div className="flex gap-2">
//               <Button variant="outline" asChild>
//                 <Link to={getLoginPath()}>Login</Link>
//               </Button>
//               <Button asChild>
//                 <Link to={getRegisterPath()}>Register</Link>

//               </Button>
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

"use client"

import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { CustomerContext } from "../context/CustomerContext"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, User, LogOut, Package, Home, Bike, Store, UserCircle } from "lucide-react"

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const { customer, logout: customerLogout } = useContext(CustomerContext)
  const navigate = useNavigate()
  const [userType, setUserType] = useState("customer")

  const handleLogout = () => {
    if (userType === "customer" && customer) {
      customerLogout()
      navigate("/customer/login")
    } else if (user) {
      logout()
      if (userType === "owner") {
        navigate("/login")
      } else {
        navigate("/rider/login")
      }
    }
  }

  const getLoginPath = () => {
    switch (userType) {
      case "customer":
        return "/customer/login"
      case "owner":
        return "/login"
      case "rider":
        return "/rider/login"
      default:
        return "/customer/login"
    }
  }

  const getRegisterPath = () => {
    switch (userType) {
      case "customer":
        return "/customer/register"
      case "owner":
        return "/register"
      case "rider":
        return "/rider/register"
      default:
        return "/customer/register"
    }
  }

  const getDashboardPath = () => {
    switch (userType) {
      case "customer":
        return "/customer/profile"
      case "owner":
        return "/dashboard"
      case "rider":
        return "/rider/dashboard"
      default:
        return "/"
    }
  }

  const getUserIcon = () => {
    switch (userType) {
      case "customer":
        return <User className="h-4 w-4" />
      case "owner":
        return <Store className="h-4 w-4" />
      case "rider":
        return <Bike className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center py-3 px-4 md:px-8 bg-white border-b">
      <div className="flex items-center gap-2">
        <Link to="/" className="text-primary font-bold text-2xl no-underline flex items-center">
          Trintendo
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {customer && userType === "customer" ? (
          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">0</Badge>
                <span className="sr-only">Shopping cart</span>
              </Button>
            </Link>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center gap-2 h-9 px-3">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={`https://avatar.vercel.sh/${customer.name}`} alt={customer.name} />
                      <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium hidden md:inline-block">{customer.name}</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[220px] p-2">
                      <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Customer Account</div>
                      <Link to="/customer/profile" className="block w-full p-2 text-sm rounded-md hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-4 w-4" />
                          <span>Profile</span>
                        </div>
                      </Link>
                      <Link to="/customer/orders" className="block w-full p-2 text-sm rounded-md hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span>My Orders</span>
                        </div>
                      </Link>
                      <div className="mt-2 pt-2 border-t">
                        <button
                          onClick={handleLogout}
                          className="w-full p-2 text-sm text-left rounded-md hover:bg-muted flex items-center gap-2 text-red-500"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        ) : user ? (
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center gap-2 h-9 px-3">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={`https://avatar.vercel.sh/${user.name}`} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium hidden md:inline-block">{user.name}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[220px] p-2">
                    <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                      {user.role === "owner" ? "Restaurant Owner" : "Rider"} Account
                    </div>

                    {user.role === "owner" && (
                      <>
                        <Link to="/dashboard" className="block w-full p-2 text-sm rounded-md hover:bg-muted">
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            <span>Dashboard</span>
                          </div>
                        </Link>
                        <Link to="/restaurant/orders" className="block w-full p-2 text-sm rounded-md hover:bg-muted">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span>Orders</span>
                          </div>
                        </Link>
                      </>
                    )}

                    {user.role === "rider" && (
                      <Link to="/rider/dashboard" className="block w-full p-2 text-sm rounded-md hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          <span>Dashboard</span>
                        </div>
                      </Link>
                    )}

                    <Link to="/profile" className="block w-full p-2 text-sm rounded-md hover:bg-muted">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4" />
                        <span>Profile</span>
                      </div>
                    </Link>

                    <div className="mt-2 pt-2 border-t">
                      <button
                        onClick={handleLogout}
                        className="w-full p-2 text-sm text-left rounded-md hover:bg-muted flex items-center gap-2 text-red-500"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        ) : (
          <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
            <Tabs value={userType} onValueChange={setUserType} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-3 w-full md:w-auto">
                <TabsTrigger value="customer" className="text-xs md:text-sm px-2 md:px-3">
                  <User className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Customer</span>
                </TabsTrigger>
                <TabsTrigger value="owner" className="text-xs md:text-sm px-2 md:px-3">
                  <Store className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Restaurant</span>
                </TabsTrigger>
                <TabsTrigger value="rider" className="text-xs md:text-sm px-2 md:px-3">
                  <Bike className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Rider</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={getLoginPath()}>Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to={getRegisterPath()}>Register</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

