"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const mockData = [
  {
    id: 1,
    date: "6/2/2025, 8:06:54 AM",
    description: "Free daily credits-Membership",
    amount: "+66.00",
    type: "obtained"
  },
  {
    id: 2,
    date: "5/17/2025, 3:36:35 PM",
    description: "Video Generation",
    amount: "-100.00",
    type: "consumed"
  },
  {
    id: 3,
    date: "5/17/2025, 3:33:46 PM",
    description: "Expand",
    amount: "-8.00",
    type: "consumed"
  },
  {
    id: 4,
    date: "5/17/2025, 3:32:51 PM",
    description: "Remove",
    amount: "-4.00",
    type: "consumed"
  },
  {
    id: 5,
    date: "5/15/2025, 5:11:51 PM",
    description: "Membership",
    amount: "+660.00",
    type: "purchase"
  },
  {
    id: 6,
    date: "5/15/2025, 2:00:25 AM",
    description: "Expired Credits",
    amount: "-66.00",
    type: "consumed"
  },
];

export default function CreditHistory() {
  const [tab, setTab] = useState("all");

  // 篩選資料
  const filteredData = tab === "all" ? mockData : mockData.filter((item) => item.type === tab);

  return (
    <div className="bg-background p-4 rounded-lg shadow max-w-4xl mx-auto space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-4 justify-between items-center border-b border-muted pb-4">
        <div className="text-sm">
          <p className="font-semibold">Remaining Credits</p>
          <p className="text-xl font-bold">3660</p>
        </div>
        <div className="text-sm flex gap-2">
          <div>
            <p className="font-semibold">Membership Credits</p>
            <p>3594</p>
          </div>
          <div>
            <p className="font-semibold">Top-up Credits</p>
            <p>0</p>
          </div>
          <div>
            <p className="font-semibold">Bonus Credits</p>
            <p>66</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" onValueChange={(v) => setTab(v)} className="w-full">
        <TabsList className="w-full justify-around">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="consumed">Consumed</TabsTrigger>
          <TabsTrigger value="purchase">Purchase</TabsTrigger>
          <TabsTrigger value="obtained">Obtained</TabsTrigger>
        </TabsList>

        {/* Records */}
        <TabsContent value={tab} className="mt-4 space-y-3">
          {filteredData.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">No records found.</p>
          ) : (
            filteredData.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b border-muted pb-2"
              >
                <div>
                  <p className="text-sm font-semibold">{item.description}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <p
                  className={`text-sm font-bold ${
                    item.amount.startsWith("+") ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {item.amount}
                </p>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-muted text-xs text-muted-foreground">
        <p>
          The costs of generation can vary due to factors like quantity, style and length.{" "}
          <span className="underline cursor-pointer">Credits Policy</span>
        </p>
        <Button size="sm" className="bg-green-500 text-white">Purchase Credits</Button>
      </div>
    </div>
  );
}
