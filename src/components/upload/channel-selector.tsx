"use client";

import { Home, ChevronDown, ChevronRight, TvMinimalPlay } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useUserChannelViewModel } from "@/lib/view-models/use-user-channel-view-model";
import { PageTranslations } from "@/i18n/interface";

interface Props {
  expanded: boolean;
  setExpanded: (val: boolean) => void;
  translations?: PageTranslations;
}

export default function MyChannelSelector({
  expanded,
  setExpanded,
  translations,
}: Props) {
  const {
    userChannels,
    selectedChannel,
    setSelectedChannel,
  } = useUserChannelViewModel();

  const visualId = selectedChannel
    ? `my-${selectedChannel.channel_name}`
    : null;

  const handleSelect = (channelName: string) => {
    console.log("Selecting channel:", channelName);
    const matchedChannel = userChannels?.find(
      (c) => c.channel_name === channelName
    );
    if (matchedChannel) {
      setSelectedChannel(matchedChannel); 
      console.log("Mateched", matchedChannel);
    }
  };


  return (
    <>
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[var(--muted)]"
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        <div className="flex items-center space-x-2 text-[var(--foreground)]">
          <TvMinimalPlay className="h-4 w-4" />

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
            {userChannels?.map((channel) => {
              const id = `my-${channel.channel_name}`;
              const isSelected = visualId === id;

              return (
                <Tooltip key={channel.channel_name} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => handleSelect(channel.channel_name)}
                      className={`
                        w-10 h-10 flex items-center justify-center
                        rounded-full border-2 cursor-pointer
                        transition
                        ${isSelected ? "border-green-500" : "border-transparent"}
                        hover:border-purple-400 hover:bg-purple-100
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
