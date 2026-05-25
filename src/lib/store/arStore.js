import { create } from 'zustand'

export const useARStore = create((set) => ({
  // AR engine state
  isInitializing: false,
  isTracking:     false,
  isMapFound:     false,
  trackingLost:   false,
  error:          null,

  // Selected alumni
  activeAlumni:   null,

  // Demo mode (no .mind file needed)
  demoMode:       false,

  setInitializing:  (v)  => set({ isInitializing: v }),
  setTracking:      (v)  => set({ isTracking: v }),
  setMapFound:      (v)  => set({ isMapFound: v, trackingLost: false }),
  setTrackingLost:  (v)  => set({ trackingLost: v }),
  setError:         (e)  => set({ error: e }),
  setActiveAlumni:  (a)  => set({ activeAlumni: a }),
  setDemoMode:      (v)  => set({ demoMode: v }),
  clearActiveAlumni:()   => set({ activeAlumni: null }),
  reset:            ()   => set({
    isInitializing: false, isTracking: false, isMapFound: false,
    trackingLost: false, error: null, activeAlumni: null,
  }),
}))
