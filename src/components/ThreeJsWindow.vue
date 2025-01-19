<template>
  <div ref="container" class="three-container">
    <!-- Button to start the audio context -->
    <button @click="initializeAudioContext">Start Audio</button>
  </div>
</template>

<script>
import * as THREE from 'three';
import CameraControl from './CameraControl';
import PhysicsWorld from './physicsWorld';
import RigidBody from './RigidBody';
import Ammo from 'ammojs-typed';
import ObjectFile from './objectFile';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { Howl } from 'howler';

export default {
  name: "BuckyBall",
  mounted() {
    this.initThree();
  },
  data() {
    return {
      audioContext: null, // Initialize AudioContext reference
    };
  },
  methods: {
    // Initialize AudioContext after a user gesture (click)
    initializeAudioContext() {
      if (!this.audioContext) {
        // Create the AudioContext only after the user clicks
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('AudioContext created after user gesture.');
      }

      // Resume AudioContext if it is suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log('AudioContext resumed.');
        });
      }

      // Initialize and play sound using Howler.js
      if (this.audioContext.state === 'running') {
        this.collisionSound.play();
      }
    },

    async initThree() {
      document.body.style.cursor = 'none';
      this.clock = new THREE.Clock();
      this.AmmoInstance = await Ammo();
      const collisionConfiguration = new this.AmmoInstance.btDefaultCollisionConfiguration();
      console.log(collisionConfiguration);
      this.physicsWorld = new PhysicsWorld(this.AmmoInstance);
      this.physicsWorld.init(this.AmmoInstance).then(() => {
        this.keys = {}; // Track pressed keys

        window.addEventListener("keydown", (event) => {
          this.keys[event.key] = true;
        });

        window.addEventListener("keyup", (event) => {
          this.keys[event.key] = false;
        });

        this.animate = this.animate.bind(this);
        this.scene = new THREE.Scene();
        var color2 = 0x764C1B;
        var color3 = 0xFF8215;
        this.scene.background = new THREE.Color(color3);
        const objLoader = new OBJLoader();

        const letterPaths = [
          '/letters/j/tinker.obj',
          '/letters/o/tinker.obj',
          '/letters/n/tinker.obj',
          '/letters/i/tinker.obj'
        ];

        // Loop through each letter path
        for (let i = 0; i < letterPaths.length; i++) {
          objLoader.load(letterPaths[i], (root) => {
            const scale = 0.1; // Your desired scale

            // Create ObjectFile after the object has been loaded
            const letter = new ObjectFile(root, this.AmmoInstance, this.scene, scale, new THREE.Vector3(-3 + i * 3, 10, 1));

            // Log the letter and add its rigid body to the physics world
            console.log(letter);
            this.physicsWorld.addRigidBody(letter.RigidBody, letter.root);
          });
        }

        // Set up sound that plays on collision
        this.collisionSound = new Howl({
          src: ['/audio/collision.mp3'],
          volume: 0.5,
        });

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
          75,
          this.$refs.container.clientWidth / this.$refs.container.clientHeight,
          0.1,
          1000
        );

        this.camera.position.z = 5;
        this.camera.position.y = 2.5;

        const cameraGeometry = new THREE.BoxGeometry(1, 2.3, 1);
        const cameraMaterial = new THREE.MeshStandardMaterial({
          color: color2,
          metalness: 0.1,
          roughness: 0.9,
          wireframe: false
        });
        this.cameraMesh = new THREE.Mesh(cameraGeometry, cameraMaterial);

        this.cameraMesh.position.set(0, 1.5, 5);
        this.cameraMesh.receiveShadow = false;
        this.cameraMesh.castShadow = true;
        this.scene.add(this.cameraMesh);

        const rbCamera = new RigidBody(this.AmmoInstance, 10, this.cameraMesh.position, this.cameraMesh.quaternion, new THREE.Vector3(1, 2.3, 1));
        this.physicsWorld.addRigidBody(rbCamera, this.cameraMesh);

        this.cameraControl = new CameraControl(this.AmmoInstance, this.camera, rbCamera);
        this.cameraControl.setupControls();

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({});
        this.renderer.shadowMap.enabled = true;
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.setSize(
          this.$refs.container.clientWidth,
          this.$refs.container.clientHeight
        );
        this.$refs.container.appendChild(this.renderer.domElement);

        // Add lighting
        const light1 = new THREE.DirectionalLight(0x00ffff, 10);
        light1.position.set(5, 20, 25);
        light1.castShadow = true;
        this.scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xffff00, 10);
        light2.position.set(-10, 20, -10);
        light2.castShadow = true;
        this.scene.add(light2);

        const ambientLight = new THREE.AmbientLight(0xE8E8E8, 1);
        this.scene.add(ambientLight);

        // Ground setup
        const groundGeometry = new THREE.BoxGeometry(100, 1, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
          color: color2,
          metalness: 0.1,
          roughness: 1,
          wireframe: false
        });

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.name = "ground";

        ground.position.set(0, 0, 0);
        ground.receiveShadow = true;
        ground.castShadow = false;
        this.scene.add(ground);

        const rbGround = new RigidBody(this.AmmoInstance, 0, ground.position, ground.quaternion, new THREE.Vector3(100, 1, 100));
        rbGround.userData = { name: "ground" };
        this.physicsWorld.addRigidBody(rbGround, ground);

        // Box setup
        const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        const boxMaterial = new THREE.MeshStandardMaterial({
          color: 0xff5733,
          metalness: 0.9,
          roughness: 0.2,
          wireframe: false
        });

        for (let c = 0; c < 3; c++) {
          for (let j = -3; j < 7; j++) {
            for (let i = 0; i < 3; i++) {
              const box = new THREE.Mesh(boxGeometry, boxMaterial);
              box.name = "wall_" + i;
              box.scale.set(1, 1, 1);
              box.position.set(j, 1 * i, c);
              box.receiveShadow = false;
              box.castShadow = true;
              this.scene.add(box);

              const rbbox = new RigidBody(this.AmmoInstance, 0.1, box.position, box.quaternion, new THREE.Vector3(1, 1, 1));
              this.physicsWorld.addRigidBody(rbbox, box);
            }
          }
        }

        this.offset = new THREE.Vector3(0, 2, 0);
        this.animate();
      });
    },

    animate(time) {
      const dispatcher = this.physicsWorld.physicsWorld_.getDispatcher();
      const numManifolds = dispatcher.getNumManifolds();

      for (let i = 0; i < numManifolds; i++) {
        const contactManifold = dispatcher.getManifoldByIndexInternal(i);
        const numContacts = contactManifold.getNumContacts();

        for (let j = 0; j < numContacts; j++) {
          const contactPoint = contactManifold.getContactPoint(j);
          const distance = contactPoint.getDistance();
          const body1 = contactManifold.getBody0();
          const body2 = contactManifold.getBody1();
          if (distance <= 0) {
            if (body1.userData && body1.userData.name === "ground" || 
              body2.userData) {
              this.collisionSound.play();
              break;
            }
          }
        }
      }

      const meshPosition = this.cameraMesh.position;
      this.camera.position.lerp(meshPosition.clone().add(this.offset), 0.4);
      const deltaTime = this.clock.getDelta();

      requestAnimationFrame(() => this.animate(time));

      // Movement controls
      this.cameraControl.updateCameraPosition(deltaTime);

      // Update physics
      this.physicsWorld.update();

      // Render the scene
      this.renderer.render(this.scene, this.camera);
    },
  },

  beforeUnmount() {
    if (this.renderer) {
      this.renderer.dispose();
    }
  },
};
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}
</style>
