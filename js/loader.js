import {model} from './main.js'

let uploadModel;
function onReaderLoad(reader, fileName) {
  return new Promise(function (resolve) {
    reader.addEventListener('load', function () {
      let uploadModelJSON;
      if (new RegExp('([^\s]+(\\.stl)$)', 'i').test(fileName)) {
        let stlBlob = reader.result;
        let STLLoader = new THREE.STLLoader();
        STLLoader.load(stlBlob, function (modelGeometry) {
          uploadModel = new THREE.Mesh(
            modelGeometry,
            new THREE.MeshStandardMaterial(model.material)
          );
          uploadModelJSON = uploadModel.toJSON();
          resolve(uploadModelJSON);
        }, function () { }, function () {
          alert(i18n('エラーが発生しました。', 'An error has occurred.'));
        });
      } else if (new RegExp('([^\s]+(\\.(glb|gltf))$)', 'i').test(fileName)) {
        let GLTFLoader = new THREE.GLTFLoader();
        let gltfBlob = reader.result;
        GLTFLoader.load(gltfBlob, function (arg) {
          uploadModel = arg.scene.children[0];
          if (uploadModel.geometry === undefined) {
            alert(i18n('申し訳ありませんが、このファイルには対応していません。\n代わりにSTL形式でアップロードしてみてください。', 'Sorry, this file format is not supported. \nPlease uploading in STL format instead.'));
          } else {
            uploadModelJSON = uploadModel.toJSON();
          }
          resolve(uploadModelJSON);
        }, function () { }, function (uploadError) {
          alert(i18n('エラーが発生しました。', 'An error has occurred'));
          console.log(uploadError);
        })
      } else {
        alert(i18n('ファイル形式が無効です（.glb, .gltf, .stlのみ）', 'The file format is not supported.(.glb, .gltf, .stl are supported.)'));
      }
    });
  });
}

export default async function(element, fileName) {
  let reader = new FileReader();
  reader.readAsDataURL(element.files[0]);
  return await onReaderLoad(reader, fileName);
}