import { styleFor } from '../lib/colors'

// First-load screen: four big colorful buttons, one per family member.
export default function NamePicker({ members, onPick }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="text-5xl">🏡</div>
        <h1 className="mt-3 text-3xl font-extrabold text-gray-800">Family Task Board</h1>
        <p className="mt-2 text-gray-500">Who's using the app?</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {members.map((m) => {
            const s = styleFor(m.color)
            return (
              <button
                key={m.id}
                onClick={() => onPick(m.id)}
                className={`flex items-center justify-center gap-3 rounded-2xl px-6 py-6 text-xl font-bold text-white shadow-lg transition active:scale-95 ${s.solid} ${s.solidHover}`}
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-2xl font-extrabold">
                  {m.name[0]}
                </span>
                {m.name}
              </button>
            )
          })}
        </div>

        <p className="mt-8 text-xs text-gray-400">
          You can switch later from the menu. Your choice is saved on this device.
        </p>
      </div>
    </div>
  )
}
