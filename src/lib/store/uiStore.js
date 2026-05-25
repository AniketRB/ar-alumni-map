import { create } from 'zustand'

export const useUIStore = create((set) => ({
  navOpen:       false,
  adminSidebar:  true,
  toast:         null,

  setNavOpen:     (v)   => set({ navOpen: v }),
  toggleNav:      ()    => set((s) => ({ navOpen: !s.navOpen })),
  setAdminSidebar:(v)   => set({ adminSidebar: v }),

  showToast: (message, type = 'success') => {
    set({ toast: { message, type, id: Date.now() } })
    setTimeout(() => set({ toast: null }), 3500)
  },
}))
