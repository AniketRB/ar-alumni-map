import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useARStore } from '@/lib/store/arStore'
import { normalizedToWorld } from '@/lib/ar/coordinateMapper'
import { getCityCoordinates } from '@/data/cityCoordinates'

/* ── Brand colours ───────────────────────────────────────── */
const BRAND = {
  Google:          0x4285f4, Microsoft:       0x00a4ef,
  Meta:            0x0866ff, Apple:           0x888888,
  Amazon:          0xff9900, Netflix:         0xe50914,
  DeepMind:        0x6366f1, Stripe:          0x635bff,
  Uber:            0x06b6d4, 'Goldman Sachs': 0x22c55e,
  'Agnikul Cosmos':0xf97316, default:         0x8b5cf6,
}
function brandColor(company = '') { return BRAND[company] ?? BRAND.default }

function dominantColor(alumniList) {
  const counts = {}
  alumniList.forEach(a => { counts[a.company] = (counts[a.company] || 0) + 1 })
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
  return brandColor(top)
}

/* ── Real viewport (avoids Android address-bar trap) ─────── */
function getViewport() {
  if (window.visualViewport) return { w: window.visualViewport.width, h: window.visualViewport.height }
  return { w: window.innerWidth, h: window.innerHeight }
}
function sizeContainer(el) {
  if (!el) return
  const { w, h } = getViewport()
  Object.assign(el.style, { width: w + 'px', height: h + 'px', position: 'fixed', top: '0', left: '0', overflow: 'hidden' })
}

/* ── Group alumni by city ───────────────────────────────── */
function buildCityGroups(alumni) {
  const map = {}
  alumni.forEach((a) => {
    const key = `${a.city}__${a.country}`
    if (!map[key]) map[key] = { key, city: a.city, country: a.country, nx: a.nx, ny: a.ny, list: [] }
    map[key].list.push(a)
  })
  return Object.values(map)
}

/* ── City zone (flat glowing disc on the map surface) ───── */
function createCityZone(color, count) {
  const g = new THREE.Group()
  const r = 0.026 + 0.007 * Math.min(Math.log2(count + 1), 3.5)

  const mat = (opacity) => new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, side: THREE.DoubleSide,
  })

  const disc = new THREE.Mesh(new THREE.CircleGeometry(r * 0.50, 32), mat(0.65))
  disc.rotation.x = -Math.PI / 2
  g.add(disc)

  const rim = new THREE.Mesh(new THREE.RingGeometry(r * 0.55, r, 48), mat(0.50))
  rim.rotation.x = -Math.PI / 2
  g.add(rim)

  const pulse = new THREE.Mesh(new THREE.RingGeometry(r * 1.06, r * 1.34, 48), mat(0.18))
  pulse.rotation.x = -Math.PI / 2
  g.add(pulse)

  g.userData = { disc, rim, pulse }
  return g
}

function lerp(a, b, t) { return a + (b - a) * t }

/* ── Camera permission ───────────────────────────────────── */
async function requestCamera() {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
    s.getTracks().forEach(t => t.stop())
    return true
  } catch (e) { console.warn('[AR] camera:', e.name); return false }
}

/* ── Demo grid (zones in a grid) ─────────────────────────── */
function buildDemoScene(scene, alumni) {
  const root  = new THREE.Group()
  scene.add(root)
  const groups = buildCityGroups(alumni)
  groups.forEach((cg, i) => {
    const col   = i % 4
    const row   = Math.floor(i / 4)
    const color = dominantColor(cg.list)
    const zone  = createCityZone(color, cg.list.length)
    zone.position.set((col - 1.5) * 0.38, (1.5 - row) * 0.32, 0)
    zone.userData.cityKey    = cg.key
    zone.userData.cityAlumni = cg.list
    root.add(zone)
  })
  return root
}

/* ── Main Component ──────────────────────────────────────── */
export default function ARScene({ alumni, onZoneClick }) {
  const containerRef = useRef(null)
  const engineRef    = useRef(null)
  const cameraRef    = useRef(null)
  const markersRef   = useRef([])   // meshes for raycasting
  const zonesRef     = useRef([])   // zone groups for animation
  const raycaster    = useRef(new THREE.Raycaster())
  const pointer      = useRef(new THREE.Vector2())
  const zoomTarget   = useRef({ sx: 1, sy: 1, px: 0, py: 0 })
  const zoomCurrent  = useRef({ sx: 1, sy: 1, px: 0, py: 0 })

  const {
    setInitializing, setTracking, setMapFound,
    setTrackingLost, setError, demoMode,
    focusedCity, cityZoomMode,
  } = useARStore()

  /* ── Zoom target update ──────────────────────────────────── */
  useEffect(() => {
    if (!cityZoomMode || !focusedCity) {
      zoomTarget.current = { sx: 1, sy: 1, px: 0, py: 0 }
    } else {
      const coords = getCityCoordinates(focusedCity, '')
      const { x, y } = normalizedToWorld(coords.nx, coords.ny)
      const Z = 4.5
      zoomTarget.current = { sx: Z, sy: Z, px: -x * Z, py: -y * Z }
    }
  }, [focusedCity, cityZoomMode])

  /* ── Tap → find zone ─────────────────────────────────────── */
  const handleTap = useCallback((e) => {
    const bounds = containerRef.current?.getBoundingClientRect()
    if (!bounds || !cameraRef.current) return
    const cx = e.touches ? e.touches[0].clientX : e.clientX
    const cy = e.touches ? e.touches[0].clientY : e.clientY
    pointer.current.x = ((cx - bounds.left) / bounds.width)  *  2 - 1
    pointer.current.y = ((cy - bounds.top)  / bounds.height) * -2 + 1
    raycaster.current.setFromCamera(pointer.current, cameraRef.current)
    const hits = raycaster.current.intersectObjects(markersRef.current, true)
    if (!hits.length) return
    let obj = hits[0].object
    while (obj && !obj.userData.cityKey) obj = obj.parent
    if (obj?.userData.cityKey) onZoneClick(obj.userData.cityAlumni)
  }, [onZoneClick])

  /* ── Demo mode ───────────────────────────────────────────── */
  useEffect(() => {
    if (!demoMode || !containerRef.current) return
    const el = containerRef.current
    sizeContainer(el)

    const { w, h } = getViewport()
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(75, w / h, 0.01, 100)
    camera.position.set(0, 0, 2)
    scene.add(camera)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.setClearColor(0x050508, 1)
    el.appendChild(renderer.domElement)
    cameraRef.current = camera

    scene.add(new THREE.AmbientLight(0xffffff, 1.2))
    const root = buildDemoScene(scene, alumni)

    markersRef.current = []
    zonesRef.current   = []
    root.traverse(c => {
      if (c.isGroup && c.userData.cityKey) {
        zonesRef.current.push(c)
        c.children.forEach(ch => { if (ch.isMesh) markersRef.current.push(ch) })
      }
    })
    setMapFound(true)

    let t = 0, frame
    const animate = () => {
      frame = requestAnimationFrame(animate)
      t += 0.016
      root.rotation.y += 0.002
      zonesRef.current.forEach((zone, i) => {
        const { disc, rim, pulse } = zone.userData
        if (disc)  disc.material.opacity  = 0.50 + 0.18 * Math.sin(t * 1.8 + i * 0.9)
        if (rim)   rim.material.opacity   = 0.35 + 0.18 * Math.sin(t * 1.8 + i * 0.9 + 0.4)
        if (pulse) {
          pulse.material.opacity = Math.max(0, 0.12 + 0.12 * Math.sin(t * 2.2 + i * 0.7))
          pulse.scale.setScalar(1 + 0.18 * ((Math.sin(t * 2.2 + i * 0.7) + 1) / 2))
        }
      })
      renderer.render(scene, camera)
    }
    animate()

    el.addEventListener('click',      handleTap)
    el.addEventListener('touchstart', handleTap, { passive: true })

    const onResize = () => {
      sizeContainer(el)
      const { w: nw, h: nh } = getViewport()
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.visualViewport?.addEventListener('resize', onResize)
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frame)
      renderer.dispose()
      renderer.domElement.remove()
      el.removeEventListener('click',      handleTap)
      el.removeEventListener('touchstart', handleTap)
      window.visualViewport?.removeEventListener('resize', onResize)
      window.removeEventListener('resize', onResize)
    }
  }, [demoMode, alumni, handleTap, setMapFound])

  /* ── MindAR mode ─────────────────────────────────────────── */
  useEffect(() => {
    if (demoMode || !containerRef.current) return
    setInitializing(true)
    let mindarThree, destroyed = false

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setInitializing(false)
        setError('Camera not available. Use HTTPS and a supported browser.')
        return
      }
      if (!(await requestCamera())) {
        setInitializing(false); setError('permission denied'); return
      }
      if (destroyed) return

      let MindARThree
      try {
        const mod = await import('mind-ar/dist/mindar-image-three.prod.js')
        MindARThree = mod.MindARThree
      } catch (err) {
        console.error('[ARScene] Failed to import mind-ar:', err)
        setInitializing(false)
        setError('Failed to load AR engine. Please refresh and try again.')
        return
      }
      if (destroyed) return

      const el = containerRef.current
      sizeContainer(el)
      await new Promise(r => setTimeout(r, 50))
      if (destroyed) return

      mindarThree = new MindARThree({
        container: el,
        imageTargetSrc: '/ar-assets/map.mind',
        uiLoading: 'no', uiScanning: 'no', uiError: 'no',
        filterMinCF: 0.001, filterBeta: 10,
        warmupTolerance: 5, missTolerance: 5,
      })
      engineRef.current = mindarThree
      const { renderer, scene, camera } = mindarThree
      cameraRef.current = camera
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))

      scene.add(new THREE.AmbientLight(0xffffff, 1.2))
      const dir = new THREE.DirectionalLight(0xffffff, 0.5)
      dir.position.set(0, 1, 1); scene.add(dir)

      const anchor = mindarThree.addAnchor(0)
      anchor.onTargetFound = () => { setMapFound(true); setTrackingLost(false) }
      anchor.onTargetLost  = () => setTrackingLost(true)

      const cityGroups = buildCityGroups(alumni)
      markersRef.current = []
      zonesRef.current   = []

      cityGroups.forEach((cg) => {
        const color = dominantColor(cg.list)
        const { x, y } = normalizedToWorld(cg.nx, cg.ny)
        const zone  = createCityZone(color, cg.list.length)
        zone.position.set(x, y, 0.001)
        zone.userData.cityKey    = cg.key
        zone.userData.cityAlumni = cg.list
        anchor.group.add(zone)
        zonesRef.current.push(zone)
        zone.children.forEach(ch => { if (ch.isMesh) markersRef.current.push(ch) })
      })

      let t = 0
      renderer.setAnimationLoop(() => {
        t += 0.016

        zonesRef.current.forEach((zone, i) => {
          const { disc, rim, pulse } = zone.userData
          if (disc)  disc.material.opacity  = 0.50 + 0.18 * Math.sin(t * 1.8 + i * 0.9)
          if (rim)   rim.material.opacity   = 0.35 + 0.18 * Math.sin(t * 1.8 + i * 0.9 + 0.4)
          if (pulse) {
            pulse.material.opacity = Math.max(0, 0.12 + 0.12 * Math.sin(t * 2.2 + i * 0.7))
            pulse.scale.setScalar(1 + 0.18 * ((Math.sin(t * 2.2 + i * 0.7) + 1) / 2))
          }
        })

        // Smooth zoom
        const c = zoomCurrent.current, tg = zoomTarget.current
        c.sx = lerp(c.sx, tg.sx, 0.06); c.sy = lerp(c.sy, tg.sy, 0.06)
        c.px = lerp(c.px, tg.px, 0.06); c.py = lerp(c.py, tg.py, 0.06)
        anchor.group.scale.set(c.sx, c.sy, 1)
        anchor.group.position.set(c.px, c.py, 0)

        renderer.render(scene, camera)
      })

      const onResize = () => {
        sizeContainer(el)
        const { w, h } = getViewport()
        renderer.setSize(w, h)
      }
      window.visualViewport?.addEventListener('resize', onResize)
      window.addEventListener('resize', onResize)

      el.addEventListener('click',      handleTap)
      el.addEventListener('touchstart', handleTap, { passive: true })
      setTracking(true)

      try {
        await mindarThree.start()
        if (!destroyed) setInitializing(false)
      } catch (err) {
        console.error('[ARScene] mindarThree.start() failed:', err)
        if (!destroyed) {
          setInitializing(false)
          if      (err.name === 'NotAllowedError')  setError('permission denied')
          else if (err.name === 'NotFoundError')    setError('No camera found on this device.')
          else if (err.name === 'NotReadableError') setError('Camera is in use by another app.')
          else                                      setError(err.message || 'Failed to start AR.')
        }
      }
    }

    start()
    return () => {
      destroyed = true
      if (mindarThree) {
        mindarThree.renderer?.setAnimationLoop(null)
        mindarThree.stop().catch(() => {})
      }
      engineRef.current = null
    }
  }, [demoMode, alumni, handleTap, setInitializing, setTracking, setMapFound, setTrackingLost, setError])

  return (
    <div
      ref={containerRef}
      id="mindar-ar-container"
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0, overflow: 'hidden', background: '#000',
      }}
    />
  )
}
