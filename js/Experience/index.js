import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import CannonWorld from './CannonWorld'
import CannonWorld2 from './CannonWorld2'
import CannonWorld3 from './CannonWorld3'
import CannonWorld4 from './CannonWorld4'

class Experience {
  constructor(options) {
    this.scene = new THREE.Scene()
    this.container = options.domElement

    this.isReady = false

    this.init()
  }

  /**
   * Experience setup
   */
  init() {
    this.bind()
    this.setSizes()
    this.setRenderer()
    this.setCamera()

    this.setLight()
    this.setCannon()

    this.setResize()

    this.isReady = true

    this.update()
    console.log('🤖', 'Experience initialized')
  }

  bind() {
    this.resize = this.resize.bind(this)
    this.update = this.update.bind(this)
  }

  resize() {
    // Update sizes
    this.sizes.width = window.innerWidth
    this.sizes.height = window.innerHeight

    // Update camera
    this.camera.aspect = this.sizes.width / this.sizes.height
    this.camera.updateProjectionMatrix()

    // Update renderer
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  //////////////////////////////////////////////////////////////////////////////

  setSizes() {
    this.sizes = {
      width: this.container.offsetWidth,
      height: this.container.offsetHeight || window.innerHeight,
    }
  }

  setCamera() {
    // Base camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.sizes.width / this.sizes.height,
      0.1,
      1000
    )
    // this.camera.position.set(0, 20, -40)
    // this.camera.position.set(0, 5, -20)
    this.camera.position.set(6, 8, 14)
    this.scene.add(this.camera)

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.update()
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    this.renderer.shadowMap.enabled = true
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.container.appendChild(this.renderer.domElement)
  }

  setCube() {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshNormalMaterial()
    )
    this.scene.add(cube)
  }

  setLight() {
    const ambientLight = new THREE.AmbientLight(0x333333)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(0, 50, 0)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    this.scene.add(directionalLight)
  }

  setCannon() {
    this.cannon = new CannonWorld4({ scene: this.scene, camera: this.camera })
  }

  setResize() {
    window.addEventListener('resize', this.resize)
  }

  //////////////////////////////////////////////////////////////////////////////

  update() {
    this.cannon.update()

    // Render
    this.renderer.render(this.scene, this.camera)

    // Call update again on the next frame
    window.requestAnimationFrame(this.update)
  }
}

export default Experience
