import {undoBtn, redoBtn} from './gui.js';
import {model, removeMesh, updateModel} from './renderer.js';
import {updateLockObject, lockObject} from './chokokuTool.js';
let undoBuffer = [];
let currentModelId = 0;

export function recordModel() {
  if (undoBuffer.length >= 3) {
    undoBuffer.shift(); // 最初の要素を削除
  }
  undoBuffer.push([model, lockObject]);
  currentModelId = undoBuffer.length - 1;
  console.log(currentModelId)
  if (currentModelId >= 1) {
    undoBtn.classList.remove('disabled');
    redoBtn.classList.add('disabled');
    currentModelId = undoBuffer.length - 1;
  }
}

function applyModel() {
  if (typeof undoBuffer[currentModelId][1] !== 'undefined') {
    updateLockObject(undoBuffer[currentModelId][1]);
  } else {
    if (typeof lockObject !== 'undefined') {
      lockObject.visible = false;
      removeMesh(lockObject);
      updateLockObject(undefined);
    }
    updateModel(undoBuffer[currentModelId][0], false);
  }
}

export function undo() {
  currentModelId--;
  if (currentModelId === 0) undoBtn.classList.add('disabled');
  redoBtn.classList.remove('disabled');
  applyModel();
}

export function redo() {
  currentModelId++;
  if (currentModelId >= undoBuffer.length - 1) redoBtn.classList.add('disabled');
  undoBtn.classList.remove('disabled');
  applyModel();
}