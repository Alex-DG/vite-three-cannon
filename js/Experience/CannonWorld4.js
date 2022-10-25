import * as CANNON from 'cannon-es'
import * as THREE from 'three'

/**
 * Lock Constraint
 */
class CannonWorld4 {
  constructor(options) {
    this.scene = options.scene
    this.camera = options.camera

    this.timeStep = 1 / 60

    this.params = {
      dist: 0.25,
      mass: 0.5,
      cols: 15,
      rows: 15,
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
    const particleGeo = new THREE.SphereBufferGeometry(0.1)
    const particleMat = new THREE.MeshPhongMaterial({ color: 0xffea00 })
    this.particleMesh = new THREE.Mesh(particleGeo, particleMat)

    const sphereGeo = new THREE.SphereGeometry(2, 50, 50)
    const sphereMat = new THREE.MeshPhongMaterial({ color: 0xa3a3a3 })
    this.sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
    this.scene.add(this.sphereMesh)
  }

  setBody() {
    // Particles
    const shape = new CANNON.Particle()
    let particles = {}

    const { cols, rows, dist, mass } = this.params

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const particleBody = new CANNON.Body({
          mass,
          shape,
          position: new CANNON.Vec3(
            -(i - cols * 0.5) * dist,
            4,
            (j - rows * 0.5) * dist
          ),
          // velocity: new CANNON.Vec3(0, 0, -0.1 * (rows - j)),
        })
        particles[`${i} ${j}`] = particleBody
        this.world.addBody(particleBody)
        this.bodiesArray.push(particleBody)

        const particleMesh = this.particleMesh.clone()
        this.scene.add(particleMesh)
        this.meshesArray.push(particleMesh)
      }
    }

    console.log({ particles })

    // Sphere
    const sphereBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Sphere(2),
    })
    this.world.addBody(sphereBody)
    this.bodiesArray.push(sphereBody)

    const connect = (i1, j1, i2, j2) => {
      this.world.addConstraint(
        new CANNON.DistanceConstraint(
          particles[`${i1} ${j1}`],
          particles[`${i2} ${j2}`],
          dist
        )
      )
    }

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (i < cols - 1) connect(i, j, i + 1, j)
        if (j < rows - 1) connect(i, j, i, j + 1)
      }
    }
  }

  bind() {}

  init() {
    this.setWorld()
    this.setObjects()
    this.setBody()
  }

  update() {
    this.world?.step(this.timeStep)

    for (let index = 0; index < this.meshesArray.length; index++) {
      this.meshesArray[index].position.copy(this.bodiesArray[index].position)
    }
  }
}

export default CannonWorld4
