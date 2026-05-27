import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useARStore } from '@/lib/store/arStore'
import { normalizedToWorld, clusterOffset } from '@/lib/ar/coordinateMapper'
import { getCityCoordinates } from '@/data/cityCoordinates'

/* ── Brand colours ───────────────────────────────────────── */
const BRAND = {
  Google:          { color: 0x4285f4 }, Microsoft:  { color: 0x00a4ef },
  Meta:            { color: 0x0866ff }, Apple:      { color: 0x888888 },
  Amazon:          { color: 0xff9900 }, Netflix:    { color: 0xe50914 },
  DeepMind:        { color: 0x6366f1 }, Stripe:     { color: 0x635bff },
  Uber:            { color: 0x06b6d4 }, 'Goldman Sachs': { color: 0x22c55e },
  'Agnikul Cosmos':{ color: 0xf97316 },
  default:         { color: 0x8b5cf6 },
}
function getBrand(c = '') { return BRAND[c] ?? BRAND.default }

/* ── Get REAL viewport size (not CSS 100vh which includes browser chrome) ── */
function getViewport() {
  // window.visualViewport is the gold standard on mobile
  // falls back to window.innerWidth/innerHeight (also correct on most browsers)
  if (window.visualViewport) {
    return {
      w: window.visualViewport.width,
      h: window.visualViewport.height,
    }
  }
  return { w: window.innerWidth, h: window.innerHeight }
}

/* ── Apply correct size to the container div ─────────────── */
function sizeContainer(el) {
  if (!el) return
  const { w, h } = getViewport()
  el.style.width  = w + 'px'
  el.style.height = h + 'px'
  el.style.position = 'fixed'
  el.style.top  = '0'
  el.style.left = '0'
  el.style.overflow = 'hidden'
}

/* ── Build positions with cluster offset ─────────────────── */
function buildPositions(alumni) {
  const cityMap = {}
  alumni.forEach((a) => {
    const key = `${a.city}__${a.country}`
    if (!cityMap[key]) cityMap[key] = []
    cityMap[key].push(a)
  })
  return alumni.map((a) => {
    const key   = `${a.city}__${a.country}`
    const group = cityMap[key]
    const idx   = group.indexOf(a)
    const { dx, dy } = clusterOffset(idx, group.length)
    return { nx: a.nx + dx, ny: a.ny + dy, clusterSize: group.length }
  })
}

/* ── 3-D pin marker ──────────────────────────────────────── */
function createPin(color, scale = 1.0) {
  const g = new THREE.Group()
  const s = scale
  const needleH = 0.022 * s
  const needle  = new THREE.Mesh(
    new THREE.ConeGeometry(0.004 * s, needleH, 8),
    new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.7 })
  )
  needle.rotation.z = Math.PI
  needle.position.y = needleH * 0.5
  g.add(needle)

  const ballR = 0.013 * s
  const ball  = new THREE.Mesh(
    new THREE.SphereGeometry(ballR, 16, 16),
    new THREE.MeshStandardMaterial({ color, roughness: 0.15, metalness: 0.8, emissive: color, emissiveIntensity: 0.35 })
  )
  ball.position.y = needleH + ballR
  g.add(ball)

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.016 * s, 0.022 * s, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  )
  ring.rotation.x = -Math.PI / 2
  ring.position.y = 0.001
  g.add(ring)

  const foot = new THREE.Mesh(
    new THREE.CircleGeometry(0.008 * s, 24),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
  )
  foot.rotation.x = -Math.PI / 2
  foot.position.y = 0.0005
  g.add(foot)

  g.userData = { ring, ball, baseY: needleH + ballR, color }
  return g
}

function lerp(a, b, t) { return a + (b - a) * t }

/* ── Camera permission ───────────────────────────────────── */
async function requestCamera() {
  try {
    const s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } }, audio: false,
    })
    s.getTracks().forEach(t => t.stop())
    return true
  } catch (e) { console.warn('[AR] camera:', e.name); return false }
}

/* ── Demo grid ───────────────────────────────────────────── */
function buildDemoScene(scene, alumni) {
  const root = new THREE.Group()
  scene.add(root)
  alumni.forEach((alum, i) => {
    const col = i % 4, row = Math.floor(i / 4)
    const pin = createPin(getBrand(alum.company).color, 1)
    pin.position.set((col - 1.5) * 0.38, (1 - row) * 0.30, 0)
    pin.rotation.x = -Math.PI / 2
    pin.userData.alumniId = alum.id
    root.add(pin)
  })
  return root
}

/* ── Main Component ──────────────────────────────────────── */
export default function ARScene({ alumni, onMarkerClick }) {
  const containerRef = useRef(null)
  const engineRef    = useRef(null)
  const cameraRef    = useRef(null)
  const markersRef   = useRef([])
  const pinsRef      = useRef([])
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

  /* ── Tap handler ─────────────────────────────────────────── */
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
    while (obj && !obj.userData.alumniId) obj = obj.parent
    if (obj?.userData.alumniId) {
      const found = alumni.find(a => a.id === obj.userData.alumniId)
      if (found) onMarkerClick(found)
    }
  }, [alumni, onMarkerClick])

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
    pinsRef.current    = []
    root.traverse(c => {
      if (c.isGroup && c.userData.alumniId) {
        markersRef.current.push(...c.children.filter(ch => ch.isMesh))
        pinsRef.current.push(c)
      }
    })
    setMapFound(true)

    let t = 0, frame
    const animate = () => {
      frame = requestAnimationFrame(animate)
      t += 0.016
      root.rotation.y += 0.003
      pinsRef.current.forEach((pin, i) => {
        const { ring, ball, baseY } = pin.userData
        if (ring) ring.material.opacity = 0.3 + 0.25 * Math.sin(t * 2 + i * 0.8)
        if (ball) ball.position.y = baseY + 0.003 * Math.sin(t * 3 + i * 1.2)
      })
      renderer.render(scene, camera)
    }
    animate()

    el.addEventListener('click', handleTap)
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
      el.removeEventListener('click', handleTap)
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
        setInitializing(false)
        setError('MindAR failed to load. Check your internet connection.')
        return
      }
      if (destroyed) return

      // ── CRITICAL: size container to REAL viewport BEFORE MindAR reads it ──
      const el = containerRef.current
      sizeContainer(el)

      // Small yield so browser has applied the sizes before MindAR reads clientWidth/clientHeight
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

      const positions = buildPositions(alumni)
      markersRef.current = []
      pinsRef.current    = []

      alumni.forEach((alum, i) => {
        const { nx, ny, clusterSize } = positions[i]
        const { x, y } = normalizedToWorld(nx, ny)
        const s = clusterSize > 5 ? 0.65 : clusterSize > 2 ? 0.8 : 1.0
        const pin = createPin(getBrand(alum.company).color, s)
        pin.position.set(x, y, 0.001)
        pin.userData.alumniId = alum.id
        anchor.group.add(pin)
        pinsRef.current.push(pin)
        pin.traverse(c => { if (c.isMesh) markersRef.current.push(c) })
      })

      let t = 0
      renderer.setAnimationLoop(() => {
        t += 0.016

        // Pulse pins
        pinsRef.current.forEach((pin, i) => {
          const { ring, ball, baseY } = pin.userData
          if (ring) {
            ring.material.opacity = 0.35 + 0.25 * Math.sin(t * 2 + i * 0.7)
            ring.scale.setScalar(1 + 0.15 * Math.sin(t * 1.5 + i * 0.5))
          }
          if (ball) ball.position.y = baseY + 0.003 * Math.sin(t * 3 + i * 1.1)
        })

        // Smooth zoom
        const c = zoomCurrent.current, tg = zoomTarget.current, sp = 0.06
        c.sx = lerp(c.sx, tg.sx, sp); c.sy = lerp(c.sy, tg.sy, sp)
        c.px = lerp(c.px, tg.px, sp); c.py = lerp(c.py, tg.py, sp)
        anchor.group.scale.set(c.sx, c.sy, 1)
        anchor.group.position.set(c.px, c.py, 0)

        renderer.render(scene, camera)
      })

      // ── Resize handler: re-size container so MindAR video stays correct ──
      const onResize = () => {
        sizeContainer(el)
        // MindAR doesn't expose a resize API, so we update the renderer
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
        position: 'fixed',
        top: 0, left: 0,
        // Use JS-set px values (via sizeContainer) — not 100vh which is wrong on mobile
        // Default to 100% here; sizeContainer() overrides with exact pixel values
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden',
        background: '#000',
      }}
    />
  )
}