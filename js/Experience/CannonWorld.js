import * as CANNON from 'cannon-es'
import * as THREE from 'three'

class CannonWorld {
  constructor(options) {
    this.scene = options.scene
    this.timeStep = 1 / 60

    this.init()
  }

  setWorld() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0),
    })
  }

  setObjects() {
    const boxGeo = new THREE.BoxGeometry(2, 2, 2)
    const boxMat = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    })
    this.boxMesh = new THREE.Mesh(boxGeo, boxMat)
    this.scene.add(this.boxMesh)

    const sphereGeo = new THREE.SphereGeometry(2)
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    })
    this.sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
    this.scene.add(this.sphereMesh)

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

    // Box body
    const boxPhysMat = new CANNON.Material()
    this.boxBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)), // half of the 3js box geometry
      position: new CANNON.Vec3(1, 20, 0), // initial position
      material: boxPhysMat,
    })
    this.world.addBody(this.boxBody)
    this.boxBody.angularVelocity.set(0, 10, 0) // rotation speed
    this.boxBody.angularDamping = 0.5

    // Ground + Box contact material
    const groundBoxContactMat = new CANNON.ContactMaterial(
      groundPhysMat,
      boxPhysMat,
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

  init() {
    this.setWorld()
    this.setObjects()
    this.setBody()
  }

  update() {
    this.world?.step(this.timeStep)

    this.groundMesh?.position.copy(this.groundBody.position)
    this.groundMesh?.quaternion.copy(this.groundBody.quaternion)

    this.boxMesh?.position.copy(this.boxBody.position)
    this.boxMesh?.quaternion.copy(this.boxBody.quaternion)

    this.sphereMesh?.position.copy(this.sphereBody.position)
    this.sphereMesh?.quaternion.copy(this.sphereBody.quaternion)
  }
}

export default CannonWorld
