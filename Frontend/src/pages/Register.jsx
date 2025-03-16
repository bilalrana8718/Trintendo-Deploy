"use client"

import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, Mail, Lock, User, Check } from "lucide-react"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const { name, email, password, confirmPassword } = formData

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const result = await register(name, email, password)

      if (result.success) {
        navigate("/dashboard")
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
                <h2 className="text-3xl font-bold mb-2">Join Our Community</h2>
                <p className="text-white/90">Create an account to start ordering delicious food</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Easy Ordering</h3>
                    <p className="text-sm text-white/80">Order with just a few clicks</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Save Favorites</h3>
                    <p className="text-sm text-white/80">Keep track of your favorite restaurants</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Order History</h3>
                    <p className="text-sm text-white/80">Easily reorder your favorite meals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Register Form */}
          <div className="p-8 flex flex-col justify-center">
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              <p className="text-muted-foreground">Fill in your details to join our food community</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="py-6"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
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
                <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="py-6"
                  required
                />
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="py-6"
                  required
                />
              </div>

              <Button type="submit" className="w-full py-6 text-base mt-4" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Sign in
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

export default Register

