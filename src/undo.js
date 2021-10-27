import {undoBtn, redoBtn} from './gui.js';
import {model, removeMesh, updateModel} from './renderer.js';
import {updateLockObject, lockObject} from './chokokuTool.js';
let undoBuffer = [];
let undoNowModelId = 0;

export function recordModel() {
  if (undoBuffer.length >= 3) {
    undoBuffer.shift(); // 最初の要素を削除
  }
  undoBuffer.push([model, lockObject]);
  undoNowModelId = undoBuffer.length - 1;
  if (undoNowModelId >= 1) {
    undoBtn.classList.remove('disabled');
    redoBtn.classList.add('disabled');
    undoNowModelId = undoBuffer.length - 1;
  }
}

function applyModel() {
  console.log(undoBuffer);
  if (typeof undoBuffer[undoNowModelId][1] !== 'undefined') {
    updateLockObject(undoBuffer[undoNowModelId][1]);
  } else {
    if (typeof lockObject !== 'undefined') {
      lockObject.visible = false;
      removeMesh(lockObject);
      updateLockObject(undefined);
    }
    updateModel(undoBuffer[undoNowModelId][0], false);
  }
}

export function undo() {
  undoNowModelId--;
  if (undoNowModelId === 0) undoBtn.classList.add('disabled');
  redoBtn.classList.remove('disabled');
  applyModel();
}

export function redo() {
  undoNowModelId++;
  if (undoNowModelId >= undoBuffer.length - 2) redoBtn.classList.add('disabled');
  undoBtn.classList.remove('disabled');
  applyModel();
}