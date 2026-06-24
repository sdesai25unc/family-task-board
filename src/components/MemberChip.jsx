import { styleFor } from '../lib/colors'

// A small pill showing a member's name in their soft signature color.
// When `selectable`, it renders as a toggle button (used in the create form).
export default function MemberChip({ member, selected, onClick, selectable = false }) {
  if (!member) return null
  const s = styleFor(member.color)

  if (selectable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
          selected
            ? `${s.solid} text-white shadow`
            : `${s.soft} ${s.softText} ring-1 ring-inset ${s.border} hover:brightness-95`
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${selected ? 'bg-white' : s.dot}`} />
        {member.name}
      </button>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.soft} ${s.softText}`}
    >
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {member.name}
    </span>
  )
}
