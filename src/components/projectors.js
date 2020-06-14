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
    let m = new THREE.Matrix4();
    //m = projector.object3D.matrixWorld.clone();
    m.getInverse(projector.object3D.matrixWorld);
    if (this.count++ % 1000 == 10) {
      let n = new THREE.Matrix4();
      n.makeRotationY(3.1415926).multiply(m);
      console.log('mat4',m,n);
    }
    let e = m.elements;
    // may want to directly update material.uniforms?
    this.el.setAttribute('material', 'col1', new THREE.Vector4(-e[0],e[1],-e[2],0))
    this.el.setAttribute('material', 'col2', new THREE.Vector4(-e[4],e[5],-e[6],0))
    this.el.setAttribute('material', 'col3', new THREE.Vector4(-e[8],e[9],-e[10],0))
    this.el.setAttribute('material', 'col4', new THREE.Vector4(-e[12],e[13],-e[14],1))
//			 { x: 1, y:0, z:0, w:0 })
    

    //			   col2: { x: 0, y:1, z:0, w:0 },
//			   col3: { x: 0, y:0, z:1, w:0 },
//			   col4: { x: 0, y:-1, z:2, w:1 }
//			 { col1: { x: e[0],  y: e[1],  z:e[2],  w: e[3] },
//			   col2: { x: e[4],  y: e[5],  z:e[6],  w: e[7] },
//			   col3: { x: e[8],  y: e[9],  z:e[10], w: e[11] },
//			   col4: { x: e[12], y: e[13], z:e[14], w: e[15] }
//			 })
			   
    
//    console.log('tick',this.projectorWorldPosition,this.el.getAttribute('material').projector);
    // For some reason, passing in the THREE.Vector3 direcly does not work.
    this.el.setAttribute('material', 'projector',
			 { x: this.projectorWorldPosition.x,
			   y: this.projectorWorldPosition.y,
			   z: this.projectorWorldPosition.z });
    this.el.setAttribute('material', 'maxPhi', projectorAttrs.maxPhi);
    this.el.setAttribute('material', 'maxTheta', projectorAttrs.maxTheta);
  }
});

// It the the *projector* that picks the projection,
// that is how to project the source image.
AFRAME.registerComponent('srl-equirectangular-projector', {
  schema: {
    src: { type: 'map' },
    maxPhi: { type: 'number', default: 360 },
    maxTheta: { type: 'number', default: 180 }
  },
  init: function () {
    console.log('projector', this.data);
  }
});



