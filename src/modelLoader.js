import {model, scene, updateModel, startRender, transformMesh} from './renderer.js'
import {hideStartModal} from './gui.js';
import {statuses} from './status.js';
import {groupFace} from './faceGroup.js';
import {i18n} from './i18n.js';
import 'three/GLTFLoader';
import 'three/STLLoader';

let uploadModel;
function onReaderLoad(reader, fileName, isAdd) {
  if (new RegExp('([^\s]+(\\.stl)$)', 'i').test(fileName)) {
    let stlBlob = reader.result;
    let STLLoader = new THREE.STLLoader();
    STLLoader.load(stlBlob, function(modelGeometry) {
      uploadModel = new THREE.Mesh(
        modelGeometry,
        new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 1, vertexColors: THREE.FaceColors})
      );
      setUploadModel(isAdd)
    }, function() {}, function(e) {
      alert(i18n('エラーが発生しました。', 'An error has occurred.'));
      throw new Error(e);
    });
  } else if (new RegExp('([^\s]+(\\.(glb|gltf))$)', 'i').test(fileName)) {
    let GLTFLoader = new THREE.GLTFLoader();
    let gltfBlob = reader.result;
    GLTFLoader.load(gltfBlob, function(arg) {
      uploadModel = arg.scene.children[0];
      if (uploadModel.geometry === undefined) {
        alert(i18n('申し訳ありませんが、このファイルには対応していません。\n代わりにSTL形式でアップロードしてみてください。', 'Sorry, this file format is not supported. \nPlease uploading in STL format instead.'));
      }
      setUploadModel(isAdd)
    }, function() {}, function (e) {
      alert(i18n('エラーが発生しました。', 'An error has occurred.'));
      throw new Error(e);
    })
  } else {
    alert(i18n('ファイル形式が無効です（.glb, .gltf, .stlのみ）', 'The file format is not supported.(.glb, .gltf, .stl are supported.)'));
  }
}

export function loader(element, fileName, isAdd) {
  let reader = new FileReader();
  reader.readAsDataURL(element.files[0]);
  reader.addEventListener('load', function() {
    onReaderLoad(reader, fileName, isAdd);
  });
}

export function transformUploadModel() {
  transformMesh(uploadModel, 'new');
}

function setUploadModel(isAdd) {
  if (isAdd) {
    let uploadModelPosition = uploadModel.position;
    let uploadModelRotation = uploadModel.rotation;
    let uploadModelScale = uploadModel.scale;
    ['x', 'y', 'z'].forEach(xyz => {
      document.querySelector(`#new-model-position-${xyz}`).value = uploadModelPosition[xyz];
      document.querySelector(`#new-model-rotation-${xyz}`).value = uploadModelRotation[xyz];
      document.querySelector(`#new-model-scale-${xyz}`).value = uploadModelScale[xyz];
    });
    if (uploadModel.geometry.type === 'BufferGeometry') {
      let modelGeometry = new THREE.Geometry();
      let modelMaterial = uploadModel.material;
      // modelMaterial.depthTest = false;
      model.material.vertexColors = THREE.FaceColors;
      modelGeometry.fromBufferGeometry(uploadModel.geometry);
      uploadModel = new THREE.Mesh(
        modelGeometry,
        modelMaterial
      );
    }
    model.material.opacity = 0.7;
    model.material.transparent = true;
    uploadModel.scale.copy(uploadModelScale);
    uploadModel.position.copy(uploadModelPosition);
    uploadModel.rotation.copy(uploadModelRotation);
    scene.add(uploadModel);
    statuses['modelAdd2'].change();
  } else {
    updateModel(uploadModel);
    if (model.geometry.type === 'BufferGeometry') {
      let modelGeometry = new THREE.Geometry();
      let modelMaterial = model.material;
      model.material.vertexColors = THREE.FaceColors;
      modelGeometry.fromBufferGeometry(model.geometry);
      updateModel(new THREE.Mesh(modelGeometry, modelMaterial));
    }
    scene.add(model);
    hideStartModal();

    document.querySelector('#model-color-btn').style.background = document.querySelector('#model-color').value;
  
    // Start main loop
    startRender();
  }
}

export function unionUploadMeshToModel() {
  let uploadModelBSP = new ThreeBSP(uploadModel);
  let modelBSP = new ThreeBSP(model);
  let newModelBSP = modelBSP.union(uploadModelBSP);
  let newModel = newModelBSP.toMesh(model.material);
  scene.remove(uploadModel);
  model.material.opacity = 1;
  model.material.transparent = false;
  groupFace(newModel);
  updateModel(newModel.clone(), true);
}