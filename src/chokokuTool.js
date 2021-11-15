import {chokokuPath, setPrevPathFromChokokuPath} from './pathCanvas.js';
import {flagNotSaved} from './domEvents.js';
import {statuses} from './status.js';
import {camera, toScreenXY, model, scene, updateModel} from './renderer.js';
import {screenWidth, screenHeight, statusBar} from './gui.js';
import {i18n, language} from './i18n.js';
import {groupFace} from './faceGroup.js';
import 'ThreeBSP';
let lockObject;
let chokokuHole;
let resultModel;

export function updateLockObject(mesh) {
  scene.remove(lockObject);
  lockObject = mesh;
  if (mesh) {
    lockObject.visible = true;
    scene.add(lockObject);
  }
  flagNotSaved(true);
}

export function setModelFromChokoku() {
  // 決定
  if (chokokuPath.segments !== undefined && chokokuPath.segments.length <= 2) {
    statusBar.innerHTML = '<span style="color: #ff0000;">頂点は３つ以上用意する必要があります。</span>';
    setTimeout(function() {
      if (language === 'ja') {
        statusBar.textContent = `[${statuses[status].name}] ${statuses[status].desc}`;
      } else {
        statusBar.textContent = `[${status}] ${statuses[status].descEn}`;
      }
    }, 1000);
    return;
  }
  statuses['setpath'].change();
  let pathShape = new THREE.Shape();
  let originIndex = 0;
  console.log(chokokuPath)
  for (let i = 0;i < chokokuPath.curves.length;i++) {
    // if (pathShape.currentPoint.x === 0 &&
    //   pathShape.currentPoint.y === 0) continue;
    let screenVec;
    if (
      i === 0 ||
      (chokokuPath.curves[i].point1.x !== chokokuPath.curves[i - 1].point2.x &&
      chokokuPath.curves[i].point1.y !== chokokuPath.curves[i - 1].point2.y)
      // pathShape.currentPoint.x === 0 &&
      // pathShape.currentPoint.y === 0
    ) {
      if (i !== 0) {
        screenVec = toScreenXY(new THREE.Vector2(
          chokokuPath.curves[0].point1.x, chokokuPath.curves[0].point1.y
        ));
        console.log('lineto (last)', screenVec)
        pathShape.lineTo(
          screenVec.x * ((screenWidth - 330) / 7) / camera.zoom,
          screenVec.y * (screenHeight / 7) / camera.zoom
        );
      }

      screenVec = toScreenXY(new THREE.Vector2(
        chokokuPath.curves[originIndex].point1.x, chokokuPath.curves[originIndex].point1.y
      ));
      console.log('moveto', screenVec)
      // console.log(pathShape.currentPoint.y);
      pathShape.moveTo(
        screenVec.x * ((screenWidth - 330) / 7) / camera.zoom,
        screenVec.y * (screenHeight / 7) / camera.zoom
      );
      console.log(pathShape.curves);

      originIndex = i;
      chokokuHole = createNewMeshFromPath(chokokuHole, pathShape);
    } else {
      screenVec = toScreenXY(new THREE.Vector2(
        chokokuPath.curves[i].point1.x, chokokuPath.curves[i].point1.y
      ));
      console.log('lineto ', screenVec);
      pathShape.lineTo(
        screenVec.x * ((screenWidth - 330) / 7) / camera.zoom,
        screenVec.y * (screenHeight / 7) / camera.zoom
      );
      pathShape = new THREE.Shape();
    }
  }
  let screenVec = toScreenXY(new THREE.Vector2(
    chokokuPath.curves[originIndex].point1.x, chokokuPath.curves[originIndex].point1.y
  ));
  console.log('lineto', screenVec)
  pathShape.lineTo(
    screenVec.x * ((screenWidth - 330) / 7) / camera.zoom,
    screenVec.y * (screenHeight / 7) / camera.zoom
  );
  console.log(pathShape)

  chokokuHole = createNewMeshFromPath(chokokuHole, pathShape);
  let chokokuHoleBSP;
  let modelBSP;
  // try {
    chokokuHoleBSP = new ThreeBSP(chokokuHole) // ThreeBSPインスタンス
    modelBSP = new ThreeBSP(model) // ThreeBSPインスタンス
    const isEraser = document.querySelector('#chokoku-setting-eraser-btn').classList.contains('selected');
    const isLock = lockObject === undefined || lockObject.geometry.faces.length == 0;
    if (document.querySelector('#chokoku-setting-lock-btn').classList.contains('selected')) { // Lock tool
      let lockObjectBSP;
      if (isLock) { // If first lock
        if (!isEraser) {
          lockObjectBSP = modelBSP.intersect(chokokuHoleBSP);
        }
      } else {
        lockObjectBSP = new ThreeBSP(lockObject);
        if (isEraser) {
          lockObjectBSP = lockObjectBSP.subtract(chokokuHoleBSP);
        } else {
          lockObjectBSP = lockObjectBSP.union(modelBSP.intersect(chokokuHoleBSP));
        }
      }
      scene.remove(lockObject);
      lockObject = lockObjectBSP.toMesh(new THREE.MeshPhongMaterial({
        color: 0xff0000,
        depthTest: false,
        transparent: true,
        opacity: 0.6
      }));
      scene.add(lockObject);
    } else { // Chokoku tool
      let resultModelBSP;
      if (isEraser) {
        resultModelBSP = modelBSP.subtract(chokokuHoleBSP);
      } else {
        resultModelBSP = modelBSP.intersect(chokokuHoleBSP);
      }
      resultModel = resultModelBSP.toMesh(model.material);
      if (!isLock) {
        let lockObjectBSP = new ThreeBSP(lockObject);
        let resultModelBSP = new ThreeBSP(resultModel);
        resultModel = resultModelBSP.union(lockObjectBSP).toMesh(model.material);
      }
    }

    // Set model
    if (document.querySelector('#chokoku-setting-chokoku-btn').classList.contains('selected')) { // Chokoku tool
      // ------- create face group by finding same fame normals -------
      groupFace(resultModel);
      updateModel(resultModel, true);
    }
  // } catch (error) {
    // statusBar.innerHTML = `<span style='color: #ff0000;'>${i18n('エラーが発生しました。', 'An error has occurred.')}</span>`;
    // setTimeout(function() {
    //   if (language === 'ja') {
    //     statusBar.textContent = `[${statuses[status].name}] ${statuses[status].desc}`;
    //   } else {
    //     statusBar.textContent = `[${status}] ${statuses[status].descEn}`;
    //   }
    // }, 1000);
    // console.log(error);
  // }
  chokokuHole = undefined;
  setPrevPathFromChokokuPath();
  document.querySelector('#reuse-btn').textContent = i18n('一つ前のパスを使用', 'Use previous path');
  document.querySelector('#reuse-btn').classList.remove('disabled');
}

function createNewMeshFromPath(chokokuHole, pathShape) {
  const nowPath3dLen = 300;
  let nowPath3d = new THREE.Mesh(
    new THREE.ExtrudeGeometry(pathShape, {
      bevelEnabled: false,
      amount: nowPath3dLen
    }),
    new THREE.MeshStandardMaterial({color: 0, wireframe: true})
  );
  nowPath3d.position.copy(camera.position.clone().setLength(nowPath3dLen / 2).negate());
  nowPath3d.lookAt(camera.position);
  chokokuHole = nowPath3d;
  scene.add(chokokuHole)
  return chokokuHole;
}

export {lockObject};