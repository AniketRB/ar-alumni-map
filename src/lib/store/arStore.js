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

  // Demo mode
  demoMode:       false,

  // City zoom mode
  focusedCity:    null,   // city name string or null (world view)
  cityZoomMode:   false,

  setInitializing:  (v)  => set({ isInitializing: v }),
  setTracking:      (v)  => set({ isTracking: v }),
  setMapFound:      (v)  => set({ isMapFound: v, trackingLost: false }),
  setTrackingLost:  (v)  => set({ trackingLost: v }),
  setError:         (e)  => set({ error: e }),
  setActiveAlumni:  (a)  => set({ activeAlumni: a }),
  setDemoMode:      (v)  => set({ demoMode: v }),
  clearActiveAlumni:()   => set({ activeAlumni: null }),
  setFocusedCity:   (city) => set({ focusedCity: city, cityZoomMode: !!city }),
  reset:            ()   => set({
    isInitializing: false, isTracking: false, isMapFound: false,
    trackingLost: false, error: null, activeAlumni: null,
    focusedCity: null, cityZoomMode: false,
  }),
}))