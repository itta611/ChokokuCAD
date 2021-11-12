import {model, scene, removeMesh, updateModel, modelWidth, modelHeight, modelDepth} from './renderer.js';
import {initBufferModel as initModelBuffer} from './chokokuTool.js';
let modelBuffer;

export function addPreviewMesh() {
  modelBuffer = model.clone();
  removeMesh(model);
  scene.add(modelBuffer);
  updateModel(new THREE.Mesh(
    new THREE.BoxGeometry(modelWidth, modelHeight, modelDepth),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1,
      vertexColors: THREE.FaceColors,
      transparent: true,
      opacity: 0.3
    })
  ));
  scene.add(model);
}

// export function transformCopyMesh() {
//   transformMesh(previewMesh, 'copy');
// }

export function unionCopyMeshToModel() {
  let newMeshBSP = new ThreeBSP(model);
  let modelBSP = new ThreeBSP(modelBuffer);
  let newModelBSP = modelBSP.union(newMeshBSP);
  let newModel = newModelBSP.toMesh(modelBuffer.material);
  initModelBuffer();
  removeMesh(model);
  removeMesh(modelBuffer);
  updateModel(newModel.clone(), true);
}