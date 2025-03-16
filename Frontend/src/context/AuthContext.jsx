"use client"

import { createContext, useState, useEffect } from "react"
import { api } from "../services/api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token") || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get("/auth/me")
          setUser(response.data)
        } catch (error) {
          console.error("Failed to load user:", error)
          localStorage.removeItem("token")
          setToken(null)
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password })
      localStorage.setItem("token", response.data.token)
      setToken(response.data.token)
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await api.post("/auth/register", { name, email, password })
      localStorage.setItem("token", response.data.token)
      setToken(response.data.token)
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>{children}</AuthContext.Provider>
  )
}

