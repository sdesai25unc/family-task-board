// Signature color per family member. The DB stores one of these four color keys
// on each member; this maps the key to concrete Tailwind classes + a hex value.
//
// NOTE: every class string here is written out in full (no string interpolation)
// so Tailwind's compiler can see and include them. Don't build these dynamically.

export const colorStyles = {
  blue: {
    label: 'blue',
    solid: 'bg-blue-500',
    solidHover: 'hover:bg-blue-600',
    text: 'text-blue-700',
    soft: 'bg-blue-50',
    softText: 'text-blue-700',
    border: 'border-blue-300',
    ring: 'ring-blue-400',
    dot: 'bg-blue-500',
    hex: '#2563eb',
  },
  coral: {
    label: 'coral',
    solid: 'bg-rose-400',
    solidHover: 'hover:bg-rose-500',
    text: 'text-rose-600',
    soft: 'bg-rose-50',
    softText: 'text-rose-600',
    border: 'border-rose-300',
    ring: 'ring-rose-300',
    dot: 'bg-rose-400',
    hex: '#fb7185',
  },
  green: {
    label: 'green',
    solid: 'bg-green-600',
    solidHover: 'hover:bg-green-700',
    text: 'text-green-700',
    soft: 'bg-green-50',
    softText: 'text-green-700',
    border: 'border-green-300',
    ring: 'ring-green-400',
    dot: 'bg-green-600',
    hex: '#16a34a',
  },
  purple: {
    label: 'purple',
    solid: 'bg-violet-600',
    solidHover: 'hover:bg-violet-700',
    text: 'text-violet-700',
    soft: 'bg-violet-50',
    softText: 'text-violet-700',
    border: 'border-violet-300',
    ring: 'ring-violet-400',
    dot: 'bg-violet-600',
    hex: '#7c3aed',
  },
}

// Fallback so an unexpected color key never crashes the UI.
const fallback = colorStyles.purple

export function styleFor(color) {
  return colorStyles[color] || fallback
}
