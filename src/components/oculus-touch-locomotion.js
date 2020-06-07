/**
 * SRL Oculus Touch locomotion component for A-Frame.
 */
AFRAME.registerComponent('srl-oculus-touch-locomotion', {
  schema: {
    // How fast do you move when walking, in m/s    
    walking: {type: 'number', default: 2 },
    // How fast do you move when running, in m/s    
    running: {type: 'number', default: 10 },
    // How fast do you move when streching, in m/s    
    stretching: {type: 'number', default: 1 },
  },

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
    this.thumbstickpress   = false;
    this.upbuttonpress     = false;
    this.downbuttonpress   = false;

    this.origin = new THREE.Vector2();    
    // The nominal height of the actor
    this.height = 0;
    // The actual y (up/down) velocity of the actor
    this.velocity = 0;
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
      let mv = new THREE.Vector2(this.axismove.x,this.axismove.y);
      if (mv.length() > 0) {
	let step = delta * this.data.walking; // how fast you move
	if (this.thumbstickpress) {
	  step = delta * this.data.running;
	}
	let origin = new THREE.Vector2();
	mv.multiplyScalar(step * 0.001); // *0.001 because we measure in milliseconds
	mv.rotateAround(this.origin,-(controlO.yaw+rigO.yaw));
	rig.object3D.position.add({x:mv.x,y:0,z:mv.y});
      }
    }
    if (this.upbuttonpress) {
      rig.object3D.position.add({x:0,y:this.data.stretching*delta*0.001,z:0});
    }
    if (this.downbuttonpress) {
      rig.object3D.position.add({x:0,y:-this.data.stretching*delta*0.001,z:0});
    }
    if (this.triggerpress) {
      rig.object3D.rotateY((this.direction - (controlO.yaw+rigO.yaw)));
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
    axismove: function (evt) {
      this.axismove = {x: evt.detail.axis[2], y: evt.detail.axis[3] };
    },
    thumbsticktouchstart: function (evt)  {
      this.thumbsticktouched = true;
    },
    thumbstickdown: function (evt) {
      this.thumbstickpress = true;
    },
    thumbsticktouchend: function (evt) {
      this.thumbsticktouched = false;
    },
    thumbstickup: function (evt) {
      this.thumbstickpress = false;
    },
    ybuttondown: function (evt) {
      this.upbuttonpress = true;
    },
    ybuttonup: function (evt) {
      this.upbuttonpress = false;
    },
    xbuttondown: function (evt) {
      this.downbuttonpress = true;
    },
    xbuttonup: function (evt) {
      this.downbuttonpress = false;
    },
    triggerdown: function (evt) {
      this.triggerpress = true;
      let rig = document.getElementById('rig');      
      this.direction =
	toolOrientation(this.el.object3D.rotation).yaw +
	toolOrientation(rig.object3D.rotation).yaw;
    },
    triggerup: function (evt) {
      this.triggerpress = false;
    }
  }
});

// This code gets reasonable pitch,roll,yaw for our controller.
function toolOrientation(r) {
  let r2 = r.clone().reorder('YXZ');
  return { pitch: r2.x, roll: r2.z, yaw : r2.y };
}
