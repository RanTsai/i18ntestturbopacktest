import { LucideIcon } from "lucide-react";
import Link from "next/link";

export interface IconWithTextProps {
    href: string;
    icon: LucideIcon;
    text: string;
}

const IconWithText = ({ href, icon: Icon, text }: IconWithTextProps) => (
    <Link href={href}>
        <div className="flex flex-col items-center cursor-pointer">
            <Icon className="h-8 w-8 text-primary" />
            <span className="text-xs text-gray-500 mt-1 cursor-pointer">{text}
            </span>
        </div>
    </Link>
);

export default IconWithText;