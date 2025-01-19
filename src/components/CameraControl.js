import * as THREE from 'three';

export default class CameraControl {

    constructor(AmmoInstance, camera, rbCamera) {
        this.AmmoInstance = AmmoInstance;
        this.camera = camera;
        this.rbCamera = rbCamera;
        this.keys = {};
        this.lastSpacePress = 0;
        this.rbCamera.body_.setDamping(0.8, 0.8);
        this.rbCamera.body_.setAngularFactor(new this.AmmoInstance.btVector3(0, 0, 0)); // Lock angular rotation
        this.mouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.sensitivity = 0.005;
        this.force = new this.AmmoInstance.btVector3(0, 0, 0);
        this.tempEuler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.tempDirection = new THREE.Vector3();
        this.tempFacingPosition = new THREE.Vector3();
        this.tempNormalVector = new THREE.Vector3();
        this.tempReferenceVector = new THREE.Vector3(0, 1, 0);

        this.rotation = new THREE.Quaternion();

        this.pitch = 0; // Vertical (X-axis) rotation
        this.yaw = 0;   
        this.MIN_PITCH = -Math.PI / 2; // -90 degrees
        this.MAX_PITCH = Math.PI / 2;

        // AudioContext should be created once after the first user interaction
        this.audioContext = null;
    }
    
    setupControls() {
        window.addEventListener("keydown", (event) => {
            this.keys[event.key] = true;

            // Create the AudioContext after a user gesture (e.g., first keypress)
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        });

        window.addEventListener("keyup", (event) => {
            this.keys[event.key] = false;
        });  
    }
  
    updateCameraPosition() {
        const currentTime = Date.now();
        this.force.setValue(0,0,0);
        
        const addedAmount = 200;

        if (this.keys["w"]||this.keys["W"]) {
            // Resume the audio context if it's in a suspended state
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            console.log("w");
            const direction = this.calculateCameraFacingPosition();
            const currentZ = this.force.z();
            const currentX = this.force.x();
            this.force.setValue(currentX + direction.x*addedAmount, this.force.y(), currentZ + direction.z*addedAmount); 
        }
        if (this.keys["s"]||this.keys["S"]) {
            const direction = this.calculateCameraFacingPosition();
            const currentZ = this.force.z();
            const currentX = this.force.x();
            this.force.setValue(currentX - direction.x*addedAmount, this.force.y(), currentZ - direction.z*addedAmount); 
        }
        if (this.keys["a"]||this.keys["A"]) {
            const direction = this.calculateNormalVector(this.calculateCameraFacingPosition());
            const currentZ = this.force.z();
            const currentX = this.force.x();
            this.force.setValue(currentX - direction.x*addedAmount, this.force.y(), currentZ - direction.z*addedAmount); 
        }
        if (this.keys["d"]||this.keys["D"]) {
            const direction = this.calculateNormalVector(this.calculateCameraFacingPosition());
            const currentZ = this.force.z();
            const currentX = this.force.x();
            this.force.setValue(currentX + direction.x*addedAmount, this.force.y(), currentZ + direction.z*addedAmount); 
         }
        if (this.keys["ArrowRight"]) {
            this.yaw -= 0.03; // Rotate left (adjust the value to change speed)
        }
        if (this.keys["ArrowLeft"]) {
            this.yaw += 0.03; // Rotate right (adjust the value to change speed)
        }

        if (this.keys["ArrowDown"]) {
            this.pitch -= 0.03; // Rotate left (adjust the value to change speed)
        }
        if (this.keys["ArrowUp"]) {
            this.pitch += 0.03; // Rotate right (adjust the value to change speed)
        }
        this.pitch = Math.max(this.MIN_PITCH, Math.min(this.MAX_PITCH, this.pitch));
        // Jump with spacebar and cooldown
        if (this.keys[" "]) {
            if (currentTime - this.lastSpacePress >= 1000) {
                this.force.setValue(this.force.x(), 8000, this.force.z()); // Apply jump this.force
                this.lastSpacePress = currentTime; 
            } else {
                console.log("Space bar is on cooldown.");
            }
        }


        this.rbCamera.body_.activate();

        this.rbCamera.body_.applyForce(this.force, this.rbCamera.body_.getCenterOfMassTransform().getOrigin());
        this.rbCamera.applyForce(this.force);

        // Compute the camera's final rotation from the pitch and yaw
        this.updateCameraRotation();
        this.calculateCameraFacingPosition();
    }

    // Function to sync the camera's rotation using Euler angles (pitch, yaw)
    syncCameraRotation() {
        // Reuse the Euler object to avoid creating a new one each time
        this.tempEuler.set(this.pitch, this.yaw, 0, 'XYZ');
        this.camera.rotation.set(this.tempEuler.x, this.tempEuler.y, this.tempEuler.z);
    }
    updateCameraRotation() {
        const yawQuat = new THREE.Quaternion();
        yawQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw); // Yaw around Y-axis
        
        const pitchQuat = new THREE.Quaternion();
        pitchQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch); // Pitch around X-axis

        // Combine the yaw and pitch quaternions
        this.rotation.copy(yawQuat).multiply(pitchQuat);

        // Apply the rotation quaternion to the camera
        this.camera.quaternion.copy(this.rotation);
    }

    calculateCameraFacingPosition() {
        // Reuse vectors for calculation
        this.camera.getWorldDirection(this.tempDirection); // Get the normalized direction vector
        this.tempDirection.normalize();

        // Define a distance to look ahead (adjust this value as needed)
        const distance = 1;

        // Calculate the position in front of the camera
        this.tempFacingPosition.copy(this.camera.position).add(this.tempDirection.multiplyScalar(distance));

        // Compute the direction vector
        this.tempDirection.subVectors(this.tempFacingPosition, this.camera.position);

        return this.tempDirection.clone(); // Clone if the caller modifies the vector externally
    }

    calculateNormalVector(directionVector) {
        this.tempNormalVector.crossVectors(directionVector, this.tempReferenceVector);

        if (this.tempNormalVector.length() === 0) {
            this.tempNormalVector.crossVectors(directionVector, new THREE.Vector3(0, 1, 0));
        }

        return this.tempNormalVector.normalize(); 
    }
}
