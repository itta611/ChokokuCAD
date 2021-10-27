import {renderer, toScreenXY, raycaster, model, faceColors, camera} from './renderer.js';
import {status} from './status.js';
import {mouseX, mouseY} from './domEvents.js';
let hoverIndex = -1;

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

window.addEventListener('load', function() {
  renderer.domElement.addEventListener('mousemove', function() {
    if (status === 'paint') {
      let mouse = toScreenXY(new THREE.Vector2(mouseX, mouseY));
      raycaster.setFromCamera(mouse, camera);
      let intersectObject = raycaster.intersectObject(model)[0];
      // MaterialIndexから色を付ける
      if (intersectObject !== undefined) {
        let materialIndex = intersectObject.face.materialIndex;
        // ↓違う面にカーソルが入ったとき
        if (hoverIndex !== materialIndex) {
          // ↓もし前は面が選択されていたら先ほどの面の色をもとに戻す
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

  renderer.domElement.addEventListener('click', function() {
    if (status === 'paint') {
      faceColors[hoverIndex] = document.querySelector('#model-color').value;
    }
  });
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