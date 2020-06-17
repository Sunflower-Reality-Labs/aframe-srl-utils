/**
 * SRL Oculus span a entity between two entities.
 */
AFRAME.registerComponent('srl-span', {
  schema: {
    p0: {type: 'selector' },
    p1: { type: 'selector' },
    span: { type: 'string', oneOf: ['x','y','z'] }
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
    console.log('tick');
    let p0 = this.data.p0
    let p1 = this.data.p1
    let v0 = new THREE.Vector3();
    let v1 = new THREE.Vector3();
    p0.object3D.updateMatrixWorld();
    p0.object3D.getWorldPosition(v0);
    p1.object3D.updateMatrixWorld();    
    p1.object3D.getWorldPosition(v1);
    let d = v0.distanceTo(v1);
    this.c = (this.c || 0) + 1;
    if (this.c % 100 == 1) {
      console.log('tick',d, this.el.getAttribute('scale'))
    }
    let scale = this.el.getAttribute('scale');
    scale[this.data.span] = d;
    this.el.setAttribute('scale', scale);
//    this.el.setAttribute('position', {x:0,y:0,z:d/2});
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

