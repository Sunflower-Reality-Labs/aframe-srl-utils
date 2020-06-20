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
    leftHand:  { type: 'selector', default: '#left-hand' },
    rightShoulder: { type: 'selector' },
    rightElbow: { type: 'selector' },
    rightWrist: { type: 'selector' },
    rightHand:  { type: 'selector', default: '#right-hand' },

    // Dimensions of avator
    neckOffset: { type: 'vec3', default: { x: 0, y: -0.1, z: 0.05 }},
    shoulderOffset: { type: 'vec3', default: { x: -0.15, y: -0, z: 0.05 }},
    upperArmLength : { type: 'number', default: 0.30 },
    forearmLength : { type: 'number', default: 0.35 },
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

    let head = this.data.head;
    head && head.object3D.setRotationFromQuaternion(reflectQ(eyesQ));
    head && head.object3D.position.copy(reflectPos(eyesPos));
    
    // Now, figure out where the (back of the) neck is
    let neck = this.data.neck;
    let neckPos = new THREE.Vector3(0,-0.1,0.05);
    neckPos.applyQuaternion(eyesQ);
    neckPos.add(eyesPos);
    neck && neck.object3D.position.copy(reflectPos(neckPos));
    // We do not do rotation on neck (yet)

    for (let side of ['left', 'right']) {
      let reflectX = side == 'left' ? -1 : 1;

      let shoulder = this.data[side + 'Shoulder'];
      let elbow    = this.data[side + 'Elbow'];
      let wrist    = this.data[side + 'Wrist'];
      let hand     = this.data[side + 'Hand'];
      
      // Now, estimate the location of the shoulder
      // Need to add rotation of shoulders
      let shoulderPos = new THREE.Vector3(reflectX * 0.15,-0.10,-0.05);
      shoulderPos.add(neckPos);
      shoulder && shoulder.object3D.position.copy(reflectPos(shoulderPos));

      let handPos = hand.object3D.position;
      let handQ = hand.object3D.quaternion;
      let wristPos = new THREE.Vector3(0,-0.7,0.7);
      wristPos.multiplyScalar(this.data.handLength);
      wristPos.applyQuaternion(handQ);
      wristPos.add(handPos);
      wrist && wrist.object3D.position.copy(reflectPos(wristPos));
      
      // First, compute the elbow angle
      let wristToShoulder = wristPos.distanceTo(shoulderPos);
      let wristToElbow    = this.data.forearmLength;
      let elbowToShoulder = this.data.upperArmLength;
      const cosineRule = (a,b,c) => {
	return Math.acos(((b*b)+(c*c)-(a*a))/(2*b*c)) || 0;
      }
      let h = cosineRule(wristToElbow,elbowToShoulder,wristToShoulder);
      
      // Now compute the y axis angle between the body and the wrist
      let s2 = new THREE.Vector2(shoulderPos.x,shoulderPos.z);
      let w2 = new THREE.Vector2(wristPos.x,wristPos.z);
      let h2 = w2.clone().sub(s2).angle();
      // Now, the rotation of the wrist from the vertical.
      let t2 = wristPos.clone();
      t2.sub(shoulderPos);
      t2.multiplyScalar(elbowToShoulder/wristToShoulder)
      t2.applyEuler(new THREE.Euler(0,h2,0));
      t2.applyEuler(new THREE.Euler(0,0,-h));
      t2.applyEuler(new THREE.Euler(0,-h2,0));
      t2.add(shoulderPos);
      elbow && elbow.object3D.position.copy(reflectPos(t2));
//      document.querySelector("#debug").object3D.position.set(0,h2,-1);
    }
      
    this.c = (this.c || 0) + 1;
    if (this.c % 100 == 1 && false) {
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

