import * as CANNON from 'cannon-es'
import * as THREE from 'three'

class CannonWorld2 {
  constructor(options) {
    this.scene = options.scene
    this.camera = options.camera
    this.timeStep = 1 / 60

    this.mouse = new THREE.Vector2()
    console.log({ mouse: this.mouse })
    this.intersectionPoint = new THREE.Vector3()
    this.planeNormal = new THREE.Vector3()
    this.plane = new THREE.Plane()
    this.raycaster = new THREE.Raycaster()

    this.bind()
    this.init()
  }

  setWorld() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0),
    })
  }

  setObjects() {
    const groundGeo = new THREE.PlaneGeometry(30, 30)
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      wireframe: true,
    })
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat)
    this.scene.add(this.groundMesh)
  }

  setBody() {
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

    // Sphere body
    // const spherePhysMat = new CANNON.Material()
    // this.sphereBody = new CANNON.Body({
    //   mass: 4,
    //   shape: new CANNON.Sphere(2), // same as sphere geometry
    //   position: new CANNON.Vec3(0, 10, 0),
    //   material: spherePhysMat,
    // })
    // this.world.addBody(this.sphereBody)

    // this.sphereBody.linearDamping = 0.21

    // const groundSphereContactMat = new CANNON.ContactMaterial(
    //   groundPhysMat,
    //   spherePhysMat,
    //   { restitution: 1.0 }
    // )

    // this.world.addContactMaterial(groundSphereContactMat)
  }

  onMouseMouse(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

    this.planeNormal.copy(this.camera.position).normalize()
    this.plane.setFromNormalAndCoplanarPoint(
      this.planeNormal,
      this.scene.position
    )
    this.raycaster.setFromCamera(this.mouse, this.camera)
    this.raycaster.ray.intersectPlane(this.plane, this.intersectionPoint)
  }

  onAddSphere() {
    const sphereGeo = new THREE.SphereGeometry(0.125, 30, 30)
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xffea00,
      metalness: 0.05,
      roughness: 0,
    })
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
    console.log('add', { sphere: sphereMesh })
    this.scene.add(sphereMesh)
    sphereMesh.position.copy(this.intersectionPoint)
  }

  bind() {
    this.onAddSphere = this.onAddSphere.bind(this)
    this.onMouseMouse = this.onMouseMouse.bind(this)
  }

  init() {
    this.setWorld()
    this.setObjects()
    this.setBody()

    window.addEventListener('click', this.onAddSphere)
    window.addEventListener('mousemove', this.onMouseMouse)
  }

  update() {
    this.world?.step(this.timeStep)

    this.groundMesh?.position.copy(this.groundBody.position)
    this.groundMesh?.quaternion.copy(this.groundBody.quaternion)

    // this.sphereMesh?.position.copy(this.sphereBody.position)
    // this.sphereMesh?.quaternion.copy(this.sphereBody.quaternion)
  }
}

export default CannonWorld2
