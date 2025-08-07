'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React from 'react'

interface Props {
  id: string
  children: (props: {
    setNodeRef: (el: HTMLElement | null) => void
    style: React.CSSProperties
    listeners?: React.HTMLAttributes<HTMLElement> // ✅ 改為可選
    attributes?: React.HTMLAttributes<HTMLElement> // ✅ 改為可選
  }) => React.ReactNode
}

export default function SortableItem({ id, children }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return <>{children({ setNodeRef, style, listeners, attributes })}</>
}
