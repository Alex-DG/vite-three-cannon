import * as CANNON from 'cannon-es'
import * as THREE from 'three'

/**
 * Lock Constraint
 */
class CannonWorld3 {
  constructor(options) {
    this.scene = options.scene
    this.camera = options.camera

    this.timeStep = 1 / 60

    const size = 0.5

    this.params = {
      size,
      space: size * 0.1,
      mass: 1,
      N: 10,
    }

    this.meshesArray = []
    this.bodiesArray = []

    this.bind()
    this.init()
  }

  setWorld() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0),
    })
  }

  setObjects() {
    const groundGeo = new THREE.PlaneGeometry(15, 15)
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      wireframe: false,
    })
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat)
    this.groundMesh.receiveShadow = true
    this.scene.add(this.groundMesh)

    const geo = new THREE.BoxBufferGeometry()
    const mat = new THREE.MeshPhongMaterial({ color: 0xffea00 })
    this.mesh = new THREE.Mesh(geo, mat)
  }

  setBody() {
    // Ground body
    this.groundPhysMat = new CANNON.Material()
    this.groundBody = new CANNON.Body({
      // new CANNON.Plane(), plane is infinite to make objects falling down you need a box shape
      // mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(7.5, 7.5, 0.001)),
      type: CANNON.Body.STATIC,
      material: this.groundPhysMat,
      position: new CANNON.Vec3(0, -0.6, 0),
    })
    this.groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    this.world.addBody(this.groundBody)

    /**
     * Boxes
     */
    const { size, N, mass, space } = this.params

    const shape = new CANNON.Box(new CANNON.Vec3(size, size, size))

    let previous
    for (let i = 0; i < N; i++) {
      const boxBody = new CANNON.Body({
        shape,
        mass,
        position: new CANNON.Vec3(
          -(N - i - N / 2) * (size * 2 + space * 2),
          7,
          0
        ),
      })
      this.world.addBody(boxBody)
      this.bodiesArray.push(boxBody)

      const mesh = this.mesh.clone()
      this.scene.add(mesh)
      this.meshesArray.push(mesh)

      // Lock constraint
      if (previous) {
        const lockContraint = new CANNON.LockConstraint(boxBody, previous)
        this.world.addConstraint(lockContraint)
      }

      previous = boxBody
    }

    /**
     * Tense boxes
     */
    const leftBody = new CANNON.Body({
      shape,
      mass: 0,
      position: new CANNON.Vec3(-(-N / 2 + 1) * (size * 2 + space * 2), 0, 0),
    })
    this.world.addBody(leftBody)
    this.bodiesArray.push(leftBody)

    const leftMesh = this.mesh.clone()
    this.scene.add(leftMesh)
    this.meshesArray.push(leftMesh)

    const rightBody = new CANNON.Body({
      shape,
      mass: 0,
      position: new CANNON.Vec3(-(N / 2) * (size * 2 + space * 2), 0, 0),
    })
    this.world.addBody(rightBody)
    this.bodiesArray.push(rightBody)

    const rightMesh = this.mesh.clone()
    this.scene.add(rightMesh)
    this.meshesArray.push(rightMesh)
  }

  bind() {}

  init() {
    this.setWorld()
    this.setObjects()
    this.setBody()
  }

  update() {
    this.world?.step(this.timeStep)

    this.groundMesh?.position.copy(this.groundBody.position)
    this.groundMesh?.quaternion.copy(this.groundBody.quaternion)

    for (let index = 0; index < this.meshesArray.length; index++) {
      this.meshesArray[index].position.copy(this.bodiesArray[index].position)
      this.meshesArray[index].quaternion.copy(
        this.bodiesArray[index].quaternion
      )
    }

    // this.sphereMesh?.position.copy(this.sphereBody.position)
    // this.sphereMesh?.quaternion.copy(this.sphereBody.quaternion)
  }
}

export default CannonWorld3
