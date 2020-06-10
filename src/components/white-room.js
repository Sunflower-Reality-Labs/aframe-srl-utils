/**
 * SRL Whiteroom for A-Frame. Attach to a scene.
 */
AFRAME.registerComponent('srl-white-room', {
  schema: {
    color: { type: 'color', default: '#EEE' },
    size: { type: 'number', default: 10 },
    near: { type: 'number', default: 10 },
    ambient: { type: 'color', default: '#555' },
    directional: { type: 'color', default: '#fff' },
    intensity: { type: 'number', default: 0.65 }
  },

  /**
   * Set if component needs multiple instancing.
   */
  multiple: false,

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    console.log('init')

    this.el.sceneEl.setAttribute('fog',
				 'type: linear; ' +
				 `near: ${this.data.near}; ` +
				 `far: ${this.data.near + 20}; ` +
				 `color: ${this.data.color};`)
    this.el.sceneEl.setAttribute('background', `color: ${this.data.color}`)
				 
    this.ground = document.createElement('a-entity');
    this.ground.setAttribute('position', '0 0 0');
    this.ground.setAttribute('rotation', '-90 0 0');
    this.ground.setAttribute('geometry',
			     'primitive: plane; ' +
			     `width: ${0*this.data.size+50};` +
			     `height: ${0*this.data.size+50};`)
    this.ground.setAttribute('material',
			     `color: ${this.data.color}; `)
    this.ground.setAttribute('shadow', 'receive: true; cast: false') // critical on a white floor
    this.el.sceneEl.appendChild(this.ground);

    this.ambient = document.createElement('a-entity');
    this.ambient.setAttribute('light',
			     'type: ambient; ' +
			     `color: ${this.data.ambient}`)
    this.el.sceneEl.appendChild(this.ambient);

    this.directional = document.createElement('a-entity')
    this.directional.setAttribute('light',
				  'type: directional; ' +
				  `color: ${this.data.directional}; ` + 
				  `intensity: ${this.data.intensity}; ` +
				  'castShadow: true; ' +
				  'shadowCameraRight: 10; ' +
				  'shadowCameraLeft: -10; ' +
				  'shadowCameraTop: 10; ' + 
				  'shadowCameraBottom: -10 ')
    this.directional.setAttribute('position','0 10 1')
    this.el.sceneEl.appendChild(this.directional);

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
  }
});

