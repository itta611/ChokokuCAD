import {model} from 'renderer.js';

export function transformModel() {
  model.position.set(
    document.querySelector('#model-position-x').value,
    document.querySelector('#model-position-y').value,
    document.querySelector('#model-position-z').value
  );
  model.rotation.set(
    THREE.Math.degToRad(document.querySelector('#model-rotation-x').value),
    THREE.Math.degToRad(document.querySelector('#model-rotation-y').value),
    THREE.Math.degToRad(document.querySelector('#model-rotation-z').value)
  );
  model.scale.set(
    document.querySelector('#model-scale-x').value,
    document.querySelector('#model-scale-y').value,
    document.querySelector('#model-scale-z').value
  );
}