/**
 * SRL Oculus span a entity between two entities.
 */
AFRAME.registerComponent('srl-avator', {
  schema: {
    // Optional locations in the scene
    head: { type: 'selector' },
    neck: { type: 'selector' },
    leftShoulder: { type: 'selector' },
    leftElbow: { type: 'selector' },
    leftWrist: { type: 'selector' },
    rightShoulder: { type: 'selector' },
    rightElbow: { type: 'selector' },
    rightWrist: { type: 'selector' },

    // Dimensions of avator
    neckOffset: { type: 'vec3', default: { x: 0, y: -0.1, z: 0.05 }},
    shoulderOffset: { type: 'vec3', default: { x: -0.15, y: -0, z: 0.05 }},
    upperArmLength : { type: 'number', default: 0.35 },
    forearmLength : { type: 'number', default: 0.25 },
    handLength: { type: 'number', default: 0.10 },

    reflection: { type: 'number', default: null } // reflect on a plane on the z-axis
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
    let reflectPos = (pos) => {
      let p = pos.clone();
      if (this.data.reflection) {
	p.z = -p.z + this.data.reflection;
      }
      return p;
    }
    let reflectQ = (q) => {
      if (this.data.reflection) {
	q = q.clone();
	q.x = -q.x;
	q.y = -q.y;
	return q;
      } else { 
	return q;
      }
    }

    let sceneEl = this.el.sceneEl;
    let eyesQ = new THREE.Quaternion();
    let eyesPos = new THREE.Vector3();

    // Default for eyes, if there is no 
    eyesPos = new THREE.Vector3(0,1.6,0);
    eyesQ.setFromEuler(new THREE.Euler(0,0,0));
    
    if (sceneEl.hasWebXR) {
      let pose = sceneEl.renderer.xr.getCameraPose();
      if (pose) {
	let poseMatrix = new THREE.Matrix4();
        poseMatrix.elements = pose.transform.matrix;
        poseMatrix.decompose(eyesPos, eyesQ, {});
      }
    }

    let head = document.querySelector('#head');
    head.object3D.setRotationFromQuaternion(reflectQ(eyesQ));
    head.object3D.position.copy(reflectPos(eyesPos));
    
    // Now, figure out where the (back of the) neck is
    let neck = document.querySelector('#spine')
    let neckPos = new THREE.Vector3(0,-0.1,0.05);
    neckPos.applyQuaternion(eyesQ);
    neckPos.add(eyesPos);
    neck.object3D.position.copy(reflectPos(neckPos));
    // We do not do rotation on neck (yet)
    
    // Now, estimate the location of the shoulder
    // Need to add rotation of shoulders
    let shoulderPos = new THREE.Vector3(-0.15,0,-0.05);
    shoulderPos.add(neckPos);
    document.querySelector('#left-shoulder').object3D.position.copy(reflectPos(shoulderPos));
    
//    let shoulderQ = new THREE.Quaternion();
//    shoulderQ.setFromEuler(new THREE.Euler(0,0,0));
//    let 

    let leftPos = new THREE.Vector3(1,2,3);
    let leftHand = document.querySelector('#left-hand');
//    poseMatrix.elements = pose.transform.matrix;
    leftPos = leftHand.object3D.position;
    leftPos = reflectPos(leftPos);    
    document.querySelector('#left-wrist').object3D.position.copy(leftPos);
    
    // First, compute the elbow angle
    let wristToShoulder = leftPos.distanceTo(shoulderPos);
    let wristToElbow    = 0.35;
    let elbowToShoulder = 0.35;
    function cosineRule(a,b,c) {
      return Math.acos(((b*b)+(c*c)-(a*a))/(2*b*c));
    }
    let h = cosineRule(wristToElbow,elbowToShoulder,wristToShoulder);
    if (isNaN(h)) {
      h = 0;
    }
    // Debugging ball
//     document.querySelector("#debug").object3D.position.set(0,h,-1);

    // Now compute the y axis angle between the body and the wrist
    let s2 = new THREE.Vector2(shoulderPos.x,shoulderPos.z);
    let w2 = new THREE.Vector2(leftPos.x,leftPos.z);
    let h2 = w2.clone().sub(s2).angle();
    // Now, the rotation of the wrist from the vertical.
    let t2 = leftPos.clone();
    t2.sub(shoulderPos);
    t2.multiplyScalar(elbowToShoulder/wristToShoulder)
    t2.applyEuler(new THREE.Euler(0,h2,0));
    t2.applyEuler(new THREE.Euler(0,0,-h));
    t2.applyEuler(new THREE.Euler(0,-h2,0));
    t2.add(shoulderPos);    
    document.querySelector('#left-elbow').object3D.position.copy(t2);
    document.querySelector("#debug").object3D.position.set(0,h2,-1);
    

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

