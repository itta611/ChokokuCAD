'use strict'

const createBtn = document.querySelector('#size-input-wrap .btn');
const uploadBtn = document.querySelector('#file-upload-start');
const mask = document.querySelector('#mask');
const startModal = document.querySelector('#start-modal');
const zoomOutBtn = document.querySelector('#zoom-icon-shrink');
const zoomBtn = document.querySelector('#zoom-icon-expand');
const zoomSlider = document.querySelector('#zoom-slider');
const homeBtn = document.querySelector('#home-btn');
const statusBar = document.querySelector('#status-bar');
const chokokutouRotation = document.querySelector('#chokokutou-rotation');
const chokokutouRotateCheck = document.querySelector('#is-chokokutou-rotate');
const chokokutouCenterFin = document.querySelector('#center-fin-input');
const fileUploadAdd = document.querySelector('#file-upload-add');
const undoBtn = document.querySelector('#undo-btn');
const redoBtn = document.querySelector('#redo-btn');
const pathCanvas = document.querySelector('#path-canvas');
const loader = new THREE.TextureLoader();
const statusBarTexts = {
  'start': 'Chokoku CADへようこそ。',
  'setpath': '残す形状を決めてください。',
  'adjustpath': '調節ができます。よければEnterキーを押してください。',
  'drill': 'マウスをクリックしたところに穴を空けます。',
  'fill': '物体の色を設定してください。',
  'modelAdd1': '新しく追加するモデルをアップロードしてください。',
  'modelAdd2': 'アップロードしたモデルを回転・移動してください。',
  'export': 'モデルをglb(gltf)形式でエクスポートしダウンロードします。',
  'transform': 'モデルを移動、回転、サイズを変更します。',
};
const nameAndStatus = {
  '彫刻刀': 'setpath',
  'ドリル': 'drill',
  'バケツ': 'fill',
  '追加': 'modelAdd1',
  'エクスポート': 'export',
  '変形': 'transform'
}
let modelDepth = 50;
let modelWidth = 50;
let modelHeight = 50;
let zoomValue = 1;
let notSaved = false;
let screenWidth = document.documentElement.clientWidth;
let screenHeight = document.documentElement.clientHeight;
let light1;
let light2;
let ambientLight;
let camera;
let currentRotation;
let renderer;
let model;
let controls;
let scene = new THREE.Scene();
let status = 'start';
let chokokuHoleGeometryVertices = [];
let chokokuHoleGeometryFaces = [];
let chokokuSize = 10;
let chokokuResult;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let uploadModel;
let defaultPosition = new THREE.Vector3(0, 0, 100);
let STLLoader = new THREE.STLLoader();
let isChokokutouRotate = false;
let undoBuffer = [];
let undoNowModelId = 0;
let lineDrag = null;
let nowStartlinePos;
let nowFinishlinePos;
let isMouseClicking = false;
let nowPath;
let chokokuPath;
let pathToCursor;
let mouseX;
let mouseY;
let chokokuHole;
let faceNormals = [];
let faceColors = [];
let viewBoxAngles = [];
let hoverIndex = -1;
let hoverPoint = -1;
let pathHovering = false;
let pathGrabingOriginX;
let pathGrabingOriginY;
let removeCursorPath = false;
let pointCircles = [];
let lockObject;

let viewBox;
let viewRenderer;
let viewCamera;
let viewScene = new THREE.Scene();
let viewLight;
let viewAmbientLight;
let viewBoxMaterial;
let viewRaycast = new THREE.Raycaster();
let viewMouse = new THREE.Vector2();

setStatus(status)

loader.setPath('img/');
viewBoxMaterial = [];
for (let i = 1; i <= 6; i++) {
  let texMat = new THREE.MeshBasicMaterial({map: loader.load(`view-box-texture-${i}.png`)});
  viewBoxMaterial.push(texMat);
}

// rotationView
viewBox = new THREE.Mesh(
  new THREE.BoxGeometry(100, 100, 100),
  new THREE.MultiMaterial(viewBoxMaterial)
);
viewBox.position.set(0, 0, 0)
viewScene.add(viewBox);

for (let i = -50; i <= 50; i += 50) {
  for (let j = -50; j <= 50; j += 50) {
    for (let k = -50; k <= 50; k += 50) {
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

viewLight = new THREE.DirectionalLight(0xffffff, 0.2);
viewLight.position.set(30, 100, 50);
viewScene.add(viewLight)

viewAmbientLight = new THREE.AmbientLight(0xffffff, 0.7);
viewScene.add(viewAmbientLight)

viewCamera = new THREE.OrthographicCamera(180 / - 2, 180 / 2, 180 / 2, 180 / - 2, 1, 1000);
// viewCamera = new THREE.PerspectiveCamera(45, 100 / 100, 1, 1000);
viewCamera.position.copy(defaultPosition.normalize().setLength(250));
viewCamera.lookAt(viewScene.position);

viewRenderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
viewRenderer.setSize(100, 100);
viewRenderer.setPixelRatio(window.devicePixelRatio);
document.querySelector('#view-canvas-wrap').appendChild(viewRenderer.domElement);

//lights
light1 = new THREE.PointLight(0x808080, 1.5);
light1.position.set(100, 150, 70);
scene.add(light1)

light2 = new THREE.PointLight(0x808080, 1.5);
light2.position.set(-100, -150, -70);
scene.add(light2)

ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
ambientLight.position.set(0, 100, 30);
scene.add(ambientLight)

// camera
// camera = new THREE.PerspectiveCamera(45, screenWidth / screenHeight, 1, 1000);
camera = new THREE.OrthographicCamera(screenWidth / -7, screenWidth / 7, screenHeight / 7, screenHeight / -7, 1, 1000);
camera.position.copy(defaultPosition);
camera.lookAt(scene.position);

// pathCanvas
pathCanvas.width = screenWidth;
pathCanvas.height = screenHeight;

// renderer
renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setSize(screenWidth, screenHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.querySelector('#main-canvas-wrap').appendChild(renderer.domElement);

// controls
controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.zoomSpeed = 0.7;
controls.mouseButtons.ORBIT = THREE.MOUSE.RIGHT;
controls.enableDamping = true;
controls.dampingFactor = 0.2;

// events

window.addEventListener('load', function() {
  viewRenderer.render(viewScene, viewCamera);
  renderer.render(scene, camera);
  document.querySelector('#loading-mask').style.display = 'none';
  paper.setup(pathCanvas);
  chokokuPath = new paper.Path();
  nowPath = new paper.Path();
  pathToCursor = new paper.Path();
  nowPath.fillColor = 'rgba(255, 255, 255, 0.6)';
  nowPath.dashArray = [2, 2];
  nowPath.strokeColor = '#000';
  chokokuPath.fillColor = 'rgba(255, 255, 255, 0.6)';
  chokokuPath.dashArray = [2, 2];
  chokokuPath.strokeColor = '#000';
  chokokuPath.sendToBack();
});

window.addEventListener('resize', function() {
  screenWidth = document.documentElement.clientWidth;
  screenHeight = document.documentElement.clientHeight;
  camera.left = screenWidth / -7;
  camera.right = screenWidth / 7;
  camera.top = screenHeight / 7;
  camera.bottom = screenHeight / -7;
  camera.updateProjectionMatrix();
  renderer.setSize(screenWidth, screenHeight);
  pathCanvas.width = screenWidth;
  pathCanvas.height = screenHeight;
});

window.addEventListener('beforeunload', function(e) {
  if (notSaved) {
    e.returnValue = 'ページを離れようとしています。よろしいですか？';
  }
});

window.addEventListener('keyup', function(e) {
  if ((status === 'setpath' || status === 'adjustPath') && e.key === 'Enter') {
    setModelFromChokoku();
  }
});

document.querySelector('#chokoku-tool').addEventListener('click', function() {
  setStatus('setpath');
});

document.querySelector('#paint-tool').addEventListener('click', function() {
  setStatus('paint');
});

document.querySelector('#file-upload').addEventListener('click', function() {
  if (document.querySelector('#export-file-name').value !== '') {
    window.modelJSON = model.toJSON();
    window.open('export/');
    notSaved = false;
  } else {
    alert('ファイル名を入力してください。')
  }
});

document.querySelectorAll('input[type="number"]').forEach(function (element) {
  element.addEventListener('change', function () {
    if (element.value * 1 <= 0.01 && element.dataset.zeroFix === 'true') {
      element.value = '0.01';
    }
    element.value = (element.value * 1).toFixed(2) * 1;
  });
});

document.querySelectorAll('input[type="range"]').forEach(function(element) {
  element.addEventListener('input', function() {
    let percent = (element.value - element.min) / (element.max - element.min) * 100;
    element.style.background = `linear-gradient(to right, #ffc42d ${percent}%, #eee ${percent}% 100%)`;
  });
  let percent = (element.value - element.min) / (element.max - element.min) * 100;
  element.style.background = `linear-gradient(to right, #ffc42d ${percent}%, #eee ${percent}% 100%)`;
});

fileUploadAdd.addEventListener('change', function(e) {
  let reader = new FileReader(e);
  reader.addEventListener('load', function() {
    window.isAdd = true;
    window.fileName = e.target.files[0].name
    window.reader = reader;
    window.open('loader/');
    fileUploadAdd.value = '';
  });
  reader.readAsDataURL(e.target.files[0]);
});

createBtn.addEventListener('click', function() {
  if (status === 'start') {
    modelDepth = document.querySelector('#depth').value * 1;
    modelWidth = document.querySelector('#width').value * 1;
    modelHeight = document.querySelector('#height').value * 1;
    model = new THREE.Mesh(
      new THREE.BoxGeometry(modelWidth, modelHeight, modelDepth),
      new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.5, vertexColors: THREE.FaceColors})
      // new THREE.MeshStandardMaterial({wireframe: true})
    );
    for (let i = 0; i < 6; i++) {
      let faceNormal = model.geometry.faces[i * 2].normal;
      faceNormals.push(faceNormal);
      faceColors.push("#ffffff");
    }
    scene.add(model);
    recordModel();
  
    mask.classList.add('hidden');
    startModal.classList.add('hidden');
    setStatus('setpath');
    render();
  }
});

uploadBtn.addEventListener('change', function(e) {
  let reader = new FileReader();
  reader.addEventListener('load', function() {
    window.isAdd = false;
    window.fileName = e.target.files[0].name
    window.reader = reader;
    window.open('loader/');
  });
  reader.readAsDataURL(uploadBtn.files[0]);
});

document.querySelector('#chokoku-setting-chokoku-btn').addEventListener('click', function() {
  document.querySelector('#chokoku-setting-lock-btn').classList.remove('selected');
  if (document.querySelector('#chokoku-setting-eraser-btn').classList.contains('selected')) {
    nowPath.fillColor = 'rgba(0, 123, 255, 0.5)';
    chokokuPath.fillColor = 'rgba(0, 123, 255, 0.5)';
  } else {
    nowPath.fillColor = 'rgba(255, 255, 255, 0.6)';
    chokokuPath.fillColor = 'rgba(255, 255, 255, 0.6)';
  }
  this.classList.add('selected');
});

document.querySelector('#chokoku-setting-lock-btn').addEventListener('click', function() {
  document.querySelector('#chokoku-setting-chokoku-btn').classList.remove('selected');
  if (document.querySelector('#chokoku-setting-eraser-btn').classList.contains('selected')) {
    nowPath.fillColor = 'rgba(123, 255, 123, 0.5)';
    chokokuPath.fillColor = 'rgba(123, 255, 123, 0.5)';
  } else {
    nowPath.fillColor = 'rgba(255, 0, 0, 0.6)';
    chokokuPath.fillColor = 'rgba(255, 0, 0, 0.6)';
  }
  this.classList.add('selected');
});

document.querySelector('#chokoku-setting-add-btn').addEventListener('click', function() {
  document.querySelector('#chokoku-setting-edit-btn').classList.remove('selected');
  document.querySelector('#chokoku-setting-add-mode-params').classList.remove('hidden');
  this.classList.add('selected');
  nowPath.visible = true;
  setStatus('setpath');
  let firstI = 0;
  if (nowPath.curves.length > 0) { // パスが作りかけの場合
    pointCircles[0].visible = true;
    firstI = 1;
  }
  for (let i = firstI; i < pointCircles.length; i++) {
    pointCircles[i].remove();
  }
  if (firstI === 0) {
    pointCircles = [];
  } else {
    pointCircles = [pointCircles[0]];
  }
})

document.querySelector('#chokoku-setting-edit-btn').addEventListener('click', function() {
  document.querySelector('#chokoku-setting-add-btn').classList.remove('selected');
  document.querySelector('#chokoku-setting-add-mode-params').classList.add('hidden');
  this.classList.add('selected');
  setStatus('adjustpath');
  nowPath.visible = false;
  hoverPoint = -1;
  if (nowPath.curves.length > 0) pointCircles[0].visible = false;
  for (let i = 0; i < chokokuPath.curves.length; i++) {
    let pointCircle = new paper.Path.Circle(
      chokokuPath.curves[i].point1, 5
    );
    pointCircle.strokeColor = '#000';
    pointCircle.fillColor = '#fff';
    pointCircles.push(pointCircle);
  }
});

document.querySelector('#chokoku-setting-pencil-btn').addEventListener('click', function() {
  document.querySelector('#chokoku-setting-eraser-btn').classList.remove('selected');
  if (document.querySelector('#chokoku-setting-lock-btn').classList.contains('selected')) {
    nowPath.fillColor = 'rgba(255, 0, 0, 0.6)';
    chokokuPath.fillColor = 'rgba(255, 0, 0, 0.6)';
  } else {
    nowPath.fillColor = 'rgba(255, 255, 255, 0.6)';
    chokokuPath.fillColor = 'rgba(255, 255, 255, 0.6)';
  }
  this.classList.add('selected');
});

document.querySelector('#chokoku-setting-eraser-btn').addEventListener('click', function() {
  document.querySelector('#chokoku-setting-pencil-btn').classList.remove('selected');
  if (document.querySelector('#chokoku-setting-lock-btn').classList.contains('selected')) {
    nowPath.fillColor = 'rgba(123, 255, 123, 0.5)';
    chokokuPath.fillColor = 'rgba(123, 255, 123, 0.5)';
  } else {
    nowPath.fillColor = 'rgba(0, 123, 255, 0.5)';
    chokokuPath.fillColor = 'rgba(0, 123, 255, 0.5)';
  }
  this.classList.add('selected');
});

document.querySelector('#chokoku-setting .btn').addEventListener('click', function() {
  setModelFromChokoku();
});

document.querySelector('#model-color').addEventListener('input', function() {
  let color = document.querySelector('#model-color').value;
  document.querySelector('#model-color-btn').style.background = color;
});

document.querySelector('#set-material-btn').addEventListener('click', function() {
  let color = document.querySelector('#model-color').value;
  // ↓model.material.colorだと、面の色とモデルの色が混ざってしまうので、すべての面に色を付ける
  for (let i = 0; i < model.geometry.faces.length; i++) {
    model.geometry.faces[i].color.set(color);
    faceColors[i] = color;
  }
  model.geometry.colorsNeedUpdate = true;
});

document.querySelector('#file-upload-add-step2 .btn').addEventListener('click', function() {
  if (status === 'modelAdd2') {
    let uploadModelBSP = new ThreeBSP(uploadModel);
    let modelBSP = new ThreeBSP(model);
    let newModelBSP = modelBSP.union(uploadModelBSP);
    let newModel = newModelBSP.toMesh(model.material);
    removeMesh(model);
    model.visible = false;
    model = newModel.clone();
    model.material.vertexColors = THREE.FaceColors;
    scene.add(model);
    removeMesh(uploadModel);
    notSaved = true;
    recordModel();
    document.querySelector('#file-upload-add-step1').classList.remove('hidden');
    document.querySelector('#file-upload-add-step2').classList.add('hidden');
    // 初期化
    ['position', 'rotation', 'scale'].forEach(element => {
      ['x', 'y', 'z'].forEach(xyz => {
        document.querySelector(`#new-model-${element}-${xyz}`).value = ((element === 'scale') ? 1 : 0);
      });
    });
  }
  setStatus('modelAdd1');
});

['position', 'rotation', 'scale'].forEach(element => {
  ['x', 'y', 'z'].forEach(xyz => {
    document.querySelector(`#new-model-${element}-${xyz}`).addEventListener('input', transformUploadModel);
    document.querySelector(`#model-${element}-${xyz}`).addEventListener('input', transformModel);
  });
});

renderer.domElement.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  return false;
}, false);

renderer.domElement.addEventListener('mousemove', function(e) {
  // Set cursor
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (status === 'adjustpath') {
    renderer.domElement.style.cursor = "url(img/chokoku-cursor.svg) 5 5, auto";
    // boolean演算後のsegmentsは⏳のような図形にはない
    for (let i = 0; i < chokokuPath.curves.length; i++) {
      if (
        chokokuPath.curves[i].point1.x - 5 < mouseX &&
        chokokuPath.curves[i].point1.x + 5 > mouseX &&
        chokokuPath.curves[i].point1.y - 5 < mouseY &&
        chokokuPath.curves[i].point1.y + 5 > mouseY &&
        hoverPoint === -1
      ) {
        pointCircles[i].fillColor = '#aaa';
        hoverPoint = i;
        renderer.domElement.style.cursor = "default";
      } else {
        pointCircles[i].fillColor = '#fff';
      }
    }
    pathHovering = !(chokokuPath.hitTest(mouseX, mouseY) === null);
    if (pathHovering && hoverPoint === -1) {
      if (isMouseClicking) {
        renderer.domElement.style.cursor = "grabbing";
      } else {
        renderer.domElement.style.cursor = "grab";
      }
    }
    if (!isMouseClicking) {
      hoverPoint = -1;
    } else if (hoverPoint !== -1) {
      chokokuPath.curves[hoverPoint].point1.set(mouseX, mouseY);
      pointCircles[hoverPoint].position.set(mouseX, mouseY)
    } else if (pathHovering) {
      for (let i = 0; i < chokokuPath.curves.length; i++) {
        chokokuPath.curves[i].point1.x += mouseX - pathGrabingOriginX;
        chokokuPath.curves[i].point1.y += mouseY - pathGrabingOriginY;
        pointCircles[i].position.x += mouseX - pathGrabingOriginX;
        pointCircles[i].position.y += mouseY - pathGrabingOriginY;
      }
      pathGrabingOriginX = mouseX;
      pathGrabingOriginY = mouseY;
    }
  } else if (status === 'paint') {
    let mouse = toScreenXY(new THREE.Vector2(mouseX, mouseY));
    raycaster.setFromCamera(mouse, camera);
    let intersectObject = raycaster.intersectObject(model)[0];
    // MaterialIndexから色を付ける
    if (intersectObject !== undefined) {
      let materialIndex = intersectObject.face.materialIndex;
      // ↓違う面にカーソルが入ったとき
      if (hoverIndex !== materialIndex) {
        // ↓もし前は面が選択されていなかったら先ほどの面の色をもとに戻す
        if (hoverIndex !== -1) {
          setColorByMaterialIndex(hoverIndex);
        }
        // ↓新しい面のIDをつける
        hoverIndex = materialIndex;
        // ↓選択中の面に色を付ける処理
        setColorByMaterialIndex(materialIndex, document.querySelector('#model-color').value);
      }
    } else {
      // ↓物体からカーソルが外れたとき
      if (hoverIndex !== -1) {
        setColorByMaterialIndex(hoverIndex);
        hoverIndex = -1;
      }
    }
    model.geometry.colorsNeedUpdate = true;
  }
});

renderer.domElement.addEventListener('click', function(e) {
  if (status === 'setpath') {
    if (nowPath.segments.length === 0) {
      nowPath.moveTo(e.clientX, e.clientY);
      let pointCircle = new paper.Path.Circle(new paper.Point(e.clientX, e.clientY), 5);
      pointCircle.strokeColor = '#000';
      pointCircle.fillColor = '#fff';
      pointCircles.push(pointCircle);
    } else if (pointCircles[0].fillColor.toCSS() === 'rgb(255,255,255)') {
      nowPath.lineTo(e.clientX, e.clientY);
    } else {
      // ---------- paper.jsで外側の先だけに（内部の線をなくす） ----------
      // boolean演算で大きな長方形と交差する部分を求める
      // 本来はcanvasに描画するので、仮のcanvasが必要
      nowPath.removeSegment(nowPath.segments.length - 1);
      nowPath.lineTo(nowPath.segments[0].point);
      let resultPath;
      resultPath = nowPath.unite(chokokuPath); // このタイミングで前に出て来る
      chokokuPath.remove(); // resultPathのremoveはboolean処理の後にやりたかったので
      chokokuPath = resultPath;
      for (let i = nowPath.segments.length - 1; i >= 0; i--) {
        nowPath.removeSegment(i);
      }
      chokokuPath.sendToBack();
      pointCircles[0].remove();
      pointCircles = [];
      renderer.domElement.style.cursor = "url(img/chokoku-cursor.svg) 5 5, auto";
      removeCursorPath = false;
    }
  } else if (status === 'paint') {
    faceColors[hoverIndex] = document.querySelector('#model-color').value;
  }
});

renderer.domElement.addEventListener('mousedown', function() {
  isMouseClicking = true;
  if (status === 'adjustpath' && pathHovering) {
    pathGrabingOriginX = mouseX;
    pathGrabingOriginY = mouseY;
  }
});

renderer.domElement.addEventListener('mouseup', function() {
  isMouseClicking = false;
})

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

viewRenderer.domElement.addEventListener('mouseout', function() {
  for (let i = 0;i < viewBoxAngles.length;i++) {
    viewBoxAngles[i].material.opacity = 0.2;
  }
});

viewRenderer.domElement.addEventListener('click', function(e) {
  let leftPx = viewRenderer.domElement.getBoundingClientRect().left;
  let topPx = viewRenderer.domElement.getBoundingClientRect().top;
  viewMouse.copy(toScreenXY(new THREE.Vector2(e.clientX - leftPx, e.clientY - topPx), 100, 100));
  viewRaycast.setFromCamera(viewMouse, viewCamera);
  let intersectObjects = viewRaycast.intersectObjects(viewBoxAngles);
  if (intersectObjects.length >= 1) {
    // ↓lookAtとcameraのlengthはOrbitControls自動で設定してくれるが、lookAtは1フレームくらい後に設定される事がある
    camera.position.copy(intersectObjects[0].object.position.clone().normalize().setLength(camera.position.length()));
    camera.lookAt(new THREE.Vector3());
  }
});

undoBtn.addEventListener('click', function() {
  if (!undoBtn.classList.contains('disabled')) {
    if (undoNowModelId !== 0) {
      undoNowModelId--;
    }
    if (undoNowModelId === 0) {
      undoBtn.classList.add('disabled');
    }
    redoBtn.classList.remove('disabled');
    removeMesh(model);
    model = undoBuffer[undoNowModelId];
    scene.add(model);
  }
});

redoBtn.addEventListener('click', function() {
  if (!redoBtn.classList.contains('disabled')) {
    if (undoNowModelId !== undoBuffer.length - 1) {
      undoNowModelId++;
    }
    if (undoNowModelId === undoBuffer.length - 1) {
      redoBtn.classList.add('disabled');
    }
    undoBtn.classList.remove('disabled');
    removeMesh(model);
    model = undoBuffer[undoNowModelId];
    scene.add(model);
  }
});

function setModelFromChokoku() {
  // 決定
  setStatus('setpath');
  let pathShape = new THREE.Shape();
  let originI = 0;
  for (let i = 0; i < chokokuPath.curves.length; i++) {
    let screenVec = toScreenXY(new THREE.Vector2(
      chokokuPath.curves[i].point1.x, chokokuPath.curves[i].point1.y
    ));
    if (
      i === 0 ||
      (chokokuPath.curves[i].point1.x === chokokuPath.curves[i - 1].point2.x &&
      chokokuPath.curves[i].point1.y === chokokuPath.curves[i - 1].point2.y)
    ) {
      if (pathShape.currentPoint.x === 0 && pathShape.currentPoint.y === 0) {
        pathShape.moveTo(
          screenVec.x * (screenWidth / 7) / camera.zoom,
          screenVec.y * (screenHeight / 7) / camera.zoom
        );
      } else {
        pathShape.lineTo(
          screenVec.x * (screenWidth / 7) / camera.zoom,
          screenVec.y * (screenHeight / 7) / camera.zoom
        );
      }
    } else {
      // moveTo (Three.jsのmoveToはうまく行かなかったので、その代わりにunion)
      screenVec = toScreenXY(new THREE.Vector2(
        chokokuPath.curves[originI].point1.x, chokokuPath.curves[originI].point1.y
      ));
      pathShape.lineTo(
        screenVec.x * (screenWidth / 7) / camera.zoom,
        screenVec.y * (screenHeight / 7) / camera.zoom
      );
      originI = i;
      chokokuHole = createNewMeshFromPath(chokokuHole, pathShape);
      pathShape = new THREE.Shape();
    }
  }
  // moveTo (Three.jsのmoveToはうまく行かなかったので、その代わりにunion)
  let screenVec = toScreenXY(new THREE.Vector2(
    chokokuPath.curves[originI].point1.x, chokokuPath.curves[originI].point1.y
  ));
  pathShape.lineTo(
    screenVec.x * (screenWidth / 7) / camera.zoom,
    screenVec.y * (screenHeight / 7) / camera.zoom
  );
  chokokuHole = createNewMeshFromPath(chokokuHole, pathShape);
  let chokokuHoleBSP; // ThreeBSPインスタンス
  let modelBSP; // ThreeBSPインスタンス
  let resultModelBSP;
  let resultModel;
  try {
    chokokuHoleBSP = new ThreeBSP(chokokuHole) // ThreeBSPインスタンス
    modelBSP = new ThreeBSP(model) // ThreeBSPインスタンス
    if (document.querySelector('#chokoku-setting-lock-btn').classList.contains('selected')) {
      if (lockObject === undefined) {
        resultModelBSP = modelBSP.intersect(chokokuHoleBSP);
      } else {
        let lockObjectBSP = new ThreeBSP(lockObject);
        if (document.querySelector('#chokoku-setting-eraser-btn').classList.contains('selected')) {
          resultModelBSP = lockObjectBSP.subtract(chokokuHoleBSP);
        } else {
          resultModelBSP = lockObjectBSP.union(modelBSP.intersect(chokokuHoleBSP));
        }
      }
    } else {
      if (document.querySelector('#chokoku-setting-eraser-btn').classList.contains('selected')) {
        resultModelBSP = modelBSP.subtract(chokokuHoleBSP);
      } else {
        resultModelBSP = modelBSP.intersect(chokokuHoleBSP);
      }
    }
    if (document.querySelector('#chokoku-setting-lock-btn').classList.contains('selected')) {
      scene.remove(lockObject);
      lockObject = resultModelBSP.toMesh(new THREE.MeshPhongMaterial({
        color: 0xff0000,
        depthTest: false,
        transparent: true,
        opacity: 0.6
      }));
      scene.add(lockObject);
    } else {
      if (lockObject === undefined) {
        resultModel = resultModelBSP.toMesh(model.material);
      } else {
        let lockObjectBSP = new ThreeBSP(lockObject);
        resultModel = resultModelBSP.union(lockObjectBSP).toMesh(model.material);
      }

      // ------- 同一面データ作成 -------
    
      // ブーリアン処理後にはmaterialIndexが削除されるので自分でつける
      // 共通する法線ベクトルを持つ面を調べる
      let oldFaceNormals = [...faceNormals];
      let oldFaceColors = [...faceColors];
      faceNormals = [];
      faceColors = [];
      for (let i = 0;i < resultModel.geometry.faces.length;i++) {
        let faceNormal = resultModel.geometry.faces[i].normal;
        let materialIndex;
        let sameNormalIndex = findSameNormal(faceNormals, faceNormal);
        // 同じmaterialIndexは連続するとは限らない！！
        if (sameNormalIndex !== null) {
          // すでに今の面と同じ法線ベクトルの面が登録済み
          // materialIndex = resultModel.geometry.faces[i - 1].materialIndex;
          materialIndex = sameNormalIndex;
        } else {
          let oldNormalIndex = findSameNormal(oldFaceNormals, faceNormal);
          faceNormals.push(faceNormal);
          faceColors.push(oldNormalIndex === null ? "#ffffff" : oldFaceColors[oldNormalIndex]);
          materialIndex = faceNormals.length - 1;
        }
        resultModel.geometry.faces[i].materialIndex = materialIndex;
        resultModel.geometry.faces[i].color.set(faceColors[materialIndex]);
      }
      scene.remove(model);
      model = resultModel;
      scene.add(model);
      recordModel(model);
    }
  } catch (error) {
    statusBar.innerHTML = '<span style="color: #ff0000;">エラーが発生しました。</span>';
    console.log(error);
  }
  chokokuHole = undefined;
  chokokuPath.remove();
  chokokuPath = new paper.Path();
}

function createNewMeshFromPath(chokokuHole, pathShape) {
  const nowPath3dLen = 300;
  let nowPath3d = new THREE.Mesh(
    new THREE.ExtrudeGeometry(pathShape, {
      bevelEnabled: false,
      amount: nowPath3dLen
    }),
    new THREE.MeshStandardMaterial({color: 0xffffff, wireframe: true})
  );
  nowPath3d.position.copy(camera.position.clone().setLength(nowPath3dLen / 2).negate());
  nowPath3d.lookAt(camera.position);
  if (chokokuHole === undefined) {
    chokokuHole = nowPath3d;
  } else {
    let chokokuHoleBSP = new ThreeBSP(chokokuHole);
    let nowPath3dBSP = new ThreeBSP(nowPath3d);
    chokokuHoleBSP = chokokuHoleBSP.union(nowPath3dBSP);
    chokokuHole = chokokuHoleBSP.toMesh();
  }
  return chokokuHole;
}

function setModel(JSONData, isAdd = false) {
  let JSONLoader = new THREE.ObjectLoader();
  let dataBlob = 'data:application/json,' + encodeURIComponent(JSON.stringify(JSONData));
  JSONLoader.load(dataBlob, function(mesh) {
    if (isAdd) {
      uploadModel = mesh.clone();
      let uploadModelPosition = uploadModel.position.clone();
      let uploadModelRotation = uploadModel.rotation.clone();
      let uploadModelScale = uploadModel.scale.clone();
      ['x', 'y', 'z'].forEach(xyz => {
        document.querySelector(`#new-model-position-${xyz}`).value = uploadModelPosition[xyz]
        document.querySelector(`#new-model-rotation-${xyz}`).value = uploadModelRotation[xyz]
        document.querySelector(`#new-model-scale-${xyz}`).value = uploadModelscale[xyz]
      });
      if (uploadModel.geometry.type === 'BufferGeometry') {
        let modelGeometry = new THREE.Geometry();
        let modelMaterial = uploadModel.material;
        model.material.vertexColors = THREE.FaceColors;
        modelGeometry.fromBufferGeometry(uploadModel.geometry);
        uploadModel = new THREE.Mesh(
          modelGeometry,
          modelMaterial
        );
      }
      uploadModel.scale.set(...uploadModelScale.toArray());
      uploadModel.position.set(...uploadModelPosition.toArray());
      uploadModel.rotation.set(...uploadModelRotation.toArray());
      scene.add(uploadModel);
      document.querySelector('#file-upload-add-step1').classList.add('hidden');
      document.querySelector('#file-upload-add-step2').classList.remove('hidden');
      setStatus('modelAdd2');
    } else {
      model = mesh.clone();
      if (model.geometry.type === 'BufferGeometry') {
        let modelGeometry = new THREE.Geometry();
        let modelMaterial = model.material;
        model.material.vertexColors = THREE.FaceColors;
        modelGeometry.fromBufferGeometry(model.geometry);
        model = new THREE.Mesh(modelGeometry, modelMaterial);
      }
      scene.add(model);
      mask.classList.add('hidden');
      startModal.classList.add('hidden');
      cursorSphere = new THREE.Mesh(
        new THREE.SphereGeometry((modelWidth + modelHeight + modelDepth) / 3 / 20, 32, 32),
        new THREE.MeshLambertMaterial({color: 0xff0000, transparent: true, opacity: 0.5})
      );
      scene.add(cursorSphere);
      cursorSphere.visible = false;

      document.querySelector('#model-color').value = '#' + model.material.color.getHex().toString(16);
      document.querySelector('#model-color-btn').style.background = document.querySelector('#model-color').value;
      document.querySelector('#model-roughness').value = model.material.roughness;
      document.querySelector('#model-metalness').value = model.material.metalness;

      setStatus('setpath');
    
      // Start main loop
      render();
    }
  });
}

function toScreenXY(point, width = screenWidth, height = screenHeight) {
  point.x = (point.x / width) * 2 - 1;
  point.y = -(point.y / height) * 2 + 1;
  return point;
}

function setStatus(statusName) {
  if (status === 'setpath' || status === 'adjustpath') {
    // ↓chokoku同士のstatusの変化ではなかったら
    if (statusName !== 'setpath' && statusName !== 'adjustpath') {
      removeCursorPath = false;
      for (let i = nowPath.segments.length - 1; i >= 0; i--) {
        nowPath.removeSegment(i);
      }
      if (pointCircles.length === 1 && statusName === 'setpath') pointCircles[0].remove();
    }
    document.querySelector(`#chokoku-tool`).classList.remove('selected');
    document.querySelector(`#chokoku-setting`).classList.add('hidden');
  } else if (document.querySelector(`#${status}-tool`) !== null) {
    document.querySelector(`#${status}-tool`).classList.remove('selected');
    document.querySelector(`#${status}-setting`).classList.add('hidden');
  }
  if (statusName === 'setpath' || statusName === 'adjustpath') {
    document.querySelector(`#chokoku-tool`).classList.add('selected');
    document.querySelector(`#chokoku-setting`).classList.remove('hidden');
  } else if (document.querySelector(`#${statusName}-tool`) !== null) {
    document.querySelector(`#${statusName}-tool`).classList.add('selected');
    document.querySelector(`#${statusName}-setting`).classList.remove('hidden');
  }

  status = statusName;
  statusBar.textContent = statusBarTexts[status];
  if (status === 'setpath' || status === 'adjustpath') {
    renderer.domElement.style.cursor = "url(img/chokoku-cursor.svg) 5 5, auto";
  } else if (document.querySelector(`#${status}-tool`) !== null) {
    renderer.domElement.style.cursor = `url(img/${status}-cursor.svg) 5 5, auto`;
  }
}

function isSameNormal(normal1, normal2) {
  return normal1.x.toFixed(3) === normal2.x.toFixed(3) &&
  normal1.y.toFixed(3) === normal2.y.toFixed(3) &&
  normal1.z.toFixed(3) === normal2.z.toFixed(3);
}

function findSameNormal(normals, normal) {
  for (let i = 0; i < normals.length; i++) {
    if (isSameNormal(normals[i], normal)) return i;
  }
  return null;
}

// zoom
function setZoom(zoomScale) {
  if (zoomScale >= 0 && zoomScale <= 3) {
    let defaultCameraDistanceFromOrigin = defaultPosition.length();
    let zoomValue = defaultCameraDistanceFromOrigin / zoomScale;
    camera.position.setLength(zoomValue);
  }
}

function transformUploadModel() {
  uploadModel.position.set(
    document.querySelector('#new-model-position-x').value,
    document.querySelector('#new-model-position-y').value,
    document.querySelector('#new-model-position-z').value
  );
  uploadModel.rotation.set(
    THREE.Math.degToRad(document.querySelector('#new-model-rotation-x').value),
    THREE.Math.degToRad(document.querySelector('#new-model-rotation-y').value),
    THREE.Math.degToRad(document.querySelector('#new-model-rotation-z').value)
  );
  uploadModel.scale.set(
    document.querySelector('#new-model-scale-x').value,
    document.querySelector('#new-model-scale-y').value,
    document.querySelector('#new-model-scale-z').value
  );
}

function transformModel() {
  model.position.set(
    document.querySelector('#model-position-x').value,
    document.querySelector('#model-position-y').value,
    document.querySelector('#model-position-z').value
  );
  model.rotation.set(
    THREE.Math.degToRad(document.querySelector('#model-rotation-x').value),
    THREE.Math.degToRad(document.querySelector('#model-rotation-y').value),
    THREE.Math.degToRad(document.querySelector('#model-rotation-z').value)
  );
  model.scale.set(
    document.querySelector('#model-scale-x').value,
    document.querySelector('#model-scale-y').value,
    document.querySelector('#model-scale-z').value
  );
}

function setColorByMaterialIndex(index, color = false) {
  let foundIndex = false;
  model.geometry.sortFacesByMaterialIndex();
  for (let i = 0;i < model.geometry.faces.length;i++) {
    let nowMaterialIndex = model.geometry.faces[i].materialIndex;
    if (nowMaterialIndex === index && !foundIndex) foundIndex = true;
    if (foundIndex) {
      if (nowMaterialIndex !== index) break;
      if (color) {
        model.geometry.faces[i].color.set(color);
      } else {
        // 設定されていなければfaceColorsに基づいて色を設定する
        model.geometry.faces[i].color.set(faceColors[index]);
      }
    }
  }
}

function removeMesh(mesh) {
  scene.remove(mesh);
  if (mesh) {
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
}

function recordModel() {
  if (undoBuffer.length >= 3) {
    undoBuffer.shift();
  }
  undoBuffer.splice(undoNowModelId + 1, undoBuffer.length - 1 - undoNowModelId);
  undoBuffer.push(model.clone());
  undoNowModelId = undoBuffer.length - 1;
  if (undoNowModelId >= 1) {
    undoBtn.classList.remove('disabled');
    redoBtn.classList.add('disabled');
    undoNowModelId = undoBuffer.length - 1;
  }
}

// Main loop

function render() {
  requestAnimationFrame(render);
  viewCamera.position.set(...camera.position.normalize().setLength(250).toArray());
  viewCamera.lookAt(viewScene.position);

  renderer.render(scene, camera);
  viewRenderer.render(viewScene, viewCamera);

  controls.update();

  // --------- canvas ---------
  if (status === 'setpath' || status === 'adjustpath') {
    nowPath.dashOffset += 0.5;
    chokokuPath.dashOffset += 0.5;
    if (status === 'setpath' && nowPath.segments.length > 0) {
      if (removeCursorPath) {
        nowPath.removeSegment(nowPath.segments.length - 1);
      } else {
        removeCursorPath = true;
      }
      nowPath.lineTo(mouseX, mouseY);
      renderer.domElement.style.cursor = "url(img/chokoku-cursor.svg) 5 5, auto";
      if (
        nowPath.segments[0].point.x - 5 < mouseX &&
        nowPath.segments[0].point.x + 5 > mouseX &&
        nowPath.segments[0].point.y - 5 < mouseY &&
        nowPath.segments[0].point.y + 5 > mouseY
      ) {
        pointCircles[0].fillColor = '#aaa';
        renderer.domElement.style.cursor = "default";
      } else {
        pointCircles[0].fillColor = '#fff';
      }
    }
  }
}
