import {model} from './renderer.js';
import {flagNotSaved} from './domEvents.js';
import 'three/GLTFExporter';
import 'three/STLExporter';

export function exportFile(fileName) {
  if (fileName !== '') {
    flagNotSaved(false);
    let GLTFExporter = new THREE.GLTFExporter();
    let STLExporter = new THREE.STLExporter();
    let fileContent;
    let fileFormat = document.querySelector('#export-file-format').options[document.querySelector('#export-file-format').selectedIndex].value;
    if (fileFormat === 'gltf') {
      GLTFExporter.parse(model, function(arg) {
        fileContent = JSON.stringify(arg);
        let a = document.createElement('a');
        a.href = 'data:application/octet-stream,' + encodeURIComponent(fileContent);
        a.download = `${fileName}.gltf`;
        a.click();
      });
    } else if (fileFormat === 'stl') {
      console.log(STLExporter)
      let arg = STLExporter.parse(model, { binary: true })
      fileContent = JSON.stringify(arg);
      let a = document.createElement('a');
      a.href = 'data:application/octet-stream,' + encodeURIComponent(fileContent);
      a.download = `${fileName}.stl`;
      a.click();
    }
  } else {
    alert(i18n('ファイル名を入力してください。', 'Please input the file name.'));
  }
}