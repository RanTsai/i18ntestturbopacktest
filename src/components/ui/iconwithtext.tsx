import { LucideIcon } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export interface IconWithTextProps {
  href: string;
  icon: LucideIcon;
  text: string;
}

const IconWithText = ({ href, icon: Icon, text }: IconWithTextProps) => (
  <Link href={href}>
    <div
      className={clsx(
        "group flex flex-col items-center justify-center cursor-pointer select-none",
        "transition-transform duration-200 hover:scale-[1.08]"
      )}
    >
      {/* icon：hover 變亮黃色 */}
      <Icon
        className={clsx(
          "h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground transition-colors duration-200",
          "group-hover:text-yellow-500"
        )}
      />
      {/* text：手機隱藏，hover 同樣變黃色 */}
      <span
        className={clsx(
          "text-xs mt-1 text-gray-500 transition-colors duration-200 hidden sm:inline",
          "group-hover:text-yellow-500"
        )}
      >
        {text}
      </span>
    </div>
  </Link>
);

export default IconWithText;
