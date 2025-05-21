//aspectSelector.tsx
import React from 'react'
import { AspectKey } from './types'

type Props = {
  value: AspectKey
  onChange: (key: AspectKey) => void
}

const options: AspectKey[] = ['Clickability', 'Clarity', 'Relevance', 'CTR', 'Branding']

const AspectSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AspectKey)}
      className="bg-background border border-gray-300 rounded p-1 text-sm"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  )
}

export default AspectSelector
