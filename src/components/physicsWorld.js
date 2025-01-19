
import * as THREE from 'three';

export default class PhysicsWorld {
  constructor(AmmoInstance) {
    this.physicsWorld_ = null;
    this.rigidBodies = [];
    this.AmmoInstance = AmmoInstance; 
    this.tmpTransform = null;
    this.tempForce = null;
  }

  // Initialize Ammo.js and the physics world
  async init(AmmoInstance) {
    // Wait for Ammo.js to load
    
    console.log('Ammo.js loaded', this.AmmoInstance);

    this.collisionConfiguration_ = new AmmoInstance.btDefaultCollisionConfiguration();
    this.dispather_ = new this.AmmoInstance.btCollisionDispatcher(this.collisionConfiguration_);
    this.broadphase_ = new this.AmmoInstance.btDbvtBroadphase();
    this.solver_ = new this.AmmoInstance.btSequentialImpulseConstraintSolver();
    this.tempForce = new this.AmmoInstance.btVector3(0, -20, 0);
    this.physicsWorld_ = new this.AmmoInstance.btDiscreteDynamicsWorld(
      this.dispather_,
      this.broadphase_,
      this.solver_,
      this.collisionConfiguration_
    );
    this.physicsWorld_.setGravity(new this.AmmoInstance.btVector3(0, -10, 0));
    this.tmpTransform = new this.AmmoInstance.btTransform();
    
  }
  
  // Create a rigid body (example: box)
  addRigidBody(rigidBody, mesh) {
    if (this.physicsWorld_) {
      this.rigidBodies.push({ mesh: mesh, rigidBody: rigidBody }); // Add the rigid body to the physics world
      this.physicsWorld_.addRigidBody(rigidBody.body_); 
    } else {
      console.warn('Physics world not initialized yet');
    }
  }

  getPhysicsWorld() {
    return this.physicsWorld_;
  }

  cleanupAmmoObject(obj) {
    if (obj && obj['delete'] && typeof obj['delete'] === 'function') {
      obj.delete();
    }
  }
  // Update the physics world and synchronize the meshes
  update() {
    
    if (this.physicsWorld_) {
        
        const deltaTime = 1 / 60;  // Assuming you're using 60 FPS
      this.physicsWorld_.stepSimulation(deltaTime, 10); 
      // Synchronize meshes with their rigid bodies
      
      for (let i = 0; i < this.rigidBodies.length; i++) {
        const { mesh, rigidBody } = this.rigidBodies[i];
        //const body = rigidBody.getBody();
        
        const motionState = rigidBody.body_.getMotionState();
    
        const transform = this.tmpTransform; // Or equivalent constructor


        if (motionState) {
             // Apply downward force
            rigidBody.body_.setGravity(this.tempForce);

            motionState.getWorldTransform(transform);
          const origin = transform.getOrigin();
          const rotation = transform.getRotation();
          mesh.position.set(origin.x(), origin.y(), origin.z());
          
          mesh.rotation.setFromQuaternion(
            new THREE.Quaternion(rotation.x(), rotation.y(), rotation.z(), rotation.w())
          );
            this.cleanupAmmoObject(transform);
        }
      }
    } else {
      console.warn('Physics world not initialized yet');
    }
  }
}
