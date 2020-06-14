/**
 * SRL shader for projection from a point in A-Frame.
 */

AFRAME.registerShader('srl-projection-material', {
  schema: {
    src:       { type: 'map', is: 'uniform' },
    projector: { type: 'vec3', is: 'uniform' },
    maxPhi:    { type: 'number', is: 'uniform' },
    maxTheta:  { type: 'number', is: 'uniform' },
    col1:      { type: 'vec4', is: 'uniform' },
    col2:      { type: 'vec4', is: 'uniform' },
    col3:      { type: 'vec4', is: 'uniform' },
    col4:      { type: 'vec4', is: 'uniform' }
  },
  
  // Can debug using document.querySelector('#mine').
  // components.material.shader.uniforms.projector

  vertexShader: `
varying vec2 pUV; // projected UV

uniform vec3 projector;
uniform float maxPhi;
uniform float maxTheta;
uniform vec4 col1;
uniform vec4 col2;
uniform vec4 col3;
uniform vec4 col4;

const float PI = 3.1415926535897932384626433832795;

vec4 col1X = vec4(1.0,0.0,0.0,0.0);
vec4 col2X = vec4(0.0,1.0,0.0,0.0);
vec4 col3X = vec4(0.0,0.0,1.0,0.0);
vec4 col4X = vec4(0.0,-1.0,2.0,1.0);

mat4 projectorModelMatrix = mat4(col1,col2,col3,col4);

void main() {
  vec4 theModel = modelMatrix * vec4( position, 1.0 ); 
  vec3 theVec   = (projectorModelMatrix  * theModel).xyz;
//-(theModel.xyz - projector.xyz);
  float longitude = atan(theVec.x,theVec.z);
  float latitude = atan(theVec.y,length(theVec.xz));
  pUV = 0.5 + vec2(longitude/(PI*maxPhi/180.0),(latitude/(PI*maxTheta/180.0)));
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


