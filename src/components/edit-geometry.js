/**
 * SRL components for geometry we can edit
 */

AFRAME.registerGeometry('srl-edit-box', {
  schema: {
  },

  init: function (data) {
    this.geometry = new THREE.Geometry(); 
    this.geometry.vertices.push(
      new THREE.Vector3(-1, -1,  1),  // 0
      new THREE.Vector3( 1, -1,  1),  // 1
      new THREE.Vector3(-1,  1,  1),  // 2
      new THREE.Vector3( 1,  1,  1),  // 3
      new THREE.Vector3(-1, -1, -1),  // 4
      new THREE.Vector3( 1, -1, -1),  // 5
      new THREE.Vector3(-1,  1, -1),  // 6
      new THREE.Vector3( 1,  1, -1),  // 7
    );
    this.geometry.faces.push(
  // front
  new THREE.Face3(0, 3, 2),
  new THREE.Face3(0, 1, 3),
  // right
  new THREE.Face3(1, 7, 3),
  new THREE.Face3(1, 5, 7),
  // back
  new THREE.Face3(5, 6, 7),
  new THREE.Face3(5, 4, 6),
  // left
  new THREE.Face3(4, 2, 6),
  new THREE.Face3(4, 0, 2),
  // top
  new THREE.Face3(2, 7, 6),
  new THREE.Face3(2, 3, 7),
  // bottom
  new THREE.Face3(4, 1, 0),
  new THREE.Face3(4, 5, 1),
);
  }
});

