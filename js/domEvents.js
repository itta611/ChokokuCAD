import {createBtn, isSnapCheck, fileUploadAdd, uploadBtn, exportBtn, updateScreenSize, undoBtn, redoBtn, hideStartModal} from './gui.js';
import {setModelFromChokoku} from './chokokuTool.js';
import {exportFile} from './export.js';
import {transformUploadModel, unionToModel, loader, setUploadModel} from './loader.js';
import {i18n} from './i18n.js';
import {undo, redo} from './undo.js';
import {status, statuses} from './status.js';
import {createModel} from './renderer.js';
export let mouseX, mouseY;
let notSaved = false;

export function flagNotSaved(bool) {
  notSaved = bool;
}

function setMousePos(x, y) {
  if (isSnapCheck.checked && statuses[status].group === 'setpath') {
    mouseX = (x + 25) - x % 50;
    mouseY = (y + 25) - y % 50;
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
  document.querySelector('#loading-mask').style.display = 'none';

  window.mainCanvas.addEventListener('mousemove', function(e) {
    setMousePos(e.clientX, e.clientY);
  });
  
  window.mainCanvas.addEventListener('click', function(e) {
    setMousePos(e.clientX, e.clientY);
  });
});

window.addEventListener('resize', updateScreenSize);

createBtn.addEventListener('click', function() {
  hideStartModal();
  createModel();
}, {once: true});

exportBtn.addEventListener('click', function() {
  const fileName = document.querySelector('#export-file-name').value;
  exportFile(fileName);
});

fileUploadAdd.addEventListener('change', async function(e) {
  setUploadModel(await loader(fileUploadAdd, e.target.files[0].name), true);
});

uploadBtn.addEventListener('change', async function(e) {
  setUploadModel(await loader(uploadBtn, e.target.files[0].name));
});

['position', 'rotation', 'scale'].forEach(element => {
  ['x', 'y', 'z'].forEach(xyz => {
    document.querySelector(`#new-model-${element}-${xyz}`).addEventListener('input', transformUploadModel);
    // document.querySelector(`#model-${element}-${xyz}`).addEventListener('input', transformModel);
  });
});

document.querySelector('#file-upload-add-step2 .btn').addEventListener('click', function() {
  this.textContent = i18n('処理中...', 'Progressing...');
  setTimeout(function() {
    this.textContent = i18n('決定', 'OK');
    unionToModel();
    document.querySelector('#file-upload-add-step1').classList.remove('hidden');
    document.querySelector('#file-upload-add-step2').classList.add('hidden');
    // 初期化
    ['position', 'rotation', 'scale'].forEach(element => {
      ['x', 'y', 'z'].forEach(xyz => {
        document.querySelector(`#new-model-${element}-${xyz}`).value = (element === 'scale') * 1;
      });
    });
  });
});

undoBtn.addEventListener('click', function() {
  if (!undoBtn.classList.contains('disabled')) undo();
});

redoBtn.addEventListener('click', function() {
  if (!redoBtn.classList.contains('disabled')) redo();
});