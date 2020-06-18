/**
 * SRL Oculus span a entity between two entities.
 */
AFRAME.registerComponent('srl-aviator', {
  schema: {
  },

  /**
   * Set if component needs multiple instancing.
   */
  multiple: false,

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    console.log('init span');
  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function (oldData) {
  },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () { },

  /**
   * Called on each scene tick.
   */
  tick: function (t, delta) {
    let head = document.querySelector('#head');
    let eyes = document.querySelector('[camera]');
    let headPos = new THREE.Vector3();
    let headRot = new THREE.Vector3();
    let eyesPos = new THREE.Vector3();
    let eyesRot = new THREE.Vector3();
    let myRot = new THREE.Vector3();
    head.object3D.getWorldPosition(headPos);
    head.object3D.getWorldDirection(headRot);    
    eyes.object3D.getWorldPosition(eyesPos);
    eyes.object3D.getWorldDirection(eyesRot);    
    this.el.object3D.getWorldDirection(myRot);
    let poseMatrix = new THREE.Matrix4();
    let sceneEl = this.el.sceneEl;
    let dummy0 = new THREE.Vector3();
    let dummy1 = new THREE.Vector3();
    let eyesQ = new THREE.Quaternion();
    
    if (sceneEl.hasWebXR) {
      let pose = sceneEl.renderer.xr.getCameraPose();
      if (pose) {
        poseMatrix.elements = pose.transform.matrix;
        poseMatrix.decompose(eyesPos, eyesQ, dummy0);
	// No idea why this does not work instead/
	// It's like the matrix is blanked out
        //eyes.object3D.matrix.decompose(eyesPos, eyesQ, dummy0);	
      } else {
	eyesPos = new THREE.Vector3(0,1.6,0);
	eyesQ.setFromEuler(new THREE.Euler(0,0,0));
      }
    }
    eyesQ.x = -eyesQ.x;
    eyesQ.y = -eyesQ.y;
    head.object3D.setRotationFromQuaternion(eyesQ);

    let reflectPos = (pos) => {
      let p = pos.clone();
      p.z = -p.z - 0.5;
      return p;
    }
    
    eyesPos = reflectPos(eyesPos);
    head.object3D.position.set(eyesPos.x,eyesPos.y, eyesPos.z);

    // Now, figure out where the (top of the) spine is
    let spine = document.querySelector('spine')
    let neckPos = new THREE.Vector3(0,-0.1,-0.05);
    neckPos.applyQuaternion(eyesQ);
    neckPos.add(eyesPos);
    document.querySelector('#spine').object3D.position.set(neckPos.x,neckPos.y,neckPos.z);    

    let leftPos = new THREE.Vector3(1,2,3);
    let leftHand = document.querySelector('#left-hand');
//    poseMatrix.elements = pose.transform.matrix;
    leftPos = leftHand.object3D.position;
    leftPos = reflectPos(leftPos);    
    document.querySelector('#left-wrist').object3D.position.set(leftPos.x,leftPos.y,leftPos.z);
    
    //    eyesPos = new THREE.Vector3(1,2,3);
//    eyesPos.z = eyesPos.z - 1.0

    //    head.object3D.setRotationFromEuler(new THREE.Euler(eyesRot.x,eyesRot.y,eyesRot.z));
    
    
    this.c = (this.c || 0) + 1;
//    head.object3D.matrix.elements = eyes.object3D.matrix.elements;
    //    head.object3D.matrix.decompose(head.object3D.position, head.object3D.rotation, head.object3D.scale);
//    let eyesPos = new THREE.Vector3(1,2,3);
//    eyesPos.z = eyesPos.z + 0.5;
//    let pos = head.object3D.position
//    head.object3D.translateZ(-0.002);    
    if (this.c % 100 == 1 && false) {
      head.object3D.matrix.elements = eyes.object3D.matrix.elements;
      head.object3D.matrix.decompose(head.object3D.position, head.object3D.rotation, head.object3D.scale);
      let pos = head.object3D.position
      head.object3D.translateZ(-2);
//	position.set({ x: pos.x, y: pos.y, z: pos.z})
//      console.log('tick',head,headPos,headRot,myRot);
//      head.object3D.set();
    }
  },

  /**
   * Called when entity pauses.
   * Use to stop or remove any dynamic or background behavior such as events.
   */
  pause: function () { },

  /**
   * Called when entity resumes.
   * Use to continue or add any dynamic or background behavior such as events.
   */
  play: function () { },

  /**
   * Event handlers that automatically get attached or detached based on scene state.
   */
  events: {}
});

