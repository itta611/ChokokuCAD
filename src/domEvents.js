import * as gui from './gui.js';
import {setModelFromChokoku} from './chokokuTool.js';
import {exportFile} from './export.js';
import {transformUploadModel, unionUploadMeshToModel, loader, setUploadModel} from './loader.js';
import {i18n} from './i18n.js';
import {undo, redo} from './undo.js';
import {status, statuses} from './status.js';
import {createModel} from './renderer.js';
import {updateGrid, getNearGridPoint, removeGrid} from './grid.js';
import {addCopyPreviewMesh, transformCopyMesh, unionCopyMeshToModel} from './copy.js';
export let mouseX, mouseY;
let notSaved = false;

export function flagNotSaved(bool) {
  notSaved = bool;
}

function setMousePos(x, y) {
  if (gui.isSnapCheck.checked && statuses[status].group === 'setpath') {
    [mouseX, mouseY] = getNearGridPoint(x, y);
  } else {
    mouseX = x;
    mouseY = y;
  }
}

window.addEventListener('beforeunload', function(e) {
  if (notSaved) {
    e.returnValue = i18n('ページを離れようとしています。よろしいですか？', 'Are you sure?');
  }
});

window.addEventListener('keyup', function(e) {
  if (status === 'setpath' && e.key === 'Enter') {
    setModelFromChokoku();
  }
});

document.querySelector('#enter-btn').addEventListener('click', function() {
  setModelFromChokoku();
});

window.addEventListener('load', function() {
  setTimeout(function() {
    endParallax();
    document.querySelector('#loading-mask').style.display = 'none';
  }, 2000);

  window.mainCanvas.addEventListener('mousemove', function(e) {
    setMousePos(e.clientX, e.clientY);
  });
  
  window.mainCanvas.addEventListener('click', function(e) {
    setMousePos(e.clientX, e.clientY);
  });

  window.mainCanvas.addEventListener('wheel', function() {
    gui.updateScreenSize();
  }, false);
});

window.addEventListener('resize', function() {
  gui.updateScreenSize();
  if (isSnapCheck.checked) updateGrid();
});

gui.createBtn.addEventListener('click', function() {
  gui.hideStartModal();
  createModel();
}, {once: true});

gui.isSnapCheck.addEventListener('change', function() {
  if (gui.isSnapCheck.checked) {
    gui.gridSizeInput.disabled = false;
    gui.gridSizeInput.parentElement.classList.remove('disabled');
    updateGrid();
    if (isSnapCheck.checked) updateGrid();
  } else {
    gui.gridSizeInput.disabled = true;
    gui.gridSizeInput.parentElement.classList.add('disabled');
    removeGrid();
  }
});

gui.gridSizeInput.addEventListener('change', function() {
  updateGrid();
});

gui.exportBtn.addEventListener('click', function() {
  const fileName = gui.exportFileNameInput.value;
  exportFile(fileName);
});

gui.fileUploadAdd.addEventListener('change', async function(e) {
  setUploadModel(await loader(gui.fileUploadAdd, e.target.files[0].name), true);
  gui.settingUploadStep1.classList.add('hidden');
  gui.settingUploadStep2.classList.remove('hidden');
  gui.fileUploadAdd.value = '';
});

gui.uploadBtn.addEventListener('change', async function(e) {
  setUploadModel(await loader(gui.uploadBtn, e.target.files[0].name));
  gui.uploadBtn.value = '';
});

['position', 'rotation', 'scale'].forEach(element => {
  ['x', 'y', 'z'].forEach(xyz => {
    document.querySelector(`#new-model-${element}-${xyz}`).addEventListener('input', transformUploadModel);
    document.querySelector(`#copy-model-${element}-${xyz}`).addEventListener('input', transformCopyMesh);
    // document.querySelector(`#model-${element}-${xyz}`).addEventListener('input', transformModel);
  });
});

gui.fileUploadApplyBtn.addEventListener('click', function() {
  setTimeout(function() {
    unionUploadMeshToModel();
    gui.settingUploadStep1.classList.remove('hidden');
    gui.settingUploadStep2.classList.add('hidden');
    // init
    ['position', 'rotation', 'scale'].forEach(element => {
      ['x', 'y', 'z'].forEach(xyz => {
        document.querySelector(`#new-model-${element}-${xyz}`).value = (element === 'scale') * 1;
      });
    });
  }, 10);
});

gui.copyBtn.addEventListener('click', function() {
  addCopyPreviewMesh();
  gui.settingCopyStep1.classList.add('hidden');
  gui.settingCopyStep2.classList.remove('hidden');
});

gui.copyApplyBtn.addEventListener('click', function() {
  unionCopyMeshToModel();
  gui.settingCopyStep1.classList.remove('hidden');
  gui.settingCopyStep2.classList.add('hidden');
  // init
  ['position', 'rotation', 'scale'].forEach(element => {
    ['x', 'y', 'z'].forEach(xyz => {
      document.querySelector(`#copy-model-${element}-${xyz}`).value = (element === 'scale') * 1;
    });
  });
});

gui.undoBtn.addEventListener('click', function() {
  if (!gui.undoBtn.classList.contains('disabled')) undo();
});

gui.redoBtn.addEventListener('click', function() {
  if (!gui.redoBtn.classList.contains('disabled')) redo();
});