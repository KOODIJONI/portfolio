// Camera.js
import * as THREE from 'three';

export default class LightSetup {
    constructor(scene){
        this.scene = scene;
    }
    setupLights() {
        const light1 = new THREE.DirectionalLight(0x00ffff, 10);
        light1.position.set(5, 20, 25);
        light1.castShadow = true;
  
        light1.shadow.camera.near = 0.1;   // Adjust near clipping plane
        light1.shadow.camera.far = 200;    // Adjust far clipping plane to cover more distance
        light1.shadow.camera.left = -50;   // Adjust left side of the frustum
        light1.shadow.camera.right = 50;   // Adjust right side of the frustum
        light1.shadow.camera.top = 50;     // Adjust top side of the frustum
        light1.shadow.camera.bottom = -50; // Adjust bottom side of the frustum
  
        light1.shadow.mapSize.width = 2048;   // Increase shadow map resolution
        light1.shadow.mapSize.height = 2048;
        this.scene.add(light1);
  
        const light2 = new THREE.DirectionalLight(0xffff00, 10);
        light2.position.set(-10, 20, -10);
        light2.castShadow = true;
  
        light2.shadow.camera.near = 0.1;   // Adjust near clipping plane
        light2.shadow.camera.far = 200;    // Adjust far clipping plane to cover more distance
        light2.shadow.camera.left = -50;   // Adjust left side of the frustum
        light2.shadow.camera.right = 50;   // Adjust right side of the frustum
        light2.shadow.camera.top = 50;     // Adjust top side of the frustum
        light2.shadow.camera.bottom = -50; // Adjust bottom side of the frustum
  
        light2.shadow.mapSize.width = 2048;   // Increase shadow map resolution
        light2.shadow.mapSize.height = 2048;
        this.scene.add(light2);
  
        const ambientLight = new THREE.AmbientLight(0xE8E8E8, 1);
        this.scene.add(ambientLight);
      }

}