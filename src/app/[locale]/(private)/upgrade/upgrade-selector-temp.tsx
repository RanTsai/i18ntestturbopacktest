"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Button } from "@/components/ui/button";

const plansMock = [
  {
    id: "free",
    name: "Basic",
    yearly: 0,
    monthly: 0,
    credits: "Free",
    subtitle: "Free forever",
    description: "Get credits monthly by logging in",
    features: ["No watermark", "Free updates"],
  },
  {
    id: "standard",
    name: "Standard",
    yearly: 79.2,
    monthly: 9.9,
    credits: "660 credits / month",
    subtitle: "Next Year: $79.2 (34% Off)",
    description: "For fast-track generation",
    features: ["Professional mode", "Watermark removal", "Image upscaling"],
  },
  {
    id: "pro",
    name: "Pro",
    yearly: 293.04,
    monthly: 29.99,
    credits: "3000 credits / month",
    subtitle: "Next Year: $293.04 (34% Off)",
    description: "For power users",
    features: ["Priority access", "No watermark", "Master shot & video extension"],
  },
  {
    id: "premier",
    name: "Premier",
    yearly: 728.64,
    monthly: 59.99,
    credits: "8000 credits / month",
    subtitle: "Next Year: $728.64 (34% Off)",
    description: "Best for teams",
    features: ["Cinematic shots", "Full feature access", "Priority support"],
  },
];

export default function UpgradeSelectorTemp() {
  const [isYearly, setIsYearly] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Mocked onApprove and onError handlers
  const handleSuccess = (details: any) => {
    console.log("Payment successful:", details);
    alert("Payment successful! Plan activated.");
  };

  const handleError = (err: any) => {
    console.error("Payment error:", err);
    alert("Payment failed. Please try again.");
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* ✅ Top: User Info */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-xl font-semibold">Mr. Click</h2>
          <p className="text-sm text-gray-400">Standard (expire at: 8/9/2025)</p>
        </div>
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <Button size="sm">Manage</Button>
          <p className="text-xs text-gray-400">Credits: 3660</p>
          <Button variant="outline" size="sm">Code Redeem</Button>
        </div>
      </div>

      {/* ✅ Switch (Yearly / Monthly) */}
      <div className="flex justify-center space-x-2">
        <Button variant={isYearly ? "default" : "outline"} onClick={() => setIsYearly(true)}>
          Yearly -34%
        </Button>
        <Button variant={!isYearly ? "default" : "outline"} onClick={() => setIsYearly(false)}>
          Monthly -12%
        </Button>
      </div>

      {/* ✅ Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {plansMock.map((plan) => {
          const price = isYearly ? plan.yearly : plan.monthly;
          const isSelected = selectedPlanId === plan.id;

          return (
            <Card
              key={plan.id}
              className={`hover:border-purple-500 cursor-pointer ${isSelected ? "border-2 border-purple-500" : ""}`}
              onClick={() => setSelectedPlanId(plan.id)}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">${price} / {isYearly ? "Year" : "Month"}</p>
                <p className="text-xs text-muted-foreground">{plan.subtitle}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">{plan.credits}</p>
                <p className="text-sm">{plan.description}</p>
                <ul className="text-xs space-y-1">
                  {plan.features.map((f, idx) => (
                    <li key={idx}>✅ {f}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.id !== "free" ? (
                  <PayPalButtons
                    style={{ layout: "horizontal", label: "subscribe" }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                          {
                            amount: {
                              currency_code: "USD",
                              value: price.toString(),
                            },
                          },
                        ],
                      });
                    }}
                      onApprove={async (DataTransfer, actions: any) => {
                  const details = await actions.order.capture();
                  handleSuccess(details);
                }}
                    onError={handleError}
                  />
                ) : (
                  <Button size="sm" className="w-full bg-blue-400">Free Plan</Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* ✅ Premium Features */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Premium Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded p-4 text-center">
            <img src="/thumbnail1.png" alt="Accelerated access" />
            <div>Accelerated access</div>
            <span className="text-sm block opacity-50">Speed up feedback with faster AI</span>
          </div>
          <div className="bg-gray-800 rounded p-4 text-center">
            <img src="/thumbnail2.png" alt="Professional Mode" />
            <div>Professional Mode</div>
            <span className="text-sm block opacity-50">Speed up feedback with faster AI</span>
          </div>
          <div className="bg-gray-800 rounded p-4 text-center">
            <img src="/thumbnail3.png" alt="Video Extension" />
            <div>Video Extension</div>
            <span className="text-sm block opacity-50">Speed up feedback with faster AI</span>
          </div>
          <div className="bg-gray-800 rounded p-4 text-center">
            <img src="/thumbnail.png" alt="Master Shot" />
            <div>Master Shot</div>
            <span className="text-sm block opacity-50">Speed up feedback with faster AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
