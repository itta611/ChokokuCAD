import {language} from './i18n.js';
import {toScreenXY, camera} from './renderer.js';
let viewScene = new THREE.Scene();
let viewRaycast = new THREE.Raycaster();
let viewMouse = new THREE.Vector2();
let viewBoxAngles = [];
const textureLoader = new THREE.TextureLoader();
const defaultCameraPosition = new THREE.Vector3(0, 0, 100);

textureLoader.setPath('img/');
let viewBoxMaterial = [];
for (let i = 1; i <= 6; i++) {
  let texMat = new THREE.MeshBasicMaterial({map: textureLoader.load(`view-box-texture-${i}.png`)});
  viewBoxMaterial.push(texMat);
}

// rotationView
let viewBox;
if (language == 'ja') {
  viewBox = new THREE.Mesh(
    new THREE.BoxGeometry(100, 100, 100),
    new THREE.MultiMaterial(viewBoxMaterial)
  );
} else {
  viewBox = new THREE.Mesh(
    new THREE.BoxGeometry(100, 100, 100),
    new THREE.MeshBasicMaterial({color: 0xcfe0fc})
  );
}
viewBox.position.set(0, 0, 0)
viewScene.add(viewBox);

for (let i = -50; i <= 50; i += 50) {
  for (let j = -50; j <= 50; j += 50) {
    for (let k = -50; k <= 50; k += 50) {
      if (i == 0 && j == 0 && k == 0) continue;
      let mesh = new THREE.Mesh(
        new THREE.BoxGeometry(50 - Math.abs(i / 2), 50 - Math.abs(j / 2), 50 - Math.abs(k / 2)),
        new THREE.MeshLambertMaterial({
          color: 0xffffff,
          opacity: 0.2,
          transparent: true,
          depthWrite: false
        })
      );
      mesh.position.set(i, j, k);
      viewBoxAngles.push(mesh);
      viewScene.add(mesh);
    }
  }
}

let viewLight = new THREE.DirectionalLight(0xffffff, 0.2);
viewLight.position.set(30, 100, 50);
viewScene.add(viewLight)

let viewAmbientLight = new THREE.AmbientLight(0xffffff, 0.7);
viewScene.add(viewAmbientLight)

let viewCamera = new THREE.OrthographicCamera(180 / - 2, 180 / 2, 180 / 2, 180 / - 2, 1, 1000);
// viewCamera = new THREE.PerspectiveCamera(45, 100 / 100, 1, 1000);
viewCamera.position.copy(defaultCameraPosition.normalize().setLength(250));
viewCamera.lookAt(viewScene.position);

let viewRenderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
viewRenderer.setSize(100, 100);
viewRenderer.setPixelRatio(window.devicePixelRatio);
document.querySelector('#view-canvas-wrap').appendChild(viewRenderer.domElement);


window.addEventListener('load', function() {
  viewRenderer.render(viewScene, viewCamera);
});

viewRenderer.domElement.addEventListener('mousemove', function(e) {
  let leftPx = viewRenderer.domElement.getBoundingClientRect().left;
  let topPx = viewRenderer.domElement.getBoundingClientRect().top;
  viewMouse.copy(toScreenXY(new THREE.Vector2(e.clientX - leftPx, e.clientY - topPx), 100, 100));
  viewRaycast.setFromCamera(viewMouse, viewCamera);
  let intersectObjects = viewRaycast.intersectObjects(viewBoxAngles);
  for (let i = 0;i < viewBoxAngles.length;i++) {
    if (intersectObjects.length >= 1 && intersectObjects[0].object.uuid === viewBoxAngles[i].uuid) {
      viewBoxAngles[i].material.opacity = 0.5;
    } else {
      viewBoxAngles[i].material.opacity = 0.2;
    }
  }
});

viewRenderer.domElement.addEventListener('click', function(e) {
  let leftPx = viewRenderer.domElement.getBoundingClientRect().left;
  let topPx = viewRenderer.domElement.getBoundingClientRect().top;
  viewMouse.copy(toScreenXY(new THREE.Vector2(e.clientX - leftPx, e.clientY - topPx), 100, 100));
  viewRaycast.setFromCamera(viewMouse, viewCamera);
  let intersectObjects = viewRaycast.intersectObjects(viewBoxAngles);
  if (intersectObjects.length >= 1) {
    camera.position.copy(intersectObjects[0].object.position.clone().normalize().setLength(camera.position.length()));
    camera.lookAt(new THREE.Vector3());
  }
});

viewRenderer.domElement.addEventListener('mouseout', function() {
  for (let i = 0;i < viewBoxAngles.length;i++) {
    viewBoxAngles[i].material.opacity = 0.2;
  }
});

export {viewRenderer, viewScene, viewCamera, defaultCameraPosition};
