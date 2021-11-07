import {model, scene, transformMesh, removeMesh, updateModel} from './renderer.js';
let copyMesh;

export function addCopyPreviewMesh() {
  copyMesh = model.clone();
  copyMesh.material = new THREE.MeshBasicMaterial({
    color: 0xefab00
  });
  scene.add(copyMesh);
}

export function transformCopyMesh() {
  transformMesh(copyMesh, 'copy');
}

export function unionCopyMeshToModel() {
  let copyMeshBSP = new ThreeBSP(copyMesh);
  let modelBSP = new ThreeBSP(model);
  let newModelBSP = modelBSP.union(copyMeshBSP);
  let newModel = newModelBSP.toMesh(model.material);
  copyMesh.visible = false;
  removeMesh(model);
  model.visible = false;
  updateModel(newModel.clone(), true);
}