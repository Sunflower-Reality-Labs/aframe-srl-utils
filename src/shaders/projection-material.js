/**
 * SRL shader for projection from a point in A-Frame.
 */

AFRAME.registerShader('srl-projection-material', {
  schema: {
    src:       { type: 'map', is: 'uniform' },
    maxPhi:    { type: 'number', is: 'uniform' },
    offsetPhi: { type: 'number', is: 'uniform', default: 0.5 },
    maxTheta:  { type: 'number', is: 'uniform' },
    offsetTheta: { type: 'number', is: 'uniform', default: 0.5 },
  },
  
  // Can debug using document.querySelector('#mine').
  // components.material.shader.uniforms.projector

  vertexShader: `
const float PI = 3.1415926535897932384626433832795;
const float PI_180 = PI/180.0;

uniform float maxPhi;
uniform float offsetPhi;
uniform float maxTheta;
uniform float offsetTheta;
uniform mat4 inverseProjectorModelMatrix;

varying vec2 pUV; // projected UV

void main() {
  vec4 theModel = modelMatrix * vec4( position, 1.0 ); 
  vec3 theVec   = (inverseProjectorModelMatrix  * theModel).xyz;
  float longitude = atan(theVec.x,theVec.z);
  float latitude = atan(theVec.y,length(theVec.xz));
  pUV = vec2(offsetPhi,offsetTheta) +
   vec2(-longitude/(PI_180*maxPhi),(latitude/(PI_180*maxTheta)));
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`,
  fragmentShader: `
uniform sampler2D src;

varying vec2 pUV;

void main() {
  gl_FragColor = texture2D(src, pUV);
}
`

});


