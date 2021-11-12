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
export const fileUploadApplyBtn = document.querySelector('#file-upload-add-step2 .btn');
export const settingUploadStep1 = document.querySelector('#file-upload-add-step1');
export const settingUploadStep2 = document.querySelector('#file-upload-add-step2');
export const exportBtn = document.querySelector('#export-setting .btn');
export const exportFileNameInput = document.querySelector('#export-file-name');
export const isSnapCheck = document.querySelector('#chokoku-setting-issnap');
export const gridSizeInput = document.querySelector('#grid-size');
export const startAddBtn = document.querySelector('#add-step1 .btn');
export const applyAddModelBtn = document.querySelector('#add-step2 #add-btn');
export const settingAddCancelBtn = document.querySelector('#add-step2 #add-cancel-btn');
export const settingAddStep1 = document.querySelector('#add-step1');
export const settingAddStep2 = document.querySelector('#add-step2');
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