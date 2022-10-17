import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import * as CANNON from 'cannon-es'

class Experience {
  constructor(options) {
    this.scene = new THREE.Scene()
    this.container = options.domElement

    this.timeStep = 1 / 60
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

    this.setWorld()
    this.setBox()
    this.setSphere()
    this.setGround()

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
    this.camera.position.set(0, 20, -50)
    this.scene.add(this.camera)

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    // this.controls.enableDamping = true
    this.controls.update()
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.container.appendChild(this.renderer.domElement)
  }

  setWorld() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0),
    })

    const slipperyMaterial = new CANNON.Material('slippery')

    // Ground body
    const groundPhysMat = new CANNON.Material()
    this.groundBody = new CANNON.Body({
      // new CANNON.Plane(), plane is infinite to make objects falling down you need a box shape
      // mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1)),
      type: CANNON.Body.STATIC,
      material: groundPhysMat,
    })
    this.groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    this.world.addBody(this.groundBody)

    // Box body
    const boxPhysMat = new CANNON.Material()
    this.boxBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)), // half of the 3js box geometry
      position: new CANNON.Vec3(1, 20, 0), // initial position
      material: slipperyMaterial,
    })
    this.world.addBody(this.boxBody)
    this.boxBody.angularVelocity.set(0, 10, 0) // rotation speed
    this.boxBody.angularDamping = 0.5

    // Ground + Box contact material
    const groundBoxContactMat = new CANNON.ContactMaterial(
      groundPhysMat,
      slipperyMaterial,
      { friction: 0.04 }
    )
    this.world.addContactMaterial(groundBoxContactMat)

    // Sphere body
    const spherePhysMat = new CANNON.Material()
    this.sphereBody = new CANNON.Body({
      mass: 4,
      shape: new CANNON.Sphere(2), // same as sphere geometry
      position: new CANNON.Vec3(0, 10, 0),
      material: spherePhysMat,
    })
    this.world.addBody(this.sphereBody)

    this.sphereBody.linearDamping = 0.21

    const groundSphereContactMat = new CANNON.ContactMaterial(
      groundPhysMat,
      spherePhysMat,
      { restitution: 1.0 }
    )

    this.world.addContactMaterial(groundSphereContactMat)
  }

  setCube() {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshNormalMaterial()
    )
    this.scene.add(cube)
  }

  setGround() {
    const groundGeo = new THREE.PlaneGeometry(30, 30)
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      wireframe: true,
    })
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat)
    this.scene.add(this.groundMesh)
  }

  setBox() {
    const boxGeo = new THREE.BoxGeometry(2, 2, 2)
    const boxMat = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    })
    this.boxMesh = new THREE.Mesh(boxGeo, boxMat)
    this.scene.add(this.boxMesh)
  }

  setSphere() {
    const sphereGeo = new THREE.SphereGeometry(2)
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    })
    this.sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
    this.scene.add(this.sphereMesh)
  }

  setResize() {
    window.addEventListener('resize', this.resize)
  }

  //////////////////////////////////////////////////////////////////////////////

  update() {
    if (!this.isReady) return null

    this.world?.step(this.timeStep)

    this.groundMesh?.position.copy(this.groundBody.position)
    this.groundMesh?.quaternion.copy(this.groundBody.quaternion)

    this.boxMesh?.position.copy(this.boxBody.position)
    this.boxMesh?.quaternion.copy(this.boxBody.quaternion)

    this.sphereMesh?.position.copy(this.sphereBody.position)
    this.sphereMesh?.quaternion.copy(this.sphereBody.quaternion)

    // Update controls
    // this.controls.update()

    // Render
    this.renderer.render(this.scene, this.camera)

    // Call update again on the next frame
    window.requestAnimationFrame(this.update)
  }
}

export default Experience
