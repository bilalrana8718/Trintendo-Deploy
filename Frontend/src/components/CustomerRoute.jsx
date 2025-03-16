"use client"

import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { CustomerContext } from "../context/CustomerContext"
import Spinner from "./Spinner"

const CustomerRoute = ({ children }) => {
  const { customer, loading } = useContext(CustomerContext)

  if (loading) {
    return <Spinner />
  }

  if (!customer) {
    return <Navigate to="/customer/login" replace />
  }

  return children
}

export default CustomerRoute

