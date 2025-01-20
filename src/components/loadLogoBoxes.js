import * as THREE from 'three'
import RigidBody from './RigidBody';
export default class LoadLogoBoxes {
    constructor(scene, AmmoInstance, physicsWorld) {
      this.scene = scene;
      this.AmmoInstance = AmmoInstance;
      this.physicsWorld = physicsWorld;
    }
  
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
  
    // Method to set up the textures and the box grid
    async setup() {
      try {
        const textures = await this.loadTextures();  // Wait for textures to load
        this.setupBox(textures);  // Once loaded, call setupBox
      } catch (error) {
        console.error('Error loading textures:', error);
      }
    }
  
    // Method to create boxes and assign textures
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
    }
  }
  