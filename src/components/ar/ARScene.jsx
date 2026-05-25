import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useARStore } from '@/lib/store/arStore'
import { normalizedToWorld, clusterOffset } from '@/lib/ar/coordinateMapper'

/* ── Marker colours by company tier ─────────────────────── */
const TIER_COLORS = {
  Google: 0x4285f4, Microsoft: 0x00a4ef, Meta: 0x0866ff, Apple: 0xa8a9ad,
  Amazon: 0xff9900, Netflix: 0xe50914, DeepMind: 0x6366f1, Stripe: 0x635bff,
  Uber: 0x000000, default: 0x6366f1,
}
function markerColor(company = '') {
  return TIER_COLORS[company] ?? TIER_COLORS.default
}

/* ── Build city clusters so markers don't overlap exactly ── */
function buildPositions(alumni) {
  const cityMap = {}
  alumni.forEach((a) => {
    const key = `${a.city}-${a.country}`
    if (!cityMap[key]) cityMap[key] = []
    cityMap[key].push(a)
  })

  return alumni.map((a) => {
    const key       = `${a.city}-${a.country}`
    const group     = cityMap[key]
    const idx       = group.indexOf(a)
    const { dx, dy } = clusterOffset(idx, group.length)
    return { nx: a.nx + dx, ny: a.ny + dy }
  })
}

/* ── Demo: place markers in a grid on a flat plane ─────── */
function buildDemoScene(scene, alumni, onMarkerClick) {
  const group = new THREE.Group()
  scene.add(group)

  alumni.forEach((alum, i) => {
    const col = i % 4, row = Math.floor(i / 4)
    const x = (col - 1.5) * 0.35, y = (1 - row) * 0.28, z = 0

    const geometry = new THREE.SphereGeometry(0.05, 16, 16)
    const material = new THREE.MeshBasicMaterial({ color: markerColor(alum.company) })
    const sphere   = new THREE.Mesh(geometry, material)
    sphere.position.set(x, y, z)
    sphere.userData = { alumniId: alum.id }

    // outer ring
    const ringGeo = new THREE.RingGeometry(0.065, 0.08, 32)
    const ringMat = new THREE.MeshBasicMaterial({
      color: markerColor(alum.company), transparent: true, opacity: 0.4, side: THREE.DoubleSide,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = -Math.PI / 2
    sphere.add(ring)

    group.add(sphere)
  })

  // camera position for demo
  const camera = scene.getObjectByName('__demo_camera')
  if (camera) camera.position.set(0, 0.5, 2)

  return group
}

/* ── Main AR Scene Component ─────────────────────────────── */
export default function ARScene({ alumni, onMarkerClick }) {
  const containerRef = useRef(null)
  const engineRef    = useRef(null)   // MindARThree instance
  const sceneRef     = useRef(null)
  const cameraRef    = useRef(null)
  const rendererRef  = useRef(null)
  const markersRef   = useRef([])
  const raycasterRef = useRef(new THREE.Raycaster())
  const pointerRef   = useRef(new THREE.Vector2())

  const { setInitializing, setTracking, setMapFound, setTrackingLost, setError, demoMode } = useARStore()

  /* ── raycasting on tap ──────────────────────────────── */
  const handleTap = useCallback((e) => {
    const bounds = containerRef.current?.getBoundingClientRect()
    if (!bounds || !rendererRef.current) return

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    pointerRef.current.x = ((clientX - bounds.left) / bounds.width)  *  2 - 1
    pointerRef.current.y = ((clientY - bounds.top)  / bounds.height) * -2 + 1

    raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current)
    const hits = raycasterRef.current.intersectObjects(markersRef.current, true)

    if (hits.length > 0) {
      let obj = hits[0].object
      // walk up to find userData.alumniId
      while (obj && !obj.userData.alumniId) obj = obj.parent
      if (obj?.userData.alumniId) {
        const found = alumni.find((a) => a.id === obj.userData.alumniId)
        if (found) onMarkerClick(found)
      }
    }
  }, [alumni, onMarkerClick])

  /* ── Demo mode (no .mind file) ──────────────────────── */
  useEffect(() => {
    if (!demoMode || !containerRef.current) return

    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100)
    camera.name    = '__demo_camera'
    camera.position.set(0, 0.8, 1.8)
    scene.add(camera)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x050508, 1)
    containerRef.current.appendChild(renderer.domElement)

    cameraRef.current   = camera
    rendererRef.current = renderer
    sceneRef.current    = scene

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    // build markers
    const demoGroup = buildDemoScene(scene, alumni, onMarkerClick)
    markersRef.current = []
    demoGroup.traverse((c) => { if (c.isMesh && c.userData.alumniId) markersRef.current.push(c) })

    // slow rotation for demo
    let frame
    const animate = () => {
      frame = requestAnimationFrame(animate)
      demoGroup.rotation.y += 0.002
      renderer.render(scene, camera)
    }
    animate()
    setMapFound(true)

    const el = containerRef.current
    el.addEventListener('click', handleTap)
    el.addEventListener('touchstart', handleTap, { passive: true })

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frame)
      renderer.dispose()
      renderer.domElement.remove()
      el.removeEventListener('click', handleTap)
      el.removeEventListener('touchstart', handleTap)
      window.removeEventListener('resize', onResize)
    }
  }, [demoMode, alumni, handleTap, onMarkerClick, setMapFound])

  /* ── MindAR mode ────────────────────────────────────── */
  useEffect(() => {
    if (demoMode || !containerRef.current) return

    setInitializing(true)
    let mindarThree
    let destroyed = false

    const start = async () => {
      let MindARThree
      try {
        const mod = await import('mind-ar/dist/mindar-image-three.prod.js')
        MindARThree = mod.MindARThree
      } catch (importErr) {
        console.error('[ARScene] Failed to import mind-ar:', importErr)
        setInitializing(false)
        setError('Failed to load AR engine. Please refresh and try again.')
        return
      }

      if (destroyed) return

      mindarThree = new MindARThree({
        container:      containerRef.current,
        imageTargetSrc: '/ar-assets/map.mind',
        uiLoading:      'no',
        uiScanning:     'no',
        uiError:        'no',
        filterMinCF:    0.001,
        filterBeta:     10,
        warmupTolerance: 5,
        missTolerance:   5,
      })

      engineRef.current = mindarThree
      const { renderer, scene, camera } = mindarThree
      rendererRef.current = renderer
      sceneRef.current    = scene
      cameraRef.current   = camera

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      scene.add(new THREE.AmbientLight(0xffffff, 0.8))
      const dir = new THREE.DirectionalLight(0xffffff, 0.4)
      dir.position.set(0, 5, 5)
      scene.add(dir)

      const anchor = mindarThree.addAnchor(0)
      anchor.onTargetFound = () => { setMapFound(true); setTrackingLost(false) }
      anchor.onTargetLost  = () => setTrackingLost(true)

      const positions = buildPositions(alumni)
      markersRef.current = []

      alumni.forEach((alum, i) => {
        const { nx, ny } = positions[i]
        const { x, y, z } = normalizedToWorld(nx, ny)
        const color = markerColor(alum.company)

        const ringGeo = new THREE.RingGeometry(0.045, 0.055, 32)
        const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
        const ring    = new THREE.Mesh(ringGeo, ringMat)
        ring.rotation.x = -Math.PI / 2
        ring.position.set(x, y, z + 0.001)

        const sphereGeo = new THREE.SphereGeometry(0.028, 16, 16)
        const sphereMat = new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.6 })
        const sphere    = new THREE.Mesh(sphereGeo, sphereMat)
        sphere.position.set(x, y, z + 0.028)
        sphere.userData = { alumniId: alum.id }

        anchor.group.add(ring)
        anchor.group.add(sphere)
        markersRef.current.push(sphere)
      })

      renderer.setAnimationLoop(() => {
        const t = Date.now() * 0.001
        anchor.group.children.forEach((child, i) => {
          if (child.geometry?.type === 'RingGeometry') {
            child.material.opacity = (0.8 + Math.sin(t * 2 + i) * 0.2) * 0.35
            child.scale.setScalar(1 + Math.sin(t * 1.5 + i) * 0.12)
          }
        })
        renderer.render(scene, camera)
      })

      const el = containerRef.current
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
          if (err.message?.toLowerCase().includes('permission')) {
            setError('Camera permission denied. Please allow camera access in browser settings.')
          } else {
            setError(err.message || 'Failed to start AR. Try Demo Mode.')
          }
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
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0 }}
    />
  )
}
