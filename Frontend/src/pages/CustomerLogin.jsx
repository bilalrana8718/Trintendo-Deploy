"use client"

import { useState, useContext } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { CustomerContext } from "../context/CustomerContext"
import Navbar from "../components/Navbar"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, ChevronRight, Mail, Lock } from "lucide-react"

const CustomerLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useContext(CustomerContext)
  const navigate = useNavigate()
  const location = useLocation()

  // Get redirect path from location state or default to home
  const from = location.state?.from || "/"

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { email, password } = formData
      const result = await login(email, password)

      if (result.success) {
        navigate(from)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-muted/30">
        <div className="w-full max-w-5xl grid md:grid-cols-2 shadow-xl rounded-xl overflow-hidden bg-background">
          {/* Left Column - Image/Branding */}
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70 z-10" />
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/placeholder.svg?height=800&width=600')" }}
            />
            <div className="relative z-20 flex flex-col justify-between h-full p-8 text-white">
              <div className="mb-auto">
                <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
                <p className="text-white/90">Sign in to continue your food journey</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-2 rounded-full">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Discover Local Restaurants</h3>
                    <p className="text-sm text-white/80">Find the best food in your area</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-2 rounded-full">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Fast Delivery</h3>
                    <p className="text-sm text-white/80">Hot food delivered to your door</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-2 rounded-full">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Exclusive Deals</h3>
                    <p className="text-sm text-white/80">Special offers just for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className="p-8 flex flex-col justify-center">
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">Customer Login</h1>
              <p className="text-muted-foreground">Enter your credentials to access your account</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="py-6"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Password
                  </label>
                  <Link to="/customer/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="py-6"
                  required
                />
              </div>

              <Button type="submit" className="w-full py-6 text-base" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/customer/register" className="text-primary font-medium hover:underline">
                    Create an account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default CustomerLogin

