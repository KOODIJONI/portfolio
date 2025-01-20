<template>
  <div ref="container" class="three-container">

      </div>
      <div id="gradient-overlay">
        <div></div>
        <v-container>
    <h1 class="elegant-header">JONI MÄYRÄ</h1>
  </v-container>
      <v-btn
      variant="outlined"
      color="#ff9e0d"
      @click="handleClick"
      class="three-btn"
      
    >
      Tutustu
    </v-btn>
    </div>

</template>

<script>
import LoadLogoBoxes from './loadLogoBoxes'
import CameraSetup from './camera';
import LightSetup from './lights';
import LetterLoader from './letterLoader.js';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { throttle } from 'lodash-es';
import AudioContextManager from './audioContext';
import CameraControl from './CameraControl';
import PhysicsWorld from './physicsWorld';
import RigidBody from './RigidBody';
import Ammo from 'ammojs-typed';
import ObjectFile from './objectFile';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { Vector3 } from 'three';

export default {
  name: "threeWindow",
  data() {
    return {
      audioContext: null,
      isInitialized: false,
    };
  },
  mounted() {
    this.initThree();
  },
  methods: {
    handleClick() {
      if (!this.isInitialized) {
      this.AudioContextManager.initializeAudioContext(this.camera);
      this.cameraControl = new CameraControl(this.AmmoInstance, this.camera, this.rbCamera,this.scene, this.physicsWorld);
      this.cameraControl.setupControls();
      console.log("test");
      console.log(this.rbCamera, this.githubRB);
      const resizeUpdateInterval =500;
      this.setupContactPairResultCallback();
      window.addEventListener(
        
      
          'resize',
          throttle(
            () => {
              const width = window.innerWidth;
              const height = window.innerHeight;
              this.camera.aspect = width / height;
              this.camera.updateProjectionMatrix();
              this.renderer.setSize(width, height);
              this.setCanvasDimensions(this.renderer.domElement, width, height);
            },
            resizeUpdateInterval,
            { trailing: true }
          )
        );
      this.animate();
     
      document.querySelector("#gradient-overlay").classList.add("hidden");
      }
      this.isInitialized = true;
    },
    

    async initThree() {
      this.clock = new THREE.Clock();
      this.AmmoInstance = await Ammo();
      this.physicsWorld = new PhysicsWorld(this.AmmoInstance);
      await this.physicsWorld.init(this.AmmoInstance);
      this.AudioContextManager = new AudioContextManager();
      this.setupEventListeners();
      this.setupScene();
      this.setupRenderer();
      this.setupCamera();
      this.setupLights();
      this.setupGround();
      this.loadLetters();
      this.loadImages();
      this.loadTrees();
      this.setupText();
      this.setup();

      
    },

    setupEventListeners() {
      this.keys = {};
      window.addEventListener("keydown", (event) => {
        this.keys[event.key] = true;
      });
      window.addEventListener("keyup", (event) => {
        this.keys[event.key] = false;
      });
    },

    setupScene() {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xFF8215); // Set background color
      this.offset = new THREE.Vector3(0, 2, 0);
    },

    setupCamera() {
      const camera = new CameraSetup(this.AmmoInstance, this.physicsWorld,this.scene);
      camera.setupCamera();
      this.camera = camera.camera;
      this.rbCamera = camera.rbCamera;   
      this.cameraMesh = camera.cameraMesh;
    },

    setupRenderer() {
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setClearColor(0x000000, 1);
      this.renderer.setSize(
        this.$refs.container.clientWidth,
        this.$refs.container.clientHeight
      );
      this.$refs.container.appendChild(this.renderer.domElement);
    },
    loadLetters() {
      console.log(this.AmmoInstance);
      const letterLoad = new LetterLoader(this.scene, this.AmmoInstance, this.physicsWorld);
      letterLoad.loadLetters();

    },
    setupText() {
  const loader = new FontLoader();
  
  // Load the font from the URL
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    
    // Create text geometry
    const textGeometry = new TextGeometry('Ohjelmistokehittaja', {
      font: font,
      size: 1,
      height: 0.2,
      curveSegments: 12, // Optional, increases curve segments for smoother text
    });

    // Create a material for the text mesh
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });

    // Create the mesh with the geometry and material
    const textMesh = new THREE.Mesh(textGeometry, material);
    
    // Position the text
    textMesh.position.set(-6, 5, -10); // Adjust position based on your scene

    // Add the text mesh to the scene
    this.scene.add(textMesh);
  });
}
,
    setupLights() {
      const lights = new LightSetup(this.scene);
      lights.setupLights();
    },

    setupGround() {
      const groundGeometry = new THREE.BoxGeometry(100, 1, 100);
      const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x764C1B,
        metalness: 0.1,
        roughness: 1,
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.position.set(0, 0, 0);
      ground.receiveShadow = true;
      this.scene.add(ground);

      const rbGround = new RigidBody(
        this.AmmoInstance,
        0,
        ground.position,
        ground.quaternion,
        new THREE.Vector3(100, 1, 100)
      );
      rbGround.userData = { name: "ground" };
      this.physicsWorld.addRigidBody(rbGround, ground);
    },

    setCanvasDimensions(
          canvas,
          width,
          height,
          set2dTransform = false
        ) {
          const ratio = window.devicePixelRatio;
          if(this.canvas){
         this.canvas.width = width * ratio;
         this.canvas.height = height * ratio;
         this.canvas.style.width = `${width}px`;
         this.canvas.style.height = `${height}px`;
         
          if (set2dTransform) {
           this.canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
          }
        }
        },
    loadTrees() {
      const objLoader = new OBJLoader();
      const treePaths = [
        '/trees/tree1.obj',
        '/trees/tree2.obj',
        '/trees/tree1.obj',
        '/trees/tree2.obj',
        '/trees/tree1.obj',
        
        
      ];
      const treeCoordinates = [
        new THREE.Vector3(30,-5,30),
        new THREE.Vector3(-30,-5,40),
        new THREE.Vector3(20,-5,-10),
        new THREE.Vector3(0,-5,10),
        new THREE.Vector3(-10,-5,-1),
        new THREE.Vector3(10,-5,10),
      ];
      const tree1HitboxOffset= new THREE.Vector3(-12,10,10.4);
      const tree2HitboxOffset=new THREE.Vector3(-6.1,10,4.7);
      const hitboxCoordinates = [
            tree1HitboxOffset,
            tree2HitboxOffset,
            tree1HitboxOffset,
            tree2HitboxOffset,
            tree1HitboxOffset,
            tree2HitboxOffset 
      ];
      
      for (let i = 0; i < treePaths.length; i++) {
        
        objLoader.load(treePaths[i], (root) => {
          const boxMaterial = new THREE.ShadowMaterial({ color: 0x0000ff });
              const boxGeometry = new THREE.BoxGeometry(0.8,15,0.8);
          root.traverse((child) => {
          if (child.isMesh) {
            
            child.material = new THREE.MeshStandardMaterial({ color: 0x000000 });
            child.scale.set(); 
            this.scene.add(child);

            
          }
          if (child.isObject3D) {
            
            
            child.scale.set(10, 10, 10);
            child.position.set(treeCoordinates[i].x,treeCoordinates[i].y,treeCoordinates[i].z);
            
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            
            const worldPosition = new THREE.Vector3();
            child.castShadow = true;
            child.getWorldPosition(worldPosition);
            console.log("World Position of the mesh:", worldPosition.x, worldPosition.y, worldPosition.z);


            box.position.set(worldPosition.x+hitboxCoordinates[i].x, worldPosition.y+hitboxCoordinates[i].y, worldPosition.z+hitboxCoordinates[i].z);
            box.castShadow = true;
            box.receiveShadow = false;
            this.scene.add(box);

            const rbBox = new RigidBody(
              this.AmmoInstance,
              0,
              box.position,
              box.quaternion,
              new THREE.Vector3(1,15,1)

            );
            this.physicsWorld.addRigidBody(rbBox, box);
              }
              
              
          
        });
      
        
        },
  undefined,
  (error) => {
    console.error(`Error loading tree at ${treePaths[i]}:`, error);
  });
      }

    },

    loadTextures() {
  return new Promise((resolve, reject) => {
    const textureLoader = new THREE.TextureLoader();
    const texturePaths = [
  'images/bash-original.svg',
  'images/cplusplus-line.svg',
  'images/css3-original.svg',
  'images/html5-original.svg',
  'images/javascript-original.svg',
  'images/react-original.svg',
  'images/nodejs-plain.svg',
  'images/python-original.svg',
  'images/docker-original.svg',
  'images/github-original.svg',  // Added github-original.svg
  'images/mysql-original-wordmark.svg', // Added mysql-original-wordmark.svg
  'images/php-original.svg',   // Added php-original.svg
  'images/visualstudio-plain.svg', // Added visualstudio-plain.svg
  
];
    const textures = [];
    let loadedTextures = 0;

    texturePaths.forEach((path, index) => {
      textureLoader.load(
        path, 
        (texture) => {
          textures[index] = texture;
          loadedTextures++;
          console.log(`Texture ${path} loaded.`);
          console.log(`Loaded ${loadedTextures} of ${texturePaths.length}`);
          
          if (loadedTextures === texturePaths.length) {
            resolve(textures); // Resolve the promise once all textures are loaded
          }
        },
        undefined,  // On progress callback (optional)
        (error) => {
          reject(`Failed to load texture: ${path}` + error); // Reject the promise if any texture fails
        }
      );
    });
  });
}
,
async setup() {
  const logoBoxes = new LoadLogoBoxes(this.scene, this.AmmoInstance, this.physicsWorld);
  logoBoxes.setup()
},

setupBox(textures) {
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const materials = textures.map(texture => new THREE.MeshBasicMaterial({ map: texture }));

  let textureIndex = 0;

  for (let c = 0; c < 3; c++) {
    for (let j = 0; j < 3 - c; j++) {
      for (let i = 0; i < 3 - c; i++) {
        const box = new THREE.Mesh(boxGeometry, materials[textureIndex]);
        box.position.set(( + j * 1.1) + 0.55 * c, 1.4 * c, (+ i * 1.) + 0.55 * c);
       
        box.castShadow = true;  
        box.receiveShadow = true;
        this.scene.add(box);

        const rbBox = new RigidBody(
          this.AmmoInstance,
          1,
          box.position,
          box.quaternion,
          new THREE.Vector3(1, 1, 1)
        );
        this.physicsWorld.addRigidBody(rbBox, box);

        textureIndex = (textureIndex + 1) % textures.length;
      }
    }
  }
},
    addImage(path, size, pos, rotation){
    // Load the texture
    const map = new THREE.TextureLoader().load(path);

    // Create a material using the loaded texture
    const material = new THREE.SpriteMaterial({ map: map });

    // Create the sprite with the material
    const sprite = new THREE.Sprite(material);

    // Set the sprite's size, position, and rotation
    sprite.scale.set(size.x, size.y, size.z);
    sprite.position.set(pos.x, pos.y, pos.z);
    sprite.rotation.set(rotation.x, rotation.y, rotation.z);

    // Add the sprite to the scene
    this.scene.add(sprite);

    // Debugging: log the sprite object to the console
},

  loadImages(){
    const position = new THREE.Vector3(-30,5,-20);
      this.addImage('images/github.png', new THREE.Vector3(4,4,4),position,new Vector3(0,0,0));
      const cylinderGeometry =new THREE.CylinderGeometry( 3, 3, 0.5, 32 );
      const boxMaterial = new THREE.MeshStandardMaterial({
        color: 0xff5733,
        metalness: 0.9,
        roughness: 0.2,
      });
      const box = new THREE.Mesh(cylinderGeometry, boxMaterial);
      box.position.set(position.x,position.y-4,position.z);
      box.castShadow = true;
      box.receiveShadow = false;
      this.scene.add(box);

      this.githubRB = new RigidBody(
        this.AmmoInstance,
        0,
        box.position,
        box.quaternion,
        new THREE.Vector3(5, 0.5, 5)
      );
      this.githubRB.userData = { name: "github" };
      this.physicsWorld.addRigidBody(this.githubRB, box);
    
    },
    setupCollisions(){
      

      
      this.physicsWorld.physicsWorld_.contactPairTest(this.rbCamera, this.githubRB, {
      addSingleResult: function(cp, colObj0, partId0, index0, colObj1, partId1, index1) {
        console.log("Collision detected between camera and GitHub object!");
        
        // Access the contact point
        const contactPoint = this.AmmoInstance.wrapPointer(cp, this.AmmoInstance.btManifoldPoint);
        console.log("Contact point:", contactPoint.m_positionWorldOnB);
      }
});




    },
    setupContactPairResultCallback() {
    this.cbContactPairResult = new this.AmmoInstance.ConcreteContactResultCallback();
    this.cbContactPairResult.hasContact = false;

    this.cbContactPairResult.addSingleResult = (cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1) => {
        let contactPoint = this.AmmoInstance.wrapPointer(cp, this.AmmoInstance.btManifoldPoint);
        const distance = contactPoint.getDistance();

        // If distance > 0, return early (no collision)
        if (distance > 0) return;

        // Set hasContact to true if there is a collision
        this.cbContactPairResult.hasContact = true;
    };
},

openLinkCollision() {
    // Reset hasContact flag to false before testing
    this.cbContactPairResult.hasContact = false;

    // Perform contact pair test between the two rigid bodies
    this.physicsWorld.physicsWorld_.contactPairTest(this.rbCamera.body_, this.githubRB.body_, this.cbContactPairResult);

    // Check if there was contact
    if (!this.cbContactPairResult.hasContact) return;

    // If contact was detected, log the collision
    console.log('Collision detected');
},

    animate(time) {
      
      const dispatcher = this.physicsWorld.physicsWorld_.getDispatcher();
      const numManifolds = dispatcher.getNumManifolds();
      this.openLinkCollision();
      for (let i = 0; i < numManifolds; i++) {
        const contactManifold = dispatcher.getManifoldByIndexInternal(i);
        const numContacts = contactManifold.getNumContacts();

        let shouldBreak = false;
        for (let j = 0; j < numContacts; j++) {
          const contactPoint = contactManifold.getContactPoint(j);
          const distance = contactPoint.getDistance();
          const appliedImpulse = contactPoint.getAppliedImpulse();
          
          if (distance <= 0 && appliedImpulse > 10) {
          const collisionPoint = new THREE.Vector3(
          contactPoint.getPositionWorldOnB().x(),
          contactPoint.getPositionWorldOnB().y(),
          contactPoint.getPositionWorldOnB().z()
        );

        // Create PositionalAudio
        
        const collisionAudio = new THREE.PositionalAudio(this.camera.children[0]); // Use the AudioListener
        const audioLoader = new THREE.AudioLoader();

        // Load the sound buffer and play it
        audioLoader.load('/audio/collision.mp3', (buffer) => {
          collisionAudio.setBuffer(buffer);
          collisionAudio.setRefDistance(10); // How far the sound can be heard
          collisionAudio.setVolume(appliedImpulse * 0.001); // Scale volume by impulse
          collisionAudio.position.copy(collisionPoint); // Position the sound at the collision point
          this.scene.add(collisionAudio); // Add the audio to the scene
          collisionAudio.play();

          // Optional: Remove audio after it finishes playing
          collisionAudio.onEnded = () => {
            this.scene.remove(collisionAudio);
          };
        });
      
      }
    }

        if (shouldBreak) break;
      }

      this.camera.position.lerp(this.cameraMesh.position.clone().add(this.offset), 0.4);
      const deltaTime = this.clock.getDelta();
      requestAnimationFrame(() => this.animate(time));

      this.cameraControl.updateCameraPosition(deltaTime);
      this.physicsWorld.update();
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
.three-btn {
  position: relative;
  bottom: 20px; /* Adjust the distance from the bottom */
  left: 50%;
  width: 100px;
  transform: translateX(-50%);
  z-index: 11; 

}
#gradient-overlay {
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
 background-color: black;
  transition: opacity 2s ease, pointer-events 0s 2s; /* Fades out over 1 second */
}

#gradient-overlay.hidden {
  opacity: 0; /* Makes the div invisible */
  pointer-events: none; /* Disables interaction after fading */
}
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');

.elegant-header {
  font-family: 'Playfair Display', serif; /* Elegant, classic font */
  font-size: 3rem; /* Large header size */
  -webkit-transform:scale(1,3); /* Safari and Chrome */
    -moz-transform:scale(1,3); /* Firefox */
    -ms-transform:scale(1,3); /* IE 9 */
    -o-transform:scale(1,3); /* Opera */
    transform:scale(1,3);
    font-weight: bold;
  color: #ff9e0d; /* Sophisticated dark gray */
  text-align: center; /* Center align for elegance */
  margin: 20px 0;
  letter-spacing: 30px; /* Subtle spacing for readability */
  line-height: 1.2; /* Good line height for elegance */
  border-top: 0.1px solid #ff9e0d; /* Optional underline effect */
  border-bottom: 0.5px solid #ff9e0d; /* Optional underline effect */
  padding-bottom: 10px; /* Space between text and underline */
}
</style>
