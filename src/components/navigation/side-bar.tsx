"use client";
import React, { useState } from "react";
import {
    Home,
    Settings,
    Image,
    BarChart,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Sidebar() {
    const [isMyStuffExpanded, setIsMystuffExpanded] = useState(false);
    const [isCreditExpanded, setIsCreditExpanded] = useState(false);

    return (
        <div className="w-64 bg-gray-900 text-white flex flex-col p-4 space-y-4">
            {/* Topbar/Logo */}
            <div className="text-2xl font-bold mb-4">My Dashboard</div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col space-y-2">
                <Button variant="ghost" className="justify-start">
                    <Home className="mr-2 h-5 w-5" /> Home
                </Button>
                <Link href="/youtubeview" className="w-full">

                <Button variant="ghost" className="justify-start">
                    <Image className="mr-2 h-5 w-5" /> Thumbnails
                </Button>
                </Link>
                <Link href="/deviceview" className="w-full">

                    <Button variant="ghost" className="justify-start">
                        <BarChart className="mr-2 h-5 w-5" /> Analytics
                    </Button>
                </Link>
                {/* Divider */}
                <div className="border-t border-gray-700 my-2" />

                {/* My Stuff Expandable Section */}
                <div
                    className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-800"
                    onClick={() => setIsMystuffExpanded(!isMyStuffExpanded)}
                >
                    <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4" />
                        <span>My Stuff</span>
                    </div>
                    {isMyStuffExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </div>

                {/* Expandable Items */}
                <div
                    className={`${isMyStuffExpanded ? "flex" : "hidden"
                        } flex-col ml-4 space-y-1`}
                >
                    <Button variant="ghost" className="justify-start flex items-center space-x-2">
                        <Image className="h-4 w-4" />
                        <span>Bookmarks</span>
                    </Button>
                    <Button variant="ghost" className="justify-start flex items-center space-x-2">
                        <Image className="h-4 w-4" />
                        <span>Liked</span>
                    </Button>
                    <Button variant="ghost" className="justify-start flex items-center space-x-2">
                        <Image className="h-4 w-4" />
                        <span>Saved Albums</span>
                    </Button>
                </div>

                {/* Another Divider */}
                <div className="border-t border-gray-700 my-2" />

                {/* Credit Expandable Section */}
                <div
                    className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-800"
                    onClick={() => setIsCreditExpanded(!isCreditExpanded)}
                >
                    <div className="flex items-center space-x-2">
                        <BarChart className="h-4 w-4" />
                        <span>Credit</span>
                    </div>
                    {isCreditExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </div>

                {/* Expandable Items */}
                <div
                    className={`${isCreditExpanded ? "flex" : "hidden"
                        } flex-col ml-4 space-y-1`}
                >
                    <Link href="/billing" className="w-full">
                        <Button variant="ghost" className="justify-start flex items-center space-x-2 cursor-pointer">
                            <Image className="h-4 w-4" />
                            <span>Billing</span>
                        </Button>
                    </Link>
                    <Button variant="ghost" className="justify-start flex items-center space-x-2">
                        <Image className="h-4 w-4" />
                        <span>Usages</span>
                    </Button>
                    <Link href="/credithistory" className="w-full">
                        <Button variant="ghost" className="justify-start flex items-center space-x-2">
                            <Image className="h-4 w-4" />
                            <span>Statement</span>
                        </Button>
                    </Link>
                </div>



                {/* Divider */}
                <div className="border-t border-gray-700 my-2" />


                {/* Other Navigation */}
                <Link href="/settings" className="w-full">
                    <Button variant="ghost" className="justify-start w-full cursor-pointer">
                        <Settings className="mr-2 h-5 w-5" /> Settings
                    </Button>
                </Link>
            </nav>

            {/* Footer */}
            <div className="text-xs text-gray-400">© 2025 My Dashboard</div>
        </div>
    );
}
