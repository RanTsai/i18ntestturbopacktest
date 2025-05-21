"use client";
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ModeToggle() {
    const {theme, setTheme} = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    if (!mounted) return null    
    
    return (
        <Button variant="link" size = "icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark") }>
            {theme === "dark" ? <Sun className="h-20 w-20 text-[#ffffff]"/> : <Moon className="h-20 w-20 text-[#ffffff]"/>}
        </Button>
    )
}