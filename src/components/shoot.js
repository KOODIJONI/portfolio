import * as THREE from "three";
import RigidBody from './RigidBody';

export default class Shoot {
    constructor(ammo, scene, physicsworld, camera) {
        this.physicsworld = physicsworld;
        const geometry = new THREE.SphereGeometry(0.5, 0.5, 0.5);
        this.scene = scene;
        this.camera = camera;
        // Create a material for the mesh (you can choose a different material type)
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        // Create a mesh by combining geometry and material
        this.root = new THREE.Mesh(geometry, material);
        this.root.position.set(camera.position.x, camera.position.y + 1, camera.position.z);

        this.RigidBody = new RigidBody(ammo, 10, this.root.position, this.root.quaternion, new THREE.Vector3(0.5, 0.5, 0.5));
        this.direction = new THREE.Vector3(0, 0, 0);
        this.AmmoInstance = ammo;
        this.force = new this.AmmoInstance.btVector3(0, 0, 0);  

        // Set restitution and damping properties for less bounce
        this.setProjectileProperties();
    }

    setProjectileProperties() {
        // Lower the restitution (bounce factor) of the rigid body
        this.RigidBody.body_.setRestitution(0.01); // Lower value = less bounce
        
        this.RigidBody.body_.setAngularVelocity(new this.AmmoInstance.btVector3(0, 0, 0));
        // Optionally, apply some linear and angular damping to slow down the object
        this.RigidBody.body_.setDamping(0.1,0.99);  // Reduces linear velocity over time
    }

    shootBall() {
        // Create a geometry and material for the projectile
        const geometry = new THREE.SphereGeometry(0.25, 10, 10);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        // Create a mesh for the projectile
        const root = new THREE.Mesh(geometry, material);

        // Set the projectile's initial position based on the camera's position
        root.position.set(this.camera.position.x, this.camera.position.y + 1, this.camera.position.z);

        // Create the rigid body for the projectile
        const rigidBody = new RigidBody(this.AmmoInstance, 10, root.position, root.quaternion, new THREE.Vector3(0.5, 0.5, 0.5));

        // Add the mesh to the scene
        this.scene.add(root);

        // Add the rigid body to the physics world
        this.physicsworld.addRigidBody(rigidBody, root);

        // Get the camera's world direction
        this.camera.getWorldDirection(this.direction);
        rigidBody.body_.setAngularFactor(new this.AmmoInstance.btVector3(0, 0, 0));
        // Scale the direction to apply force
        this.direction.multiplyScalar(500);

        // Create a force vector based on the direction
        this.force.setValue(this.direction.x, this.direction.y, this.direction.z);

        // Apply the force to the rigid body
        rigidBody.body_.applyImpulse(this.force, rigidBody.body_.getCenterOfMassTransform().getOrigin());
        rigidBody.body_.applyForce(this.force, rigidBody.body_.getCenterOfMassTransform().getOrigin());
    }
}
