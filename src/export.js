import {model} from './renderer.js';
import {flagNotSaved} from './domEvents.js';
import 'three/GLTFExporter';

export function exportFile(fileName) {
  if (fileName !== '') {
    flagNotSaved(false);
    let exporter = new THREE.GLTFExporter();
    let fileContent;
    exporter.parse(model, function(arg) {
      fileContent = JSON.stringify(arg);
      let a = document.createElement('a');
      a.href = 'data:application/octet-stream,' + encodeURIComponent(fileContent);
      a.download = `${fileName}.glb`;
      a.click();
    });
  } else {
    alert(i18n('ファイル名を入力してください。', 'Please input the file name.'));
  }
}