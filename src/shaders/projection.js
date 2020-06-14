/**
 * SRL shader for projection from a point in A-Frame.
 */


AFRAME.registerShader('srl-projection-material', {
  schema: {
    color:     { type: 'color', is: 'uniform'},
    timeMsec:  { type: 'time', is: 'uniform'},
    src:       { type: 'map', is: 'uniform' },
    projector: { type: 'vec3', is: 'uniform' }
  },
  
  // Can debug using document.querySelector('#mine').
  // components.material.shader.uniforms.projector

  vertexShader: `
varying vec2 vUV;
varying vec2 xUV;
varying vec2 wUV;

varying vec3 us;
varying vec3 vs;
uniform vec3 projector;
const float PI = 3.1415926535897932384626433832795;

void main() {
  vec4 theModel = modelMatrix * vec4( position, 1.0 ); 
  vec3 theVec   = -(theModel.xyz - projector.xyz);
  float longitude = atan(theVec.x,theVec.z);
  float latitude = atan(theVec.y,length(theVec.xz));
  us = vec3(0,0.3,-0.3) + (longitude/(PI*2.) + 0.5);
  us = mod(us,1.0);
  us = us - vec3(0,0.3,-0.3);
  vs = vec3(0,0.3,-0.3) + (-latitude/PI + 0.5);
  vs = mod(vs,1.0);
  vs = vs - vec3(0,0.3,-0.3);
  xUV = vec2(longitude/(PI*2.) + 0.5,-latitude/PI + 0.5);
  wUV = xUV;
  if (wUV.x > 0.9) { 
     wUV.x -= 1.0;
  }
//  xUV = uv;
//   xUV = vec2(0.5,1.0);
/*

  xUV = vec2(position.x*0.0,position.y*1.0); // 0.000000001 * vec2(position.x - projector.x,position.y - projector.y);
  vec3 v = -(position.xyz - projector.xyz);
  vec4 v4 = vec4(0.0);
  mat4 m = mat4(v4,v4,v4,v4);
  v = position.xyz;
//  xUV = v.xy;
//  xUV.y = 0.0;
  float longitude = atan(v.x,v.z);
//   xUV.x *= 10.0;
  xUV = vec2(longitude,0.0);
//  xUV = vec2(longitude,0.0);
*/
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`,
  fragmentShader: `
varying vec2 vUV;
varying vec2 xUV;
varying vec3 us;
varying vec3 vs;
uniform vec3 color;
uniform sampler2D src;
//uniform float timeMsec; // A-Frame time in milliseconds.

float best(vec3 xs) {
  xs = mod(xs,1.0);
  vec2 a = abs(xs.xy - xs.yz);
  if (a.x <= 0.01) {
    return xs.x;
  } else if (a.y <= 0.01) {
    return xs.y;
  } else {
    return xs.z;
  }
}

void main() {
//  float time = timeMsec / 1000.0; // Convert from A-Frame milliseconds to typical time in seconds.
  // Use sin(time), which curves between 0 and 1 over time,
  // to determine the mix of two colors:
  //    (a) Dynamic color where 'R' and 'B' channels come
  //        from a modulus of the UV coordinates.
  //    (b) Base color.
  // 
  // The color itself is a vec4 containing RGBA values 0-1.

//  if (xUV.x > 1.0 || xUV.x < 0.0  || xUV.y > 1.0 || xUV.y < 0.0) {
//    gl_FragColor = vec4(0.0,0.0,1.0,1.0);
//  } else {
//    gl_FragColor = vec4(mod(xUV.x,1.0),mod(xUV.y,1.0),0.0,1.0);
      float u = best(us);
      float v = vs.x; // best(vs);
  gl_FragColor = texture2D(src, vec2(u,v));
//  }

//  gl_FragColor = mix(
//    vec4(mod(vUv , 0.05) * 20.0, 1.0, 1.0),
//    vec4(color, 1.0),
//    sin(time)
//  );
}
`

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



