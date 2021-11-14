import {screenWidth, screenHeight} from './gui.js';
import {statuses} from './status.js';
import {render} from './render.js';
import {defaultCameraPosition} from './viewBox.js';
import './chokokuTool.js';
import './paintTool.js';
import {recordModel} from './undo.js';
import {flagNotSaved} from './domEvents.js';
import 'three/OrbitControls';
import 'ThreeBSP';
export let scene = new THREE.Scene();
export let raycaster = new THREE.Raycaster();
export let model;
export let modelDepth = 50;
export let modelWidth = 50;
export let modelHeight = 50;
export let faces = [];
export let faceColors = [];

export function initFaceBuffer() {
  faces = [];
  faceColors = [];
}

export function initFaceBufferByCube() {
  for (let i = 0; i < 6; i++) {
    let currentFace = model.geometry.faces[i * 2];
    faces.push(currentFace);
    faceColors.push("#ffffff");
  }
}

export function toScreenXY(point, width = screenWidth - 330, height = screenHeight) {
  point.x = (point.x / width) * 2 - 1;
  point.y = -(point.y / height) * 2 + 1;
  return point;
}

export function updateModel(mesh, record) {
  scene.remove(model);
  model = mesh;
  scene.add(model);
  if (record) recordModel(model);
  flagNotSaved(true);
}

export function removeMesh(mesh) {
  scene.remove(mesh);
  if (mesh) {
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
}

export function updateFaceBuffer(faceBuffers, faceColorBuffers) {
  faces = faceBuffers;
  faceColors = faceColorBuffers;
}

export function transformMesh(mesh, name) {
  mesh.position.set(
    document.querySelector(`#${name}-model-position-x`).value * 1,
    document.querySelector(`#${name}-model-position-y`).value * 1,
    document.querySelector(`#${name}-model-position-z`).value * 1
  );
  mesh.rotation.set(
    THREE.Math.degToRad(document.querySelector(`#${name}-model-rotation-x`).value * 1),
    THREE.Math.degToRad(document.querySelector(`#${name}-model-rotation-y`).value * 1),
    THREE.Math.degToRad(document.querySelector(`#${name}-model-rotation-z`).value * 1)
  );
  mesh.scale.set(
    document.querySelector(`#${name}-model-scale-x`).value * 1,
    document.querySelector(`#${name}-model-scale-y`).value * 1,
    document.querySelector(`#${name}-model-scale-z`).value * 1
  );
}

//lights
let light1 = new THREE.PointLight(0xaaaaaa, 1);
light1.position.set(100, 150, 70);
scene.add(light1)

let light2 = new THREE.PointLight(0xaaaaaa, 1);
light2.position.set(-100, -150, -70);
scene.add(light2)

let ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
ambientLight.position.set(0, 100, 30);
scene.add(ambientLight)

// camera
// camera = new THREE.PerspectiveCamera(45, screenWidth / screenHeight, 1, 1000);
export let camera = new THREE.OrthographicCamera(
  (screenWidth - 330) / -7, (screenWidth - 330) / 7, screenHeight / 7, screenHeight / -7, 1, 1000
);
camera.position.copy(defaultCameraPosition);
camera.lookAt(scene.position);

// renderer
export let renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setSize(screenWidth - 330, screenHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.querySelector('#main-canvas-wrap').appendChild(renderer.domElement);
window.mainCanvas = renderer.domElement;

// controls
export let controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.zoomSpeed = 0.7;
controls.mouseButtons.ORBIT = THREE.MOUSE.RIGHT;
controls.enableDamping = true;
controls.dampingFactor = 0.2;

window.addEventListener('load', function() {
  renderer.render(scene, camera);
});

window.addEventListener('resize', function() {
  camera.left = (screenWidth - 330) / -7;
  camera.right = (screenWidth - 330) / 7;
  camera.top = (screenHeight) / 7;
  camera.bottom = (screenHeight) / -7;
  camera.updateProjectionMatrix();
  renderer.setSize(screenWidth - 330, screenHeight);
});


export function createModel() {
  modelDepth = document.querySelector('#depth').value * 1;
  modelWidth = document.querySelector('#width').value * 1;
  modelHeight = document.querySelector('#height').value * 1;
  model = new THREE.Mesh(
    new THREE.BoxGeometry(modelWidth, modelHeight, modelDepth),
    new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 1, vertexColors: THREE.FaceColors})
    // new THREE.MeshStandardMaterial({wireframe: true})
  );
  initFaceBufferByCube()
  startRender();
}

export function startRender() {
  scene.add(model);
  recordModel();
  statuses['setpath'].change();
  render();
}