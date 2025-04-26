"use client";

import { useContext, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { CustomerContext } from "../context/CustomerContext";
import Spinner from "./Spinner";

const CustomerRoute = ({ children }) => {
  const { customer, loading } = useContext(CustomerContext);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsLoaded(true);
    }
  }, [loading]);

  if (!isLoaded) {
    return <Spinner />;
  }

  if (!customer) {
    console.log("customer not found");
    return <Navigate to="/customer/login" replace />;
  }

  return children;
};

export default CustomerRoute;
