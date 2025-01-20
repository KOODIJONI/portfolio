// Camera.js
import * as THREE from 'three';
import RigidBody from './RigidBody';

export default class CameraSetup {
  constructor(AmmoInstance, physicsWorld, scene) {
    this.AmmoInstance = AmmoInstance;
    this.physicsWorld = physicsWorld;
    this.scene = scene;
    this.camera = null;
    this.cameraMesh = null;
    this.rbCamera = null;
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2.5, 5);

    const cameraGeometry = new THREE.BoxGeometry(1, 2.3, 1);
    const cameraMaterial = new THREE.ShadowMaterial();
    this.cameraMesh = new THREE.Mesh(cameraGeometry, cameraMaterial);
    this.cameraMesh.position.set(0, 1.5, 5);
    this.cameraMesh.receiveShadow = false;
    this.cameraMesh.castShadow = true;
    this.scene.add(this.cameraMesh);

    this.rbCamera = new RigidBody(
      this.AmmoInstance,
      10,
      this.cameraMesh.position,
      this.cameraMesh.quaternion,
      
      new THREE.Vector3(1, 2.3, 1)
    );
    this.rbCamera.userData = "camera";
    this.physicsWorld.addRigidBody(this.rbCamera, this.cameraMesh);
  }
}
