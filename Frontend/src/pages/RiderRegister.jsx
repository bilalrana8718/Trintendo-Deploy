"use client"

import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  Bike,
  Car,
  BikeIcon as Bicycle,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

const RiderRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    vehicleType: "",
    vehicleNumber: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Calculate password strength when password field changes
    if (name === "password") {
      calculatePasswordStrength(value)
    }
  }

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 6) strength += 25
    if (password.match(/[A-Z]/)) strength += 25
    if (password.match(/[0-9]/)) strength += 25
    if (password.match(/[^A-Za-z0-9]/)) strength += 25
    setPasswordStrength(strength)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500"
    if (passwordStrength <= 50) return "bg-orange-500"
    if (passwordStrength <= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return "Weak"
    if (passwordStrength <= 50) return "Fair"
    if (passwordStrength <= 75) return "Good"
    return "Strong"
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill in all personal information fields")
      return false
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address")
      return false
    }
    setError("")
    return true
  }

  const validateStep2 = () => {
    if (!formData.vehicleType || !formData.vehicleNumber) {
      setError("Please fill in all vehicle information fields")
      return false
    }
    setError("")
    return true
  }

  const validateStep3 = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in both password fields")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }
    setError("")
    return true
  }

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep3()) {
      return
    }

    setLoading(true)

    try {
      console.log("Submitting rider registration with data:", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
      })

      const result = await register(formData.name, formData.email, formData.password, "rider", {
        phone: formData.phone,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
      })

      if (result.success) {
        console.log("Rider registration successful")
        navigate("/rider/dashboard")
      } else {
        console.error("Registration failed:", result.message)
        setError(result.message || "Registration failed. Please try again.")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError(err.response?.data?.message || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getVehicleIcon = (type) => {
    switch (type) {
      case "bicycle":
        return <Bicycle className="h-5 w-5" />
      case "motorcycle":
        return <Bike className="h-5 w-5" />
      case "car":
        return <Car className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto bg-primary/10 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                <Bike className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Join as a Rider</CardTitle>
              <CardDescription>Create your rider account to start delivering</CardDescription>

              {/* Progress indicator */}
              <div className="w-full mt-4">
                <div className="flex justify-between mb-1 text-xs text-muted-foreground">
                  <span>Personal Info</span>
                  <span>Vehicle Details</span>
                  <span>Security</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6 animate-in fade-in slide-in-from-top-5 duration-300">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-5 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          className="pl-10"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          className="pl-10"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          className="pl-10"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Vehicle Type</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {["bicycle", "motorcycle", "car"].map((type) => (
                          <div
                            key={type}
                            onClick={() => setFormData({ ...formData, vehicleType: type })}
                            className={`
                              flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer
                              transition-all duration-200 hover:bg-primary/5
                              ${formData.vehicleType === type ? "border-primary bg-primary/10" : "border-gray-200"}
                            `}
                          >
                            <div
                              className={`
                              p-2 rounded-full mb-2
                              ${formData.vehicleType === type ? "bg-primary/20" : "bg-gray-100"}
                            `}
                            >
                              {type === "bicycle" && (
                                <Bicycle
                                  className={`h-5 w-5 ${formData.vehicleType === type ? "text-primary" : "text-gray-500"}`}
                                />
                              )}
                              {type === "motorcycle" && (
                                <Bike
                                  className={`h-5 w-5 ${formData.vehicleType === type ? "text-primary" : "text-gray-500"}`}
                                />
                              )}
                              {type === "car" && (
                                <Car
                                  className={`h-5 w-5 ${formData.vehicleType === type ? "text-primary" : "text-gray-500"}`}
                                />
                              )}
                            </div>
                            <span
                              className={`text-sm capitalize ${formData.vehicleType === type ? "font-medium text-primary" : ""}`}
                            >
                              {type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicleNumber" className="text-sm font-medium">
                        Vehicle Number/License Plate
                      </Label>
                      <Input
                        id="vehicleNumber"
                        name="vehicleNumber"
                        type="text"
                        required
                        className="uppercase"
                        placeholder="ABC123"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter the license plate or identification number of your vehicle
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-5 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Create Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          required
                          className="pl-10"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                        />
                      </div>

                      {formData.password && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span>Password strength:</span>
                            <span
                              className={
                                passwordStrength <= 25
                                  ? "text-red-500"
                                  : passwordStrength <= 50
                                    ? "text-orange-500"
                                    : passwordStrength <= 75
                                      ? "text-yellow-600"
                                      : "text-green-500"
                              }
                            >
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                          <Progress
                            value={passwordStrength}
                            className="h-1"
                            indicatorClassName={getPasswordStrengthColor()}
                          />

                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="flex items-center gap-1 text-xs">
                              <div
                                className={`w-3 h-3 rounded-full ${formData.password.length >= 6 ? "bg-green-500" : "bg-gray-300"}`}
                              ></div>
                              <span className={formData.password.length >= 6 ? "text-green-700" : "text-gray-500"}>
                                Min. 6 characters
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <div
                                className={`w-3 h-3 rounded-full ${formData.password.match(/[A-Z]/) ? "bg-green-500" : "bg-gray-300"}`}
                              ></div>
                              <span className={formData.password.match(/[A-Z]/) ? "text-green-700" : "text-gray-500"}>
                                Uppercase letter
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <div
                                className={`w-3 h-3 rounded-full ${formData.password.match(/[0-9]/) ? "bg-green-500" : "bg-gray-300"}`}
                              ></div>
                              <span className={formData.password.match(/[0-9]/) ? "text-green-700" : "text-gray-500"}>
                                Number
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <div
                                className={`w-3 h-3 rounded-full ${formData.password.match(/[^A-Za-z0-9]/) ? "bg-green-500" : "bg-gray-300"}`}
                              ></div>
                              <span
                                className={formData.password.match(/[^A-Za-z0-9]/) ? "text-green-700" : "text-gray-500"}
                              >
                                Special character
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          required
                          className="pl-10"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                      </div>
                      {formData.password && formData.confirmPassword && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs">
                          {formData.password === formData.confirmPassword ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              <span className="text-green-700">Passwords match</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                              <span className="text-red-700">Passwords don't match</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <div className="flex justify-between w-full">
                {currentStep > 1 ? (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                ) : (
                  <div></div> // Empty div for spacing
                )}

                {currentStep < 3 ? (
                  <Button type="button" onClick={nextStep} className="gap-1">
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} disabled={loading} className="gap-1">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                )}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/rider/login"
                  className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  )
}

export default RiderRegister
