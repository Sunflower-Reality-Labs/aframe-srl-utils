/**
 * SRL Oculus span a entity between two entities.
 */
AFRAME.registerComponent('srl-span', {
  schema: {
    type: 'selector',
    default: null
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
//    console.log('tick');
    let p0 = this.data;
    let here = new THREE.Vector3();
    let there = new THREE.Vector3();
    this.el.object3D.getWorldPosition(here);
    this.data.object3D.getWorldPosition(there);
    this.el.object3D.lookAt(there);
    let p = here.distanceTo(there);
    this.el.object3D.scale.z = p;
    this.c = (this.c || 0) + 1;
    if (this.c % 100 == 1) {
//      console.log('tick',here,there,p);
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

