import * as CANNON from 'cannon-es'
import * as THREE from 'three'

class CannonWorld2 {
  constructor(options) {
    this.scene = options.scene
    this.camera = options.camera

    this.timeStep = 1 / 60

    this.mouse = new THREE.Vector2()
    this.intersectionPoint = new THREE.Vector3()
    this.planeNormal = new THREE.Vector3()
    this.plane = new THREE.Plane()
    this.raycaster = new THREE.Raycaster()

    this.meshes = []
    this.bodies = []

    this.bind()
    this.init()
  }

  setWorld() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0),
    })
  }

  setObjects() {
    const groundGeo = new THREE.PlaneGeometry(10, 10)
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      wireframe: false,
    })
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat)
    this.groundMesh.receiveShadow = true
    this.scene.add(this.groundMesh)
  }

  setBody() {
    // Ground body
    this.groundPhysMat = new CANNON.Material()
    this.groundBody = new CANNON.Body({
      // new CANNON.Plane(), plane is infinite to make objects falling down you need a box shape
      // mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(5, 5, 0.001)),
      type: CANNON.Body.STATIC,
      material: this.groundPhysMat,
    })
    this.groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    this.world.addBody(this.groundBody)
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
      color: Math.random() * 0xffffff,
      metalness: 0.05,
      roughness: 0,
    })
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
    sphereMesh.castShadow = true
    this.scene.add(sphereMesh)
    sphereMesh.position.copy(this.intersectionPoint)

    const point = this.intersectionPoint
    const spherePhysMat = new CANNON.Material()
    const sphereBody = new CANNON.Body({
      mass: 0.3,
      shape: new CANNON.Sphere(0.125), // same as sphere geometry
      position: new CANNON.Vec3(point.x, point.y, point.z),
      material: spherePhysMat,
    })
    this.world.addBody(sphereBody)

    this.meshes.push(sphereMesh)
    this.bodies.push(sphereBody)

    const planeSphereContactMat = new CANNON.ContactMaterial(
      this.groundPhysMat,
      spherePhysMat,
      {
        restitution: 0.5,
      }
    )
    this.world.addContactMaterial(planeSphereContactMat)
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

    for (let index = 0; index < this.meshes.length; index++) {
      this.meshes[index].position.copy(this.bodies[index].position)
      this.meshes[index].quaternion.copy(this.bodies[index].quaternion)
    }

    // this.sphereMesh?.position.copy(this.sphereBody.position)
    // this.sphereMesh?.quaternion.copy(this.sphereBody.quaternion)
  }
}

export default CannonWorld2
