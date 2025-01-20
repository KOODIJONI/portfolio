import * as THREE from 'three'
import ObjectFile from './objectFile';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
export default class LetterLoader {
    constructor(scene, ammoInstance, physicsWorld) {
      this.scene = scene;
      this.AmmoInstance = ammoInstance;
      this.physicsWorld = physicsWorld;
      this.objLoader = new OBJLoader();
      this.letterPaths = [
        '/letters/j/tinker.obj',
        '/letters/o/tinker.obj',
        '/letters/n/tinker.obj',
        '/letters/i/tinker.obj',
        '',
        '/letters/m/tinker.obj',
        '/letters/a/tinker.obj',
        '/letters/y/tinker.obj',
        '/letters/r/tinker.obj',
        '/letters/a/tinker.obj',
      ];
    }
  
    loadLetters() {
      this.letterPaths.forEach((path, index) => {
        if (path === '') return; // Skip any empty paths
  
        this.objLoader.load(path, (root) => {
          this._processLetter(root, index);
        });
      });
    }
  
    _processLetter(root, index) {
      root.castShadow = true;
      root.receiveShadow = true;
  
      root.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true; // Enable shadow casting
        }
      });
  
      const scale = 0.1;
      const letterPosition = new THREE.Vector3(-15 + index * 3, 40 + index, -20);
      
      const letter = new ObjectFile(
        root,
        this.AmmoInstance,
        this.scene,
        scale,
        letterPosition,
        10
      );
      console.log(letter.RigidBody.body_, letter.root);
      this.physicsWorld.addRigidBody(letter.RigidBody, letter.root);
    }
  }
  