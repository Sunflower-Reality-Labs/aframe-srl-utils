/**
 * SRL shader for projection from a point in A-Frame.
 */

AFRAME.registerShader('srl-projection-material', {
  schema: {
    src:       { type: 'map', is: 'uniform' },
    projector: { type: 'vec3', is: 'uniform' },
    maxPhi:    { type: 'number', is: 'uniform' },
    maxTheta:  { type: 'number', is: 'uniform' },
  },
  
  // Can debug using document.querySelector('#mine').
  // components.material.shader.uniforms.projector

  vertexShader: `
varying vec2 pUV; // projected UV

uniform vec3 projector;
uniform float maxPhi;
uniform float maxTheta;

const float PI = 3.1415926535897932384626433832795;

void main() {
  vec4 theModel = modelMatrix * vec4( position, 1.0 ); 
  vec3 theVec   = -(theModel.xyz - projector.xyz);
  float longitude = atan(theVec.x,theVec.z);
  float latitude = atan(theVec.y,length(theVec.xz));
  pUV = 0.5 + vec2(longitude/(PI*maxPhi/180.0),(-latitude/(PI*maxTheta/180.0)));
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`,
  fragmentShader: `
varying vec2 pUV;
uniform sampler2D src;

void main() {
  gl_FragColor = texture2D(src, pUV);
}
`

});


