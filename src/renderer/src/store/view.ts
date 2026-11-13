import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ViewStore {
  focus: boolean
  typewriter: boolean
  toggleFocus: () => void
  toggleTypewriter: () => void
}

export const useView = create<ViewStore>()(
  persist(
    (set) => ({
      focus: false,
      typewriter: false,
      toggleFocus: () => set((s) => ({ focus: !s.focus })),
      toggleTypewriter: () => set((s) => ({ typewriter: !s.typewriter }))
    }),
    {
      name: 'toi_writer.view',
      version: 1,
      // v0 stored focus as 'off' | 'sentence' | 'paragraph'.
      migrate: (stored) => {
        const old = stored as { focus?: unknown; typewriter?: boolean }
        return {
          focus: old.focus === true || old.focus === 'sentence' || old.focus === 'paragraph',
          typewriter: old.typewriter === true
        }
      }
    }
  )
)
