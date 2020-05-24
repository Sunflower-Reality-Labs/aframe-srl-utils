/**
 * SRL Oculus Touch locomotion component for A-Frame.
 */
AFRAME.registerComponent('srl-oculus-touch-locomotion', {
  schema: {},

  /**
   * Set if component needs multiple instancing.
   */
  multiple: false,

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    var el = this.el;
    this.axismove = null;
    this.thumbsticktouched = false;
    this.thumbstickpressed = false;    
    el.addEventListener("axismove", (evt) => {
      this.axismove = {x: evt.detail.axis[2], y: evt.detail.axis[3] };
    })
    el.addEventListener("thumbsticktouchstart", (evt) => {
      this.thumbsticktouched = true;
    })
    el.addEventListener("thumbstickdown", (evt) => {
      this.thumbstickpress = true;
    })    
    el.addEventListener("thumbsticktouchend", (evt) => {
      this.thumbsticktouched = false;
    })
    el.addEventListener("thumbstickup", (evt) => {
      this.thumbstickpress = false;
    })    
/*    
    el.addEventListener("triggerdown", (evt) => {
      this.trigger = true;
    })
    el.addEventListener("triggerup", (evt) => {
      let rig = document.getElementById('rig');
      rig.object3D.rotateY(this.el.object3D.rotation.y);
      this.trigger = false;
    })
*/
  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function (oldData) { },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () { },

  /**
   * Called on each scene tick.
   */
  tick: function (t, delta) {
    let el = this.el;
    let rig = document.getElementById('rig');

    let controlO = toolOrientation(this.el.object3D.rotation);
    let rigO     = toolOrientation(rig.object3D.rotation);

    let wp = new THREE.Vector3();
    el.object3D.getWorldPosition(wp);

    let updown = false;
    
    if (this.axismove) {
      let step = delta * 0.002; // how fast you move
      if (this.thumbstickpress) {
	step *= 5.0;
      }

      let mv = new THREE.Vector2(this.axismove.x,this.axismove.y);
      let origin = new THREE.Vector2();
      mv.multiplyScalar(step);
      mv.rotateAround(origin,-(controlO.yaw+rigO.yaw));
      rig.object3D.position.add({x:mv.x,y:0,z:mv.y});
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
  events: {
    // click: function (evt) { }
  }
});


// This code gets reasonable pitch,roll,yaw for our controller.
// I'm sure this can be simplified.
function toolOrientation(r) {
    let r2 = r.clone().reorder('YXZ');
    let q = new THREE.Quaternion();
    let q2 = new THREE.Quaternion();
    q.setFromEuler(r);
    q.premultiply(q2.setFromAxisAngle(new THREE.Vector3( 0, 1, 0 ), -r2.y));
    let r3 = r.clone().setFromQuaternion(q);
    // Is this the same as a reordering? Or YXZ?
    return { pitch: r3.x, roll: r3.z, yaw : r2.y };
}
