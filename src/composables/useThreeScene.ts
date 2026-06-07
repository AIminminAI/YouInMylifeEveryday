import { ref, watch, type Ref } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'
import type { TimeNode } from '@/data/timelineData'
import { useSubscription } from '@/composables/useSubscription'

interface UseThreeSceneOptions {
  container: Ref<HTMLElement | null>
  nodes: TimeNode[]
  onNodeChange: (index: number) => void
  onPaywallRequired: (trigger: 'node' | 'export-video' | 'export-hd' | 'skin') => void
}

export function useThreeScene(options: UseThreeSceneOptions) {
  const { container, nodes, onNodeChange, onPaywallRequired } = options
  const { isNodeLocked, canExportVideo, isFree, isPaid, currentPlan } = useSubscription()

  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer
  let spiralCurve: THREE.CatmullRomCurve3
  let nodeMeshes: THREE.Mesh[] = []
  let nodeLights: THREE.PointLight[] = []
  let nodeGlows: THREE.Mesh[] = [] // 发光光晕
  let nodeRings: THREE.Mesh[] = [] // 锁定环
  let nodeLockSprites: THREE.Sprite[] = [] // 锁图标
  let nodeYearSprites: THREE.Sprite[] = [] // 年份标签
  let starField: THREE.Points
  let animationId: number
  let raycaster: THREE.Raycaster
  let mouse: THREE.Vector2
  let currentNodeIndex = 0
  let isAnimating = false
  let cameraProgress = 0

  // 滚轮惯性系统
  let scrollVelocity = 0
  let scrollTween: gsap.core.Tween | null = null
  let lastWheelTime = 0
  let wheelAccumulator = 0
  const SCROLL_DECAY = 0.92
  const SCROLL_THRESHOLD = 0.0005
  const SCROLL_SENSITIVITY = 0.00015
  const SCROLL_MAX_VELOCITY = 0.04

  // 影院自动播放
  let isAutoPlaying = true
  let autoPlayProgress = 0
  let autoPlayPaused = false
  let autoPlayWaitTimer: number | null = null
  const AUTO_PLAY_SPEED = 0.015 // 每秒前进的进度
  const AUTO_PLAY_NODE_WAIT = 3000 // 到达节点后停留时间(ms)

  // 视频录制
  let mediaRecorder: MediaRecorder | null = null
  let recordedChunks: Blob[] = []
  let isRecording = false
  let recordingCheckInterval: number | null = null
  // 离屏渲染器（纯净录制，不含 UI）
  let offscreenRenderer: THREE.WebGLRenderer | null = null
  let offscreenCamera: THREE.PerspectiveCamera | null = null

  const isLoading = ref(true)
  const isPlaying = ref(true)
  const isExportingVideo = ref(false)
  const exportProgress = ref(0)

  // 螺旋参数
  const SPIRAL_RADIUS = 8
  const SPIRAL_HEIGHT = 30
  const SPIRAL_TURNS = 2.5
  const CAMERA_OFFSET = new THREE.Vector3(4, 2, 6)

  function init() {
    if (!container.value) return

    scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.008)

    camera = new THREE.PerspectiveCamera(
      60,
      container.value.clientWidth / container.value.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(12, 5, 12)

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    })
    renderer.setSize(container.value.clientWidth, container.value.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.value.appendChild(renderer.domElement)

    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()

    createStarField()
    createSpiralCurve()
    createNodeSpheres()
    createAmbientLight()

    // 初始摄像机位置 - 从远处开始，有开场飞入效果
    const startPos = spiralCurve.getPointAt(0)
    camera.position.copy(startPos.clone().add(new THREE.Vector3(15, 10, 20)))
    camera.lookAt(startPos)

    // 事件
    window.addEventListener('resize', onResize)
    renderer.domElement.addEventListener('click', onCanvasClick)
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false })
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false })
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false })

    isLoading.value = false
    animate()

    // 开场飞入动画后开始自动播放
    setTimeout(() => {
      startCinematicIntro()
    }, 500)

    // 监听付费状态变化，更新场景
    watch(currentPlan, () => {
      updateNodeVisualsAfterPayment()
      // 付费后恢复自动播放
      if (isPaid.value && !isAutoPlaying) {
        startAutoPlay()
      }
    })
  }

  // ========== 开场飞入 ==========
  function startCinematicIntro() {
    const startPos = spiralCurve.getPointAt(0)
    const cameraTarget = startPos.clone().add(CAMERA_OFFSET)

    gsap.to(camera.position, {
      x: cameraTarget.x,
      y: cameraTarget.y,
      z: cameraTarget.z,
      duration: 3,
      ease: 'power2.inOut',
      onUpdate: () => {
        camera.lookAt(startPos)
      },
      onComplete: () => {
        cameraProgress = 0
        autoPlayProgress = 0
        isAutoPlaying = true
        isPlaying.value = true
        onNodeChange(0)
      },
    })
  }

  // ========== 影院自动播放 ==========
  function startAutoPlay() {
    isAutoPlaying = true
    autoPlayPaused = false
    isPlaying.value = true
    autoPlayProgress = cameraProgress
  }

  function pauseAutoPlay() {
    isAutoPlaying = false
    autoPlayPaused = true
    isPlaying.value = false
    if (autoPlayWaitTimer) {
      clearTimeout(autoPlayWaitTimer)
      autoPlayWaitTimer = null
    }
  }

  function toggleAutoPlay() {
    if (isAutoPlaying) {
      pauseAutoPlay()
    } else {
      startAutoPlay()
    }
  }

  function updateAutoPlay(delta: number) {
    if (!isAutoPlaying || autoPlayPaused || isAnimating) return

    // 免费版：到第3个节点后停止
    const maxFreeProgress = isFree.value
      ? nodes[Math.min(2, nodes.length - 1)].curvePosition + 0.02
      : 1.0

    autoPlayProgress += delta * AUTO_PLAY_SPEED

    if (autoPlayProgress >= maxFreeProgress) {
      autoPlayProgress = maxFreeProgress
      isAutoPlaying = false
      isPlaying.value = false

      // 免费版到顶了，触发付费弹窗
      if (isFree.value) {
        onPaywallRequired('node')
      }
    }

    cameraProgress = autoPlayProgress
    updateCameraFromProgress()

    // 检查是否到达节点附近 - 停留一下
    for (let i = 0; i < nodes.length; i++) {
      const nodeT = nodes[i].curvePosition
      const dist = Math.abs(autoPlayProgress - nodeT)
      if (dist < 0.005 && i > currentNodeIndex) {
        // 到达新节点，短暂停留
        autoPlayPaused = true
        currentNodeIndex = i
        onNodeChange(i)

        autoPlayWaitTimer = window.setTimeout(() => {
          autoPlayPaused = false
        }, AUTO_PLAY_NODE_WAIT)
        break
      }
    }
  }

  // ========== 星空背景 ==========
  function createStarField() {
    const count = 3000
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 80 + Math.random() * 120
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      sizes[i] = Math.random() * 2 + 0.5

      const colorChoice = Math.random()
      if (colorChoice < 0.6) {
        colors[i3] = 0.9 + Math.random() * 0.1
        colors[i3 + 1] = 0.9 + Math.random() * 0.1
        colors[i3 + 2] = 1.0
      } else if (colorChoice < 0.85) {
        colors[i3] = 0.0
        colors[i3 + 1] = 0.7 + Math.random() * 0.3
        colors[i3 + 2] = 1.0
      } else {
        colors[i3] = 1.0
        colors[i3 + 1] = 0.85 + Math.random() * 0.15
        colors[i3 + 2] = 0.0
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 aColor;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vColor = aColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float twinkle = sin(uTime * 2.0 + position.x * 0.5 + position.y * 0.3) * 0.3 + 0.7;
          gl_PointSize = size * uPixelRatio * twinkle * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          gl_FragColor = vec4(vColor, alpha * 0.9);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    starField = new THREE.Points(geometry, material)
    scene.add(starField)
  }

  // ========== 螺旋曲线 ==========
  function createSpiralCurve() {
    const points: THREE.Vector3[] = []
    const segments = 200

    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const angle = t * Math.PI * 2 * SPIRAL_TURNS
      const x = SPIRAL_RADIUS * Math.cos(angle)
      const z = SPIRAL_RADIUS * Math.sin(angle)
      const y = t * SPIRAL_HEIGHT - SPIRAL_HEIGHT * 0.3
      points.push(new THREE.Vector3(x, y, z))
    }

    spiralCurve = new THREE.CatmullRomCurve3(points)

    const tubeGeometry = new THREE.TubeGeometry(spiralCurve, 300, 0.06, 8, false)
    const tubeMaterial = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          float flow = fract(vUv.x * 10.0 - uTime * 0.3);
          float glow = smoothstep(0.0, 0.5, flow) * smoothstep(1.0, 0.5, flow);
          vec3 color1 = vec3(0.0, 0.83, 1.0);
          vec3 color2 = vec3(1.0, 0.84, 0.0);
          vec3 color = mix(color1, color2, vUv.x);
          float alpha = 0.3 + glow * 0.5;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    })
    scene.add(new THREE.Mesh(tubeGeometry, tubeMaterial))

    const outerTubeGeometry = new THREE.TubeGeometry(spiralCurve, 300, 0.25, 8, false)
    const outerTubeMaterial = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          float pulse = sin(uTime * 2.0 + vUv.x * 20.0) * 0.5 + 0.5;
          vec3 color = mix(vec3(0.0, 0.83, 1.0), vec3(0.55, 0.36, 0.96), vUv.x);
          float alpha = 0.05 + pulse * 0.08;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    })
    scene.add(new THREE.Mesh(outerTubeGeometry, outerTubeMaterial))
  }

  // ========== 时光节点 ==========
  function createNodeSpheres() {
    const nodeColors = [
      new THREE.Color(0x00d4ff), new THREE.Color(0x4ade80),
      new THREE.Color(0xfbbf24), new THREE.Color(0xf97316),
      new THREE.Color(0xfb7185), new THREE.Color(0xffd700),
      new THREE.Color(0x34d399), new THREE.Color(0x8b5cf6),
      new THREE.Color(0x38bdf8), new THREE.Color(0xe879f9),
    ]
    const lockedColor = new THREE.Color(0x333344)

    nodes.forEach((node, index) => {
      const t = node.curvePosition
      const position = spiralCurve.getPointAt(t)
      const locked = isNodeLocked(index)
      const color = locked ? lockedColor : nodeColors[index % nodeColors.length]

      const sphereGeo = new THREE.SphereGeometry(0.35, 32, 32)
      const sphereMat = new THREE.MeshStandardMaterial({
        color,
        emissive: locked ? lockedColor : nodeColors[index % nodeColors.length],
        emissiveIntensity: locked ? 0.2 : 0.8,
        metalness: 0.3,
        roughness: locked ? 0.8 : 0.2,
        transparent: locked,
        opacity: locked ? 0.5 : 1.0,
      })
      const sphere = new THREE.Mesh(sphereGeo, sphereMat)
      sphere.position.copy(position)
      sphere.userData = { nodeIndex: index, locked }
      scene.add(sphere)
      nodeMeshes.push(sphere)

      // 锁定节点：显示锁图标 + 虚线环；解锁节点：发光光晕
      if (locked) {
        // 锁定环
        const ringGeo = new THREE.TorusGeometry(0.6, 0.03, 16, 32)
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x555566,
          transparent: true,
          opacity: 0.4,
        })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.position.copy(position)
        ring.rotation.x = Math.PI / 2
        scene.add(ring)

        // 锁标签
        const lockCanvas = document.createElement('canvas')
        lockCanvas.width = 128
        lockCanvas.height = 128
        const lockCtx = lockCanvas.getContext('2d')!
        lockCtx.fillStyle = 'transparent'
        lockCtx.fillRect(0, 0, 128, 128)
        lockCtx.font = '64px sans-serif'
        lockCtx.fillStyle = '#555566'
        lockCtx.textAlign = 'center'
        lockCtx.textBaseline = 'middle'
        lockCtx.fillText('🔒', 64, 64)

        const lockTexture = new THREE.CanvasTexture(lockCanvas)
        const lockSpriteMat = new THREE.SpriteMaterial({
          map: lockTexture,
          transparent: true,
          depthWrite: false,
          opacity: 0.6,
        })
        const lockSprite = new THREE.Sprite(lockSpriteMat)
        lockSprite.position.copy(position.clone().add(new THREE.Vector3(0, 0.8, 0)))
        lockSprite.scale.set(1, 1, 1)
        scene.add(lockSprite)
      } else {
        // 发光光晕
        const glowGeo = new THREE.SphereGeometry(0.7, 32, 32)
        const glowMat = new THREE.ShaderMaterial({
          uniforms: {
            uColor: { value: nodeColors[index % nodeColors.length] },
            uTime: { value: 0 }, uIndex: { value: index },
          },
          vertexShader: `
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 uColor;
            uniform float uTime;
            uniform float uIndex;
            varying vec3 vNormal;
            void main() {
              float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
              float pulse = sin(uTime * 3.0 + uIndex * 1.5) * 0.2 + 0.8;
              gl_FragColor = vec4(uColor, intensity * pulse * 0.6);
            }
          `,
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
        })
        const glowSphere = new THREE.Mesh(glowGeo, glowMat)
        glowSphere.position.copy(position)
        scene.add(glowSphere)
      }

      // 点光源（锁定节点光更暗）
      const light = new THREE.PointLight(
        locked ? 0x333344 : nodeColors[index % nodeColors.length],
        locked ? 0.3 : 2,
        locked ? 5 : 15,
      )
      light.position.copy(position)
      scene.add(light)
      nodeLights.push(light)

      // 年份标签
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 64
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = 'transparent'
      ctx.fillRect(0, 0, 256, 64)
      ctx.font = 'bold 36px "Noto Sans SC", sans-serif'
      ctx.fillStyle = locked ? '#555566' : '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(locked ? '???' : String(node.year), 128, 32)

      const texture = new THREE.CanvasTexture(canvas)
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
      const sprite = new THREE.Sprite(spriteMat)
      sprite.position.copy(position.clone().add(new THREE.Vector3(0, 1.2, 0)))
      sprite.scale.set(2.5, 0.6, 1)
      scene.add(sprite)
      nodeYearSprites.push(sprite)
    })
  }

  // ========== 付费后更新节点视觉 ==========
  function updateNodeVisualsAfterPayment() {
    if (!scene) return
    const nodeColors = [
      new THREE.Color(0x00d4ff), new THREE.Color(0x4ade80),
      new THREE.Color(0xfbbf24), new THREE.Color(0xf97316),
      new THREE.Color(0xfb7185), new THREE.Color(0xffd700),
      new THREE.Color(0x34d399), new THREE.Color(0x8b5cf6),
      new THREE.Color(0x38bdf8), new THREE.Color(0xe879f9),
    ]

    nodes.forEach((node, index) => {
      const wasLocked = index >= 3 // 之前是锁定的
      const nowLocked = isNodeLocked(index)

      if (wasLocked && !nowLocked) {
        // 解锁节点
        const color = nodeColors[index % nodeColors.length]
        const position = spiralCurve.getPointAt(node.curvePosition)

        // 更新球体材质
        const mesh = nodeMeshes[index]
        if (mesh) {
          const mat = mesh.material as THREE.MeshStandardMaterial
          mat.color.copy(color)
          mat.emissive.copy(color)
          mat.emissiveIntensity = 0.8
          mat.roughness = 0.2
          mat.transparent = false
          mat.opacity = 1.0
          mesh.userData.locked = false
        }

        // 移除锁定环
        if (nodeRings[index]) {
          scene.remove(nodeRings[index])
          nodeRings[index].geometry.dispose()
          ;(nodeRings[index].material as THREE.Material).dispose()
          nodeRings[index] = null as any
        }

        // 移除锁图标
        if (nodeLockSprites[index]) {
          scene.remove(nodeLockSprites[index])
          nodeLockSprites[index].material.dispose()
          ;(nodeLockSprites[index].material as THREE.SpriteMaterial).map?.dispose()
          nodeLockSprites[index] = null as any
        }

        // 添加发光光晕
        const glowGeo = new THREE.SphereGeometry(0.7, 32, 32)
        const glowMat = new THREE.ShaderMaterial({
          uniforms: {
            uColor: { value: color },
            uTime: { value: 0 }, uIndex: { value: index },
          },
          vertexShader: `
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 uColor;
            uniform float uTime;
            uniform float uIndex;
            varying vec3 vNormal;
            void main() {
              float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
              float pulse = sin(uTime * 3.0 + uIndex * 1.5) * 0.2 + 0.8;
              gl_FragColor = vec4(uColor, intensity * pulse * 0.6);
            }
          `,
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
        })
        const glowSphere = new THREE.Mesh(glowGeo, glowMat)
        glowSphere.position.copy(position)
        scene.add(glowSphere)
        nodeGlows[index] = glowSphere

        // 更新点光源
        if (nodeLights[index]) {
          nodeLights[index].color.copy(color)
          nodeLights[index].intensity = 2
          nodeLights[index].distance = 15
        }

        // 更新年份标签
        if (nodeYearSprites[index]) {
          scene.remove(nodeYearSprites[index])
          nodeYearSprites[index].material.dispose()
          ;(nodeYearSprites[index].material as THREE.SpriteMaterial).map?.dispose()
        }
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 64
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = 'transparent'
        ctx.fillRect(0, 0, 256, 64)
        ctx.font = 'bold 36px "Noto Sans SC", sans-serif'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(node.year), 128, 32)
        const texture = new THREE.CanvasTexture(canvas)
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
        const sprite = new THREE.Sprite(spriteMat)
        sprite.position.copy(position.clone().add(new THREE.Vector3(0, 1.2, 0)))
        sprite.scale.set(2.5, 0.6, 1)
        scene.add(sprite)
        nodeYearSprites[index] = sprite
      }
    })
  }

  function createAmbientLight() {
    scene.add(new THREE.AmbientLight(0x1a1a3e, 0.5))
    const directional = new THREE.DirectionalLight(0x4466aa, 0.3)
    directional.position.set(10, 20, 10)
    scene.add(directional)
  }

  // ========== 摄像机动画 ==========
  function moveCameraToNode(index: number) {
    if (index < 0 || index >= nodes.length) return

    // 检查节点是否锁定
    if (isNodeLocked(index)) {
      onPaywallRequired('node')
      return
    }

    // 手动操作时暂停自动播放
    pauseAutoPlay()
    isAnimating = true
    currentNodeIndex = index
    const targetT = nodes[index].curvePosition
    const targetPosition = spiralCurve.getPointAt(targetT)
    const cameraTarget = targetPosition.clone().add(CAMERA_OFFSET)

    const distance = Math.abs(targetT - cameraProgress)
    const duration = Math.max(1.0, Math.min(2.5, distance * 5))

    gsap.to(camera.position, {
      x: cameraTarget.x, y: cameraTarget.y, z: cameraTarget.z,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => { camera.lookAt(targetPosition) },
      onComplete: () => {
        isAnimating = false
        cameraProgress = targetT
      },
    })

    onNodeChange(index)
  }

  // ========== 滚轮惯性控制 ==========
  function onWheel(event: WheelEvent) {
    event.preventDefault()

    // 手动滚动时暂停自动播放
    if (isAutoPlaying) {
      pauseAutoPlay()
      autoPlayProgress = cameraProgress
    }

    const now = performance.now()
    const deltaTime = now - lastWheelTime
    lastWheelTime = now

    const rawDelta = event.deltaY * SCROLL_SENSITIVITY
    const clampedDelta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), SCROLL_MAX_VELOCITY)

    if (deltaTime < 100) {
      wheelAccumulator += clampedDelta
      scrollVelocity = wheelAccumulator * 0.3
    } else {
      wheelAccumulator = clampedDelta
      scrollVelocity = clampedDelta
    }

    scrollVelocity = Math.sign(scrollVelocity) * Math.min(Math.abs(scrollVelocity), SCROLL_MAX_VELOCITY)

    if (scrollTween) scrollTween.kill()
    startInertialScroll()
  }

  function startInertialScroll() {
    if (isAnimating) return

    const targetProgress = Math.max(0, Math.min(1, cameraProgress + scrollVelocity))

    if (Math.abs(scrollVelocity) < SCROLL_THRESHOLD) {
      snapToNearestNode()
      return
    }

    const distance = Math.abs(targetProgress - cameraProgress)
    const duration = Math.max(0.15, Math.min(0.8, distance * 8))

    scrollTween = gsap.to(
      { progress: cameraProgress },
      {
        progress: targetProgress, duration, ease: 'power1.out',
        onUpdate: function () {
          cameraProgress = this.targets()[0].progress
          updateCameraFromProgress()
        },
        onComplete: () => {
          scrollVelocity *= SCROLL_DECAY
          wheelAccumulator *= SCROLL_DECAY
          if (Math.abs(scrollVelocity) > SCROLL_THRESHOLD) {
            startInertialScroll()
          } else {
            snapToNearestNode()
          }
        },
      },
    )
  }

  function snapToNearestNode() {
    let closestIndex = 0
    let closestDist = Infinity
    nodes.forEach((node, i) => {
      const dist = Math.abs(node.curvePosition - cameraProgress)
      if (dist < closestDist) { closestDist = dist; closestIndex = i }
    })

    if (closestDist < 0.08) {
      const snapT = nodes[closestIndex].curvePosition
      if (Math.abs(snapT - cameraProgress) > 0.001) {
        gsap.to({ progress: cameraProgress }, {
          progress: snapT, duration: 0.4, ease: 'power2.out',
          onUpdate: function () {
            cameraProgress = this.targets()[0].progress
            updateCameraFromProgress()
          },
          onComplete: () => { cameraProgress = snapT },
        })
      }
      if (closestIndex !== currentNodeIndex) {
        currentNodeIndex = closestIndex
        onNodeChange(closestIndex)
      }
    }
  }

  function updateCameraFromProgress() {
    const position = spiralCurve.getPointAt(cameraProgress)

    let closestIndex = 0
    let closestDist = Infinity
    nodes.forEach((node, i) => {
      const dist = Math.abs(node.curvePosition - cameraProgress)
      if (dist < closestDist) { closestDist = dist; closestIndex = i }
    })

    if (closestIndex !== currentNodeIndex && closestDist < 0.06) {
      currentNodeIndex = closestIndex
      onNodeChange(closestIndex)
    }

    const cameraTarget = position.clone().add(CAMERA_OFFSET)
    camera.position.set(cameraTarget.x, cameraTarget.y, cameraTarget.z)
    camera.lookAt(position)
  }

  // ========== 交互事件 ==========
  function onCanvasClick(event: MouseEvent) {
    const rect = renderer.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(nodeMeshes)

    if (intersects.length > 0) {
      const nodeIndex = intersects[0].object.userData.nodeIndex as number
      if (nodeIndex !== undefined) {
        if (isNodeLocked(nodeIndex)) {
          onPaywallRequired('node')
        } else {
          moveCameraToNode(nodeIndex)
        }
      }
    }
  }

  let touchStartY = 0
  function onTouchStart(event: TouchEvent) {
    touchStartY = event.touches[0].clientY
    if (isAutoPlaying) {
      pauseAutoPlay()
      autoPlayProgress = cameraProgress
    }
  }

  function onTouchMove(event: TouchEvent) {
    event.preventDefault()
    const deltaY = touchStartY - event.touches[0].clientY
    touchStartY = event.touches[0].clientY
    cameraProgress = Math.max(0, Math.min(1, cameraProgress + deltaY * 0.001))
    updateCameraFromProgress()
  }

  function onResize() {
    if (!container.value) return
    camera.aspect = container.value.clientWidth / container.value.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  }

  // ========== 动画循环 ==========
  let lastFrameTime = 0
  function animate() {
    animationId = requestAnimationFrame(animate)

    const time = performance.now() * 0.001
    const delta = Math.min(time - lastFrameTime, 0.1)
    lastFrameTime = time

    // 自动播放更新
    updateAutoPlay(delta)

    // 更新星空闪烁
    if (starField) {
      ;(starField.material as THREE.ShaderMaterial).uniforms.uTime.value = time
    }

    // 更新着色器时间
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
        if (child.material.uniforms.uTime) child.material.uniforms.uTime.value = time
      }
    })

    // 节点脉冲
    nodeMeshes.forEach((mesh, i) => {
      mesh.scale.setScalar(1 + Math.sin(time * 2 + i * 1.2) * 0.1)
    })

    // 节点光源脉冲（锁定节点保持暗淡）
    nodeLights.forEach((light, i) => {
      if (isNodeLocked(i)) {
        light.intensity = 0.3 + Math.sin(time * 3 + i * 1.5) * 0.1
      } else {
        light.intensity = 2 + Math.sin(time * 3 + i * 1.5) * 0.8
      }
    })

    if (starField) starField.rotation.y = time * 0.01

    renderer.render(scene, camera)
  }

  // ========== 截图导出 ==========
  function exportScreenshot() {
    const originalPixelRatio = renderer.getPixelRatio()
    renderer.setPixelRatio(originalPixelRatio * 2)
    renderer.setSize(container.value!.clientWidth, container.value!.clientHeight)
    renderer.render(scene, camera)

    const dataUrl = renderer.domElement.toDataURL('image/png', 1.0)
    renderer.setPixelRatio(originalPixelRatio)
    renderer.setSize(container.value!.clientWidth, container.value!.clientHeight)

    // 免费版加水印（异步等待图片加载）
    if (isFree.value) {
      addWatermarkAsync(dataUrl).then((watermarkedUrl) => {
        downloadImage(watermarkedUrl)
      })
    } else {
      downloadImage(dataUrl)
    }
  }

  function downloadImage(dataUrl: string) {
    const link = document.createElement('a')
    link.download = `生命星轨_${new Date().toLocaleString('zh-CN').replace(/[/: ]/g, '-')}.png`
    link.href = dataUrl
    link.click()
  }

  function addWatermarkAsync(dataUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!

        ctx.drawImage(img, 0, 0)

        // 半透明水印条
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
        ctx.fillRect(0, canvas.height - 60, canvas.width, 60)

        // 水印文字
        ctx.font = `bold ${Math.round(canvas.width * 0.018)}px "Noto Sans SC", sans-serif`
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('生命星轨 · 免费版', canvas.width / 2, canvas.height - 35)

        // 小字
        ctx.font = `${Math.round(canvas.width * 0.01)}px "Noto Sans SC", sans-serif`
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.fillText('升级完整版去除水印 → starorbit.app', canvas.width / 2, canvas.height - 14)

        resolve(canvas.toDataURL('image/png', 1.0))
      }
      img.src = dataUrl
    })
  }

  // ========== 视频录制导出 ==========
  function startVideoExport() {
    if (isRecording) return

    // 免费版不能导出视频
    if (!canExportVideo()) {
      onPaywallRequired('export-video')
      return
    }

    isRecording = true
    isExportingVideo.value = true
    exportProgress.value = 0
    recordedChunks = []

    // 创建离屏渲染器 - 纯净录制，分辨率 1080p
    const exportWidth = 1920
    const exportHeight = 1080

    offscreenRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    })
    offscreenRenderer.setSize(exportWidth, exportHeight)
    offscreenRenderer.setPixelRatio(1)
    offscreenRenderer.toneMapping = THREE.ACESFilmicToneMapping
    offscreenRenderer.toneMappingExposure = 1.2

    // 离屏摄像机（复制主摄像机参数，适配新宽高比）
    offscreenCamera = new THREE.PerspectiveCamera(60, exportWidth / exportHeight, 0.1, 1000)

    // 从头开始自动播放并录制
    cameraProgress = 0
    autoPlayProgress = 0
    currentNodeIndex = 0
    isAutoPlaying = true
    autoPlayPaused = false
    isPlaying.value = true
    onNodeChange(0)

    // 获取离屏 canvas 流，30fps
    const stream = offscreenRenderer.domElement.captureStream(30)

    // 格式兼容性检测（按优先级）
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4;codecs=h264',
      'video/mp4',
    ]
    let selectedMime = ''
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime
        break
      }
    }

    if (!selectedMime) {
      cleanupRecording()
      alert('您的浏览器不支持视频录制，请使用 Chrome 或 Edge 浏览器')
      return
    }

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: selectedMime,
      videoBitsPerSecond: 16000000, // 16Mbps 高码率
    })

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data)
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: selectedMime })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm'
      link.download = `生命星轨_${new Date().toLocaleString('zh-CN').replace(/[/: ]/g, '-')}.${ext}`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)

      cleanupRecording()
    }

    // 每 100ms 请求一次数据，减少丢帧
    mediaRecorder.start(100)

    // 离屏渲染循环：同步主摄像机位置到离屏摄像机
    function renderOffscreen() {
      if (!isRecording || !offscreenRenderer || !offscreenCamera) return

      // 同步摄像机
      offscreenCamera.position.copy(camera.position)
      offscreenCamera.quaternion.copy(camera.quaternion)
      offscreenCamera.aspect = 1920 / 1080
      offscreenCamera.updateProjectionMatrix()

      offscreenRenderer.render(scene, offscreenCamera)

      // 更新进度
      exportProgress.value = Math.round(autoPlayProgress * 100)

      if (isRecording) {
        requestAnimationFrame(renderOffscreen)
      }
    }
    requestAnimationFrame(renderOffscreen)

    // 播放完毕后自动停止录制
    recordingCheckInterval = window.setInterval(() => {
      if (!isAutoPlaying && autoPlayProgress >= 0.99) {
        if (recordingCheckInterval) clearInterval(recordingCheckInterval)
        // 多等2秒让最后画面停留
        setTimeout(() => {
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop()
          }
        }, 2500)
      }
    }, 300)
  }

  function cleanupRecording() {
    isRecording = false
    isExportingVideo.value = false
    exportProgress.value = 0

    if (recordingCheckInterval) {
      clearInterval(recordingCheckInterval)
      recordingCheckInterval = null
    }

    if (offscreenRenderer) {
      offscreenRenderer.dispose()
      offscreenRenderer = null
    }
    offscreenCamera = null
  }

  // ========== 公共方法 ==========
  function goToNode(index: number) { moveCameraToNode(index) }
  function nextNode() {
    if (currentNodeIndex < nodes.length - 1) moveCameraToNode(currentNodeIndex + 1)
  }
  function prevNode() {
    if (currentNodeIndex > 0) moveCameraToNode(currentNodeIndex - 1)
  }
  function replay() {
    cameraProgress = 0
    autoPlayProgress = 0
    currentNodeIndex = 0
    startAutoPlay()
    onNodeChange(0)
  }

  // ========== 清理 ==========
  function dispose() {
    window.removeEventListener('resize', onResize)
    if (renderer) {
      renderer.domElement.removeEventListener('click', onCanvasClick)
      renderer.domElement.removeEventListener('wheel', onWheel)
      renderer.domElement.removeEventListener('touchstart', onTouchStart)
      renderer.domElement.removeEventListener('touchmove', onTouchMove)
    }
    if (scrollTween) scrollTween.kill()
    if (autoPlayWaitTimer) clearTimeout(autoPlayWaitTimer)
    if (recordingCheckInterval) clearInterval(recordingCheckInterval)
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop()
    if (offscreenRenderer) { offscreenRenderer.dispose(); offscreenRenderer = null }
    cancelAnimationFrame(animationId)

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Points || child instanceof THREE.Sprite) {
        child.geometry.dispose()
        if (child.material instanceof THREE.Material) child.material.dispose()
      }
    })

    if (renderer) {
      renderer.dispose()
      if (container.value && renderer.domElement.parentNode === container.value) {
        container.value.removeChild(renderer.domElement)
      }
    }
  }

  return {
    isLoading,
    isPlaying,
    isExportingVideo,
    exportProgress,
    init,
    dispose,
    goToNode,
    nextNode,
    prevNode,
    replay,
    toggleAutoPlay,
    exportScreenshot,
    startVideoExport,
    currentNodeIndex: () => currentNodeIndex,
  }
}
