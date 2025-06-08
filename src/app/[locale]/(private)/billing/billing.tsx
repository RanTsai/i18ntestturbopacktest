"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, CreditCard, FileText, ChevronDown } from "lucide-react";

export default function BillingComponent() {
  // Dummy data
  const paymentMethod = {
    cardType: "American Express",
    last4: "7567",
  };

  const invoices = [
    { id: 1, date: "May 27, 2025", amount: "$14.00", status: "Paid", plan: "OpenArt Starter" },
    { id: 2, date: "Apr 27, 2025", amount: "$14.00", status: "Paid", plan: "OpenArt Starter" },
    { id: 3, date: "Mar 27, 2025", amount: "$14.00", status: "Paid", plan: "OpenArt Starter" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-background text-foreground">
      {/* Current Subscription */}
      <section className="border-b border-gray-700 pb-4">
        <h2 className="text-lg font-semibold mb-2">Current Subscription</h2>
        <p className="text-xl font-bold">OpenArt Starter</p>
        <p className="text-sm text-muted-foreground">$14.00 per month</p>
        <p className="text-xs text-muted-foreground">Your subscription renews on June 27, 2025.</p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span className="text-sm">
              {paymentMethod.cardType} •••• {paymentMethod.last4}
            </span>
          </div>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Payment Method */}
      <section className="border-b border-gray-700 pb-4">
        <h2 className="text-lg font-semibold mb-2">Payment Method</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span className="text-sm">
              {paymentMethod.cardType} •••• {paymentMethod.last4}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-xs">link</Button>
            <Button variant="ghost" size="icon">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button variant="outline" size="sm" className="mt-2">+ Add payment method</Button>
      </section>

      {/* Billing Information */}
      <section className="border-b border-gray-700 pb-4">
        <h2 className="text-lg font-semibold mb-2">Billing Information</h2>
        <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Pencil className="h-4 w-4" />
          <span>Update information</span>
        </Button>
      </section>

      {/* Invoice History */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Invoice History</h2>
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex justify-between items-center p-2 rounded hover:bg-muted/30">
              <div className="flex flex-col">
                <span className="text-sm">{invoice.date}</span>
                <span className="text-xs text-muted-foreground">{invoice.plan}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold">{invoice.amount}</span>
                <span className="bg-green-600 text-white text-xs rounded px-2 py-0.5">{invoice.status}</span>
              </div>
            </div>
          ))}
        </div>
        <Button variant="link" size="sm" className="mt-2 text-xs text-muted-foreground">View more</Button>
      </section>
    </div>
  );
}
