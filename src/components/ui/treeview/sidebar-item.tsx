"use client"
interface Props {
  id: string
  label: string
  onClick: () => void
}

export default function SidebarItem({
  id,
  label,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className= "px-2 py-1 rounded text-sm cursor-pointer truncate"
    >
      {label}
    </div>
  )
}
