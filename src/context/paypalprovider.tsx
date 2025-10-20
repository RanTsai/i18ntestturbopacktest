"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";


interface PaypalProviderProps {
  children: React.ReactNode;
  currency: string;
}

export default function PaypalProvider({ children, currency }: PaypalProviderProps) {
  const options = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: currency.toUpperCase(), // 保證是大寫，如 "USD"
    locale: "en_US",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={options}>
      {children}
    </PayPalScriptProvider>
  );
}
