import {faces, faceColors, initFaceBuffer, model} from './renderer.js';

export function groupFace(resultModel) {
  let oldFaces = [...faces];
  let oldFaceColors = [...faceColors];
  initFaceBuffer();
  for (let i = 0;i < resultModel.geometry.faces.length;i++) {
    let currentFace = resultModel.geometry.faces[i];
    let materialIndex;
    let sameNormalIndex = findSameGroup(faces, currentFace, resultModel);
    if (sameNormalIndex !== null) {
      materialIndex = sameNormalIndex;
    } else {
      let oldNormalIndex = findSameGroup(oldFaces, currentFace, resultModel);
      faces.push(currentFace);
      faceColors.push(oldNormalIndex === null ? '#ffffff' : oldFaceColors[oldNormalIndex]);
      materialIndex = faces.length - 1;
    }
    resultModel.geometry.faces[i].materialIndex = materialIndex;
    resultModel.geometry.faces[i].color.set(faceColors[materialIndex]);
  }
}

function findSameGroup(faces, face, resultModel) {
  for (let i = 0; i < faces.length; i++) {
    const newestModel = resultModel || model;
    const degToPoint = THREE.Math.radToDeg(face.normal.clone().angleTo(newestModel.geometry.vertices[face.a].clone().sub(newestModel.geometry.vertices[faces[i].a]))).toFixed(3);
    if (
      isSameNormal(faces[i].normal, face.normal) &&
        (+degToPoint === 90 ||
        Number.isNaN(+degToPoint))
    ) {
      return i;
    }
  }
  return null;
}

function isSameNormal(normal1, normal2) {
  return +normal1.x.toFixed(3) === +normal2.x.toFixed(3) &&
    +normal1.y.toFixed(3) === +normal2.y.toFixed(3) &&
    +normal1.z.toFixed(3) === +normal2.z.toFixed(3);
}