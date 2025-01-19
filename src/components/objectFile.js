import * as THREE from "three"
import RigidBody from './RigidBody';

export default class ObjectFile{
    constructor(root, ammo, scene, scale,pos){
        
            this.root = root
            this.root.scale.set(scale, scale, scale);
            this.root.position.set(pos.x,pos.y, pos.z);
            this.root.rotation.set(-90 * (Math.PI / 180),0,0);
          scene.add(this.root);
          const boundingBox = new THREE.Box3().setFromObject(this.root); // Create a bounding box for the object
          const size = new THREE.Vector3(); // Vector to hold the size
          boundingBox.getSize(size); // Compute size from bounding box
          this.RigidBody= new RigidBody(ammo,10,this.root.position, this.root.quaternion, size);

          
          console.log('Object Size:', size); // Logs { x, y, z } dimensions
           
        
        
      }  
}