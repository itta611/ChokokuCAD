import {camera, renderer, scene, controls} from './renderer.js';
import {viewCamera, viewRenderer, viewScene} from './viewBox.js';
import {status} from './status.js';
import {nowPath, chokokuPath, pointCircles, mouseX, mouseY} from './pathCanvas.js';
let removeCursorPath = false;

export function render() {
  requestAnimationFrame(render);
  viewCamera.position.set(...camera.position.normalize().setLength(250).toArray());
  viewCamera.lookAt(viewScene.position);

  renderer.render(scene, camera);
  viewRenderer.render(viewScene, viewCamera);

  controls.update();

  // --------- canvas ---------
  if (status === 'setpath' || status === 'adjustpath') {
    nowPath.dashOffset += 0.5;
    chokokuPath.dashOffset += 0.5;
    if (nowPath.dashOffset >= 100) { // for stack overflow
      nowPath.dashOffset = 0;
      chokokuPath.dashOffset = 0;
    }
    if (status === 'setpath' && nowPath.segments.length > 0) {
      if (removeCursorPath) { // Deletes the segment at the second or later frame after setpath.
        nowPath.removeSegment(nowPath.segments.length - 1);
      } else {
        removeCursorPath = true;
      }
      nowPath.lineTo(mouseX, mouseY);
      renderer.domElement.style.cursor = "url('img/chokoku-cursor.svg') 5 5, auto";
      if (
        nowPath.segments[0].point.x - 5 < mouseX &&
        nowPath.segments[0].point.x + 5 > mouseX &&
        nowPath.segments[0].point.y - 5 < mouseY &&
        nowPath.segments[0].point.y + 5 > mouseY
      ) {
        pointCircles[0].fillColor = '#aaa';
        renderer.domElement.style.cursor = 'default';
      } else {
        pointCircles[0].fillColor = '#fff';
      }
    }
  }
}

export function modifyRemoveCursorPath(bool) {
  removeCursorPath = bool;
}