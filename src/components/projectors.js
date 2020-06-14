/**
 * SRL components for projection from a point in A-Frame.
 */


AFRAME.registerComponent('srl-projection-material', {
  schema: {
    projector: { type: 'selector', default: null }
  },  
  init: function () {
    this.src = null;
    this.projectorWorldPosition = new THREE.Vector3();
    console.log('data',this.data);
    this.el.setAttribute('material',
			 { shader: "srl-projection-material",
			   projector: {x:0, y:1, z:-2}
			 })
  },
  update: function () {
    this.src = null; // This forces the material src to be reset on the next tick
    console.log('update',this.data);
  },
  tick: function() {
    let projector = this.data.projector
    if (!projector) {
      return;
    }
    let src = projector.getAttribute('srl-equirectangular-projector').src;
    if (src != this.src) {
      this.src = src;
      this.el.setAttribute('material','src', src)
    }
    projector.object3D.updateMatrixWorld();
    this.projectorWorldPosition.setFromMatrixPosition(projector.object3D.matrixWorld);
    console.log('tick',this.projectorWorldPosition,this.el.getAttribute('material').projector);
    // For some reason, passing in the THREE.Vector3 does not work.
    this.el.setAttribute('material', 'projector',
			 { x: this.projectorWorldPosition.x,
			   y: this.projectorWorldPosition.y,
			   z: this.projectorWorldPosition.z });
			   
  }
});

AFRAME.registerComponent('position-setter', {
  init: function () {
  },
  tick: function() {
    return;
    this.el.object3D.updateMatrixWorld();
    var elWorldPosition = new THREE.Vector3();
    elWorldPosition.setFromMatrixPosition(this.el.object3D.matrixWorld);
    console.log('tick',elWorldPosition);
    this.el.setAttribute('material', 'projector', elWorldPosition);
  }
});


// It the the *projector* that picks the projection,
// that is how to project the source image.
AFRAME.registerComponent('srl-equirectangular-projector', {
  schema: {
    src: { type: 'map' }
  },
  init: function () {
    console.log('projector', this.data);
  }
});



