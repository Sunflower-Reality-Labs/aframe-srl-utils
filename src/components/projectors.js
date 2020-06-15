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
    this.count = 0;
    this.inverseProjectorModelMatrix = new THREE.Matrix4();
    this.rotateY180 = new THREE.Matrix4();
    this.rotateY180.makeRotationY(Math.PI);
    console.log('data',this.data);
    this.el.setAttribute('material',
			 { shader: "srl-projection-material"
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
    let projectorAttrs = projector.getAttribute('srl-equirectangular-projector');
    let src = projectorAttrs.src;
    if (src != this.src) {
      this.src = src;
      this.el.setAttribute('material','src', src)
    }
    projector.object3D.updateMatrixWorld();
    this.projectorWorldPosition.setFromMatrixPosition(projector.object3D.matrixWorld);
    this.inverseProjectorModelMatrix.getInverse(projector.object3D.matrixWorld);
    this.inverseProjectorModelMatrix.premultiply(this.rotateY180);
    if (this.count++ % 1000 == 10) {
      console.log('mat4',this.inverseProjectorModelMatrix);
    }
    this.el.setAttribute('material', 'inverseProjectorModelMatrix', this.inverseProjectorModelMatrix)
    this.el.setAttribute('material', 'maxPhi', projectorAttrs.maxPhi);
    this.el.setAttribute('material', 'maxTheta', projectorAttrs.maxTheta);
    this.el.setAttribute('material', 'offsetPhi', projectorAttrs.offsetPhi);
    this.el.setAttribute('material', 'offsetTheta', projectorAttrs.offsetTheta);
  }
});

// It the the *projector* that picks the projection,
// that is how to project the source image.
AFRAME.registerComponent('srl-equirectangular-projector', {
  schema: {
    src: { type: 'map' },
    maxPhi: { type: 'number', default: 360 },
    offsetPhi: { type: 'number',default: 0.5 },    
    maxTheta: { type: 'number', default: 180 },
    offsetTheta: { type: 'number', default: 0.5 },    
  },
  init: function () {
    console.log('projector', this.data);
  }
});



