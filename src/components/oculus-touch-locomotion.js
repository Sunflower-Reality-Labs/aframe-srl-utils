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
    this.upbuttontouch     = false;
    this.downbuttontouch   = false;
    this.upbuttonpress     = false;
    this.downbuttonpress   = false;
    this.triggertouch      = false;    

    this.grabbed           = false; 
    this.braced            = false; // second hand also grabbed
    this.otherHand         = null;   
    
    this.newRigPos         = null;

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

    this.elBox = document.createElement('a-entity');
    this.elBox.setAttribute("geometry",
      {primitive: "octahedron", 
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
    this.elBox.setAttribute("material",
			       {color: "red", wireframe: true, visible: true});
    this.elBox.setAttribute("position",{x:0,y:0,z:0});
    el.appendChild(this.elBox);

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


    if (!this.otherHandLog && this.otherHandLog !== this.otherHand) {
      console.log("otherHand",this.otherHand);
      this.otherHandLog = this.otherHand;
    }
      
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
        if (this.grabbed) {
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
    

    if (this.grabbed) {
      const vis = this.elSphere.getAttribute("material").visible;      

      if (!vis) {      
        this.elSphere.setAttribute("material","visible",true);
      }
      const q = new THREE.Quaternion();
      this.el.object3D.getWorldQuaternion(q);
      // The sphere is fixed in the world
      this.elSphere.object3D.setRotationFromQuaternion(q.conjugate());

      const pos = this.el.object3D.position.clone();
      pos.sub(this.grabbed.position);
      pos.negate();
      pos.applyQuaternion(rig.object3D.quaternion);
      rig.object3D.position.add(pos);

      this.grabbed.position = this.el.object3D.position.clone();

    } else {
      const vis = this.elSphere.getAttribute("material").visible;      
      if (vis) {      
      	this.elSphere.setAttribute("material","visible",false);
      }
    }

    if (this.braced) {
    	this.elBox.setAttribute("material","visible",true);
    } else {
    	this.elBox.setAttribute("material","visible",false);
    }

  },

  tock: function () {
    this.newRigPos         = null;
    if (this.grabbed) {
//      this.grabbed.position2 = this.el.object3D.position.clone();
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

  // Try initialize the link to the other hand
  talkToTheHand: function () {

    if (!this.otherHand) {
      const rig = document.getElementById('rig');
      // We assume that the hands are children of the rig
      this.otherHand = Array
      .from(rig.children)
      .filter(i => i.components).map(i => i.components)
      .filter(i => i[this.name]).map(i => i[this.name])
      .filter(i => i !== this)[0]
      if (!this.otherHand) {
        this.otherHand = null;
      }
    }
  },

  // attempt to grab something
  grab: function () {
      // can not grab the other hand is already grabbed.
      // You brace instead.
      if (false && this.otherHand && this.otherHand.grabbed) {
        this.braced = true;
        return;
      }
      this.braced = false;
      // You grab a position in world space
      this.grabbed = { position: this.el.object3D.position.clone(),
                     };
  },
  // attempt to let go something
  letGo: function () {
    this.grabbed = false;
    this.braced = false;
    if (this.otherHand && this.otherHand.braced) {
      // upgrade the other hand to grabbed.
      this.otherHand.grab();
    }
  },


  /**
   * Event handlers that automatically get attached or detached based on scene state.
   */
  events: {
    controllerconnected: function () {
      this.talkToTheHand();
    },
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
      this.grab();
/*      
      let rig = document.getElementById('rig');      
      this.direction =
        toolOrientation(this.el.object3D.rotation).yaw +
        toolOrientation(rig.object3D.rotation).yaw;
      this.rockDirection =
        toolOrientation(this.el.object3D.rotation).yaw;
      this.position = this.el.object3D.getWorldPosition();
      this.rotation = this.el.object3D.getWorldQuaternion(new THREE.Quaternion()); 
*/
    },
    triggerup: function (evt) {
      this.letGo();
    },
    triggertouchstart: function (evt) {
      this.triggertouch = true;
    },
    triggertouchend: function (evt) {
      this.triggertouch = false;
    },
    gripdown: function (evt) {
/*      
      this.grippress = true;
      let rig = document.getElementById('rig');      
      this.direction =
        toolOrientation(this.el.object3D.rotation).yaw +
        toolOrientation(rig.object3D.rotation).yaw;
      this.rockDirection =
        toolOrientation(this.el.object3D.rotation).yaw;
      this.position = this.el.object3D.getWorldPosition();
      this.rotation = this.el.object3D.getWorldQuaternion(new THREE.Quaternion()); 
*/
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
