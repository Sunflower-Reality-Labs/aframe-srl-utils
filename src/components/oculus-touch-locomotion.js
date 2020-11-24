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
    stretching: {type: 'number', default: 1 }
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
    this.upbuttontouch     = false;
    this.downbuttontouch   = false;
    this.upbuttonpress     = false;
    this.downbuttonpress   = false;
    this.triggertouch      = false;    
    this.triggerpress      = false;    

    this.otherhand         = null;

    this.origin = new THREE.Vector2();    
    // The nominal height of the actor's feet
    this.height = 0;
    // The actual y (up/down) velocity of the actor
    this.velocity = 0;

    this.elSphere = document.createElement('a-entity');
    this.elSphere.setAttribute("geometry",
      {primitive: "dodecahedron", 
      radius: 0.1,
//      radiusTubular: 0.02,
      //				phiLength: 90,
//				phiStart: 225,
//				thetaStart: 65,
//				thetaLength: 50,
//        segmentsRadial: 8,
//        segmentsTubular: 8,
				segmentsHeight: 16,
				segmentsWidth: 16				
			       });      
    this.elSphere.setAttribute("material",
			       {color: "black", wireframe: true, visible: true});
    this.elSphere.setAttribute("position",{x:0,y:0,z:0});
    el.appendChild(this.elSphere);
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

    // if moving the thumbstick (axis move)...
    if (this.axismove) {
      let mv = new THREE.Vector2(this.axismove.x,this.axismove.y);
      if (mv.length() > 0) {
        let step = delta * this.data.walking; // how fast you move
        if (this.thumbstickpress) {
          step = delta * this.data.running;
        }
        let origin = new THREE.Vector2();
        if (this.triggerpress) {
          rig.object3D.rotateY(this.axismove.x * 0.02);
        } else {
          mv.multiplyScalar(step * 0.001); // *0.001 because we measure in milliseconds
          mv.rotateAround(this.origin,-(controlO.yaw+rigO.yaw));
          rig.object3D.position.add({x:mv.x,y:0,z:mv.y});
        }
      }
    }
    if (this.upbuttonpress) {
      let y = this.data.stretching*delta*0.001;
      if (this.grippress) {
      	y *= 0.2;
      }
      rig.object3D.position.add({x:0,y:y,z:0});
    }
    if (this.downbuttonpress) {
      let y = this.data.stretching*delta*0.001;
      if (this.grippress) {
      	y *= 0.2;
      }
      rig.object3D.position.add({x:0,y:-y,z:0});
    }
    let vis = this.elSphere.getAttribute("material").visible;

    if (this.triggerpress) {
      if (!vis) {      
        this.elSphere.setAttribute("material","visible",true);
      }
      const q = new THREE.Quaternion();
      this.el.object3D.getWorldQuaternion(q);
      // The sphere is fixed in the world
      this.elSphere.object3D.setRotationFromQuaternion(q.conjugate());

//      this.tocky = (this.direction - (controlO.yaw+rigO.yaw));
      const posFromRig = this.el.object3D.position.clone();
      posFromRig.applyQuaternion(rig.object3D.quaternion);
      const pos = this.position.clone().sub(posFromRig);
      const x = pos.x;
      const y = pos.y;
      const z = pos.z;
      rig.object3D.position.copy(pos);
    } else {
      if (vis) {      
      	this.elSphere.setAttribute("material","visible",false);
      }
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
    bbuttontouchstart: function (evt) {
      this.upbuttontouch = true;
    },
    bbuttontouchend: function (evt) {
      this.upbuttontouch = false;
    },
    bbuttondown: function (evt) {
      this.upbuttonpress = true;
    },
    bbuttonup: function (evt) {
      this.upbuttonpress = false;
    },
    abuttontouchstart: function (evt) {
      this.downbuttontouch = true;
    },
    abuttontouchend: function (evt) {
      this.downbuttontouch = false;
    },
    abuttondown: function (evt) {
      this.downbuttonpress = true;
    },
    abuttonup: function (evt) {
      this.downbuttonpress = false;
    },
    ybuttontouchstart: function (evt) {
      this.upbuttontouch = true;
    },
    ybuttontouchend: function (evt) {
      this.upbuttontouch = false;
    },
    ybuttondown: function (evt) {
      this.upbuttonpress = true;
    },
    ybuttonup: function (evt) {
      this.upbuttonpress = false;
    },
    xbuttontouchstart: function (evt) {
      this.downbuttontouch = true;
    },
    xbuttontouchend: function (evt) {
      this.downbuttontouch = false;
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
      this.rockDirection =
        toolOrientation(this.el.object3D.rotation).yaw;
      this.position = this.el.object3D.getWorldPosition();
      this.rotation = this.el.object3D.getWorldQuaternion(new THREE.Quaternion()); 
    },
    triggerup: function (evt) {
      this.triggerpress = false;
    },
    triggertouchstart: function (evt) {
      this.triggertouch = true;
    },
    triggertouchend: function (evt) {
      this.triggertouch = false;
    },
    gripdown: function (evt) {
      this.grippress = true;
      let rig = document.getElementById('rig');      
      this.direction =
        toolOrientation(this.el.object3D.rotation).yaw +
        toolOrientation(rig.object3D.rotation).yaw;
      this.rockDirection =
        toolOrientation(this.el.object3D.rotation).yaw;
      this.position = this.el.object3D.getWorldPosition();
      this.rotation = this.el.object3D.getWorldQuaternion(new THREE.Quaternion()); 

    },
    gripup: function (evt) {
      this.grippress = false;
    }
  }
});

// This code gets reasonable pitch,roll,yaw for our controller.
function toolOrientation(r) {
  let r2 = r.clone().reorder('YXZ');
  return { pitch: r2.x, roll: r2.z, yaw : r2.y };
}
