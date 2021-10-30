import './rangeBackground.js';

export const createBtn = document.querySelector('#size-input-wrap .btn');
export const uploadBtn = document.querySelector('#file-upload-start');
export const mask = document.querySelector('#mask');
export const startModal = document.querySelector('#start-modal');
export const statusBar = document.querySelector('#status-bar');
export const undoBtn = document.querySelector('#undo-btn');
export const redoBtn = document.querySelector('#redo-btn');
export const pathCanvas = document.querySelector('#path-canvas');
export const fileUploadAdd = document.querySelector('#file-upload-add');
export const exportBtn = document.querySelector('#export-setting .btn');
export const isSnapCheck = document.querySelector('#chokoku-setting-issnap');
export const gridSizeInput = document.querySelector('#grid-size');
export let screenWidth;
export let screenHeight;
updateScreenSize();

export function updateScreenSize() {
  screenWidth = document.documentElement.clientWidth;
  screenHeight = document.documentElement.clientHeight;
  // For retina display
  pathCanvas.style.width = `${screenWidth}px`;
  pathCanvas.style.height = `${screenHeight}px`;
}

export function hideStartModal() {
  mask.classList.add('hidden');
  startModal.classList.add('hidden');
}