/**
 * SRL Oculus Touch locomotion component for A-Frame.
 */
AFRAME.registerComponent('srl-oculus-touch-locomotion', {
  schema: {
    // How fast do you move when walking, in m/s    
    walking: {type: 'number', default: 2 },
    // How fast do you move when running, in m/s    
    running: {type: 'number', default: 10 },
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
    this.rig      = el.parentNode;
    this.axismove = null;
    this.thumbsticktouched = false;
    this.thumbstickpress   = false;
    this.upbuttontouch     = false;
    this.downbuttontouch   = false;
    this.upbuttonpress     = false;
    this.downbuttonpress   = false;
    this.triggertouch      = false;    

    this.grabbed           = null; 
    this.otherHand         = null;   

    this.index             = [...el.parentNode.children].indexOf(el);
    this.handControls      = el.components['hand-controls']
    this.hand              = this.handControls && this.handControls.data.hand

    this.handMaterial      = null;
    
    this.origin = new THREE.Vector2();    
    // The nominal height of the actor's feet
    this.height = 0;
    // The actual y (up/down) velocity of the actor
    this.velocity = 0;

    this.mode = "none";

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

    this.elOrb = document.createElement('a-entity');
    this.elOrb.setAttribute("geometry",
      {primitive: "dodecahedron", 
      radius: 0.05,
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
    this.elOrb.setAttribute("material",
             {color: "green", wireframe: true, visible: true});
    const handedness =  this.hand == 'left' ? 1 : -1;
    this.elOrb.setAttribute("position",{x: handedness * 0.0,y:0.0,z:0});
    this.elOrb.setAttribute("material","visible",false);
    el.appendChild(this.elOrb);


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

    // The hands, being meshes, might load late

    if (!this.handMaterial) {
      const mesh = el.getObject3D('mesh');
      this.handMaterial = mesh && mesh.children && mesh.children[0] && mesh.children[1].material
    }

    // if moving the thumbstick (axis move)...
    if (this.axismove) {
      let mv = new THREE.Vector2(this.axismove.x,this.axismove.y);
      if (mv.length() > 0) {
        let step = delta * this.data.walking; // how fast you move
        if (this.thumbstickpress) {
          step = delta * this.data.running;
        }
        mv.multiplyScalar(step * 0.001); // *0.001 because we measure in milliseconds
        mv.rotateAround(this.origin,-(controlO.yaw+rigO.yaw));
        rig.object3D.position.add({x:mv.x,y:0,z:mv.y});
      }
    }
    
    // if grabbing
    if (this.grabbed) {
      const q = new THREE.Quaternion();
      this.el.object3D.getWorldQuaternion(q);
      // The sphere is fixed in the world
      this.elSphere.object3D.setRotationFromQuaternion(q.conjugate());

      const pos = this.el.object3D.position.clone();
      pos.sub(this.grabbed);
      pos.negate();
      pos.applyQuaternion(rig.object3D.quaternion);
      if (this.otherHand && this.otherHand.grabbed) {
        // Use half the force on each point,
        // and only in y direction. (x and z are handled by rotations)
         rig.object3D.position.add({x:0, y: pos.y / 2, z: 0});
      } else {
        rig.object3D.position.add(pos);
      }
      this.moment = new THREE.Vector2(pos.x,pos.z);
    
      // We reset this each time, and work with delta's,
      // so we can *add* to the rig's position.
      this.grabbed = this.el.object3D.position.clone();

      if (this.otherHand && this.otherHand.moment) {
        // Both hands are moving, so find the angle (in 2D)
        // and the rotation point (in 2D)
        // and move the rig.
        let p1_3 = this.el.object3D.position.clone();
/*        
        Figure out world in different space
        p1_3 = this.elOrb.object3D.position.clone();
        // https://discourse.threejs.org/t/finding-position-of-an-object-relative-to-a-parent/2068/4

        this.el.object3D.localToWorld( p1_3 ); // The parent of this.elOrb
        rig.object3D.worldToLocal( p1_3 );     // The coord-space of our movement

//        // convert `v` into vector from object to target
//        p1_3.sub( rig.object3D.position );

        document.querySelector('#' + this.hand + '-box').object3D.position.copy(p1_3);
*/
        const p1 = new THREE.Vector2(p1_3.x,p1_3.z);
        let p2_3 = this.otherHand.elOrb.object3D.position.clone();

        this.otherHand.el.object3D.localToWorld( p2_3 ); // The parent of elOrb
        rig.object3D.worldToLocal( p2_3 );     // The coord-space of our movement
        
        const p2 = new THREE.Vector2(p2_3.x,p2_3.z);
        p2.sub(p1);
        const dist = p2.length();
        const r0 = p2.angle() - rigO.yaw;
        const m1 = this.moment.clone();
        m1.rotateAround(this.origin, -r0);
        const a1 = Math.atan(m1.y/dist);
        m1.y = 0;
        m1.rotateAround(this.origin, r0);

        const m2 = this.otherHand.moment.clone();
        m2.rotateAround(new THREE.Vector2(0,0), -r0);
        const a2 = Math.atan(m2.y/dist);

        m2.y = 0;
        m2.rotateAround(this.origin, r0);

        rig.object3D.position.add({x: (m1.x + m2.x) / 2, y: 0, z: (m1.x + m2.y) / 2});

        let a = (a1 - a2);
        // limit a if the distance is small
        // This is a big of a hack.
        // We could use the distace between the controllers (aka leverage)
        // to cap instead.
        if (dist < 0.1 && Math.abs(a) > 0.1) {
          a = Math.max(-0.1,Math.min(0.1,a))
        }

        rig.object3D.rotateY(a);

        // Now we figure out the relationship between the rig, and the center of the points.
        const ratio = - a2 / a;
        if (isFinite(ratio)) {
          const centerPoint = p2_3.clone();
          centerPoint.lerp(p1_3, ratio);
          const centerPoint2 = new THREE.Vector2(centerPoint.x, centerPoint.z);
          const mv = new THREE.Vector2(0,0); 
          mv.rotateAround(centerPoint2,-a);
          mv.rotateAround(this.origin,-rigO.yaw);
          rig.object3D.position.add({x:mv.x,y:0,z:mv.y});
        }

      }


    } else {
//    	this.elSphere.setAttribute("material","visible",false);
    }

  },

  tock: function () {
    this.moment = null;
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
    // You grab a position
    this.grabbed = this.el.object3D.position.clone();
    this.elSphere.setAttribute("material","visible",true);
    this.handMaterial && this.handMaterial.color.set('red');
  },
  // attempt to let go something
  letGo: function () {
    this.grabbed = null;
    // replace with  el.object3D.visible = false;
//    this.elSphere.setAttribute("material","visible",false);
    this.handMaterial && this.handMaterial.color.set('blue');
  },
  orbModes:  [ "none", "position" ],
  changeOrbMode: function () {
    AFRAME.log("mode:" + this.mode)
    let ix = this.orbModes.indexOf(this.mode) + 1;
    AFRAME.log("ix:" + ix)
    if (ix == this.orbModes.length) {
      ix = 0;
    }
    this.mode = this.orbModes[ix];
    AFRAME.log("new mode:" + this.mode)
    this.elOrb.setAttribute("material","visible",this.mode != "none");
    const orbColors = {
      position: "green"
    }
    const orbColor = orbColors[this.mode];
    orbColor && this.elOrb.setAttribute("material","color",orbColor);
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
    thumbstickdown: function (evt) {
      this.thumbstickpress = true;
    },
    thumbstickup: function (evt) {
      this.thumbstickpress = false;
    },
    triggerdown: function (evt) {
      this.grab();
    },
    triggerup: function (evt) {
      this.letGo();
    },
    gripdown: function (evt) {
      this.changeOrbMode();
    },
  }
});

// This code gets reasonable pitch,roll,yaw for our controller.
function toolOrientation(r) {
  let r2 = r.clone().reorder('YXZ');
  return { pitch: r2.x, roll: r2.z, yaw : r2.y };
}
