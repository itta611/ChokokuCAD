import {undoBtn, redoBtn} from './gui.js';
import {model, updateModel, updateFaceBuffer, faces, faceColors} from './renderer.js';
import {updateLockObject, lockObject} from './chokokuTool.js';
let undoBuffer = [];
let currentModelId = 0;

export function recordModel() {
  if (undoBuffer.length >= 5) {
    undoBuffer.shift(); // 最初の要素を削除
  }
  undoBuffer.push([model, lockObject, faces, faceColors]);
  currentModelId = undoBuffer.length - 1;
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
    if (typeof lockObject !== 'undefined') updateLockObject(undefined);
    updateModel(undoBuffer[currentModelId][0], false);
    updateFaceBuffer(undoBuffer[currentModelId][2], undoBuffer[currentModelId][3]);
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