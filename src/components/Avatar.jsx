import { styleFor } from '../lib/colors'

const sizes = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
}

// Circular initial badge in the member's signature color.
export default function Avatar({ member, size = 'md', ring = false }) {
  if (!member) return null
  const s = styleFor(member.color)
  const initial = member.name?.[0]?.toUpperCase() || '?'
  return (
    <span
      title={member.name}
      className={`inline-flex items-center justify-center rounded-full font-bold text-white shadow-sm ${s.solid} ${sizes[size]} ${
        ring ? `ring-2 ring-offset-2 ${s.ring}` : ''
      }`}
    >
      {initial}
    </span>
  )
}
