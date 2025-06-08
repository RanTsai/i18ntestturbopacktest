"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, LogOut } from "lucide-react";

export default function ProfileSettings() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6 bg-black rounded-lg shadow border border-gray-700 text-white">
      <h2 className="text-2xl font-bold mb-4">Account Settings</h2>

      {/* Avatar + Basic Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
            <Pencil className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Change Avatar</p>
        </div>
        <div className="flex-1 space-y-2">
          <p>ID: 4087831</p>
          <p className="flex items-center space-x-2">
            <span>Name: KLING7831</span>
            <Pencil className="h-4 w-4 text-gray-400 cursor-pointer" />
          </p>
          <div className="flex flex-col space-y-1">
            <span>Biography</span>
            <Textarea
              defaultValue="Create my bio: eg.'Found me! How about giving my work a like?'"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Email & Password */}
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
          <span>Email:</span>
          <Input
            type="email"
            value="mycophyte5164@gmail.com"
            readOnly
            className="flex-1 text-gray-400 bg-gray-800 border-none"
          />
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
          <span>Password:</span>
          <Button variant="link" className="text-green-500 p-0">
            Reset Password
          </Button>
        </div>
      </div>

      {/* Delete Account */}
      <div className="flex items-center justify-between border-t border-gray-700 pt-4">
        <span>Delete Account</span>
        <Button variant="link" className="text-red-500 flex items-center space-x-1 p-0">
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </Button>
      </div>

      {/* Laboratory */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-lg font-semibold mb-1">Laboratory</h3>
        <div className="flex items-center justify-between">
          <span>AI Retouching switch (video generates creative description)</span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">show</Button>
            <Button variant="outline" size="sm">hide</Button>
          </div>
        </div>
      </div>

      {/* Policies */}
      <div className="border-t border-gray-700 pt-4">
        <p className="text-xs text-gray-400">
          Login means default agreement{" "}
          <a href="#" className="underline">Terms of Service</a> and{" "}
          <a href="#" className="underline">Privacy Policy</a>
        </p>
      </div>

      {/* Sign Out */}
      <div className="flex justify-end">
        <Button variant="link" className="text-red-500 flex items-center space-x-1 p-0">
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
}
