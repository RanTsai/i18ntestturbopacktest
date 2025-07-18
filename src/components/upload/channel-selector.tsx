"use client";

import { Home, ChevronDown, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { IUserChannel } from "@/lib/schema/user-channel-schema";
import useTranslationStore from "@/lib/global-store/use-translation-store";
import { useParams } from "next/navigation";

interface Props {
  expanded: boolean;
  setExpanded: (val: boolean) => void;
  userChannels: IUserChannel[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;

  setMyChannel: (id: number | null) => void;
  setSelectedChannel: (channel: IUserChannel) => void;
  pageId: string;
}

export default function MyChannelSelector({
  expanded,
  setExpanded,
  userChannels,
  selectedId,
  setSelectedId,
  setMyChannel,
  setSelectedChannel,
  pageId,
}: Props) {
  const { getTranslation } = useTranslationStore();
  const { locale } = useParams() as { locale: string };
  const translations = getTranslation(pageId, locale) || {};

  const handleSelect = (channel: IUserChannel) => {
    const visualId = `my-${channel.user_channel_id}`;
    if (selectedId === visualId) {
      // Unselect
      setSelectedId(null);
      setMyChannel(null); // fallback to show all my channels
    } else {
      setSelectedId(visualId);
      setMyChannel(channel.user_channel_id);
      setSelectedChannel(channel);
    }
  };

  const handleHeaderClick = () => {
    // Header click = full group select (no specific channel selected)
    setSelectedId(null);
    setMyChannel(null);
  };

  return (
    <>
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
        onClick={() => {
          setExpanded(!expanded);
          handleHeaderClick();
        }}
      >
        <div className="flex items-center space-x-2 text-[var(--foreground)]">
          <Home className="h-4 w-4" />

          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span className="cursor-help">
                {translations?.channel_section?.translation ?? "My Channels"}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {translations?.channel_section?.tooltip ?? ""}
            </TooltipContent>
          </Tooltip>
        </div>

        {expanded ? (
          <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
        ) : (
          <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
        )}
      </div>

      {/* Expandable Grid */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="my-channel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden grid grid-cols-4 gap-2 ml-2 mt-1"
          >
            {userChannels.map((channel) => {
              const visualId = `my-${channel.user_channel_id}`;
              const isSelected = selectedId === visualId;

              return (
                <Tooltip key={channel.user_channel_id} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => handleSelect(channel)}
                      className={`
                        w-10 h-10 flex items-center justify-center
                        rounded-full border-2 cursor-pointer
                        transition
                        ${isSelected ? "border-purple-400" : "border-transparent"}
                        hover:border-[var(--ring)]
                      `}
                    >
                      <Image
                        src={channel.logo}
                        alt={channel.channel_name}
                        width={50}
                        height={50}
                        className="rounded-full"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {channel.channel_name} ({channel.platform})
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
