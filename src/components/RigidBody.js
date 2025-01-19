
export default class RigidBody {
    constructor(AmmoInstance,mass, pos, quat, size) {
      this.mass = mass;
      this.position = pos;
      this.quaternion = quat;
      this.size = size;
      this.AmmoInstance = AmmoInstance;
      this.transform_ = null;
      this.body_ = null;
      this.motionState = null;
      this.createRigidBody(this.AmmoInstance);
    }
  
    createRigidBody(AmmoInstance) {
        console.log(this.AmmoInstance);
        this.transform_ =  new AmmoInstance.btTransform();
       
        
      const origin = new AmmoInstance.btVector3(this.position.x, this.position.y, this.position.z);
      const rotation = new AmmoInstance.btQuaternion(this.quaternion.x, this.quaternion.y, this.quaternion.z, this.quaternion.w);
        
      this.transform_.setOrigin(origin);
      this.transform_.setRotation(rotation);
  
      const boxShape = new AmmoInstance.btBoxShape(new AmmoInstance.btVector3(0.5*this.size.x, 0.5*this.size.y, 0.5*this.size.z));
  
      this.motionState = new AmmoInstance.btDefaultMotionState(this.transform_);
  
      const mass = this.mass;
      const localInertia = new AmmoInstance.btVector3(0, 0, 0);
  
      if (mass !== 0) {
        boxShape.calculateLocalInertia(mass, localInertia);
      }
  
      const rbInfo = new AmmoInstance.btRigidBodyConstructionInfo(mass, this.motionState, boxShape, localInertia);
      this.body_ = new AmmoInstance.btRigidBody(rbInfo);
      console.log("body created");
      let motionState = this.body_.getMotionState();
      const transform = new AmmoInstance.btTransform(); // Or equivalent constructor
        motionState.getWorldTransform(transform);
    
    }
 
  getBody(){
    return this.body_;
  }
  applyForce(force){
    this.body_.applyCentralForce(force);
  }
}
