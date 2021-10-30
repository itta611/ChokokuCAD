import {pathCanvas, screenWidth, screenHeight} from './gui.js';
import {mouseX, mouseY} from './domEvents.js';
import {renderer} from './renderer.js';
import {status, statuses} from './status.js';
import {modifyRemoveCursorPath} from './render.js';
import {i18n} from './i18n.js';

let nowPath;
let chokokuPath;
let prevPath;
let pathHovering = false;
let pathGrabbingOriginX;
let pathGrabbingOriginY;
let pointCircles = [];
let isMouseClicking = false;
let hoverPoint = -1;

export function setPrevPathFromChokokuPath() {
  prevPath = chokokuPath.clone();
  prevPath.visible = false;
  chokokuPath.visible = false;
  chokokuPath = new paper.Path();
}

window.addEventListener('load', function() {
  pathCanvas.width = screenWidth - 330;
  pathCanvas.height = screenHeight;
  
  paper.setup(pathCanvas);
  chokokuPath = new paper.Path();
  nowPath = new paper.Path();
  nowPath.fillColor = 'rgba(255, 255, 255, 0.6)';
  nowPath.dashArray = [2, 2];
  nowPath.strokeColor = '#000';
  chokokuPath.fillColor = 'rgba(255, 255, 255, 0.6)';
  chokokuPath.dashArray = [2, 2];
  chokokuPath.strokeColor = '#000';
  chokokuPath.sendToBack();

  renderer.domElement.addEventListener('mousedown', function() {
    isMouseClicking = true;
    if (status === 'adjustpath' && pathHovering) {
      pathGrabbingOriginX = mouseX;
      pathGrabbingOriginY = mouseY;
    }
    if (pathHovering && hoverPoint !== -1 && renderer.domElement.style.cursor !== 'grabbing') {
      renderer.domElement.style.cursor = 'grabbing';
    }
  });
  
  renderer.domElement.addEventListener('mouseup', function() {
    isMouseClicking = false;
    if (renderer.domElement.style.cursor === 'grabbing') {
      renderer.domElement.style.cursor = 'grab';
    }
  })

  renderer.domElement.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  }, false);

  renderer.domElement.addEventListener('mousemove', function(e) {
    // Set cursor
    if (status === 'adjustpath') {
      for (let i = 0; i < chokokuPath.curves.length; i++) {
        if (
          chokokuPath.curves[i].point1.x - 5 < mouseX &&
          chokokuPath.curves[i].point1.x + 5 > mouseX &&
          chokokuPath.curves[i].point1.y - 5 < mouseY &&
          chokokuPath.curves[i].point1.y + 5 > mouseY
        ) {
          pointCircles[i].fillColor = '#aaa';
          if (hoverPoint === -1) hoverPoint = i;
        } else {
          pointCircles[i].fillColor = '#fff';
        }
      }
      pathHovering = !(chokokuPath.hitTest(mouseX, mouseY) === null);
      // setting cursor
      if (hoverPoint !== -1) {
        renderer.domElement.style.cursor = 'default';
      } else if (pathHovering && hoverPoint === -1) {
        if (renderer.domElement.style.cursor !== 'grabbing') {
          renderer.domElement.style.cursor = 'grab';
        }
      } else if (!pathHovering && hoverPoint === -1) {
        renderer.domElement.style.cursor = 'url(./static/img/chokoku-cursor.svg) 5 5, auto';
      }
  
      if (!isMouseClicking) {
        hoverPoint = -1; // init hoverpoint when mouse up
      } else if (hoverPoint !== -1) {
        chokokuPath.curves[hoverPoint].point1.set(mouseX, mouseY);
        pointCircles[hoverPoint].position.set(mouseX, mouseY)
      } else if (pathHovering) {
        for (let i = 0; i < chokokuPath.curves.length; i++) {
          chokokuPath.curves[i].point1.x += mouseX - pathGrabbingOriginX;
          chokokuPath.curves[i].point1.y += mouseY - pathGrabbingOriginY;
          pointCircles[i].position.x += mouseX - pathGrabbingOriginX;
          pointCircles[i].position.y += mouseY - pathGrabbingOriginY;
        }
        pathGrabbingOriginX = mouseX;
        pathGrabbingOriginY = mouseY;
      }
    }
  });
  
  renderer.domElement.addEventListener('click', function() {
    if (status === 'setpath') {
      if (nowPath.segments.length === 0) {
        nowPath.moveTo(mouseX, mouseY);
        nowPath.bringToFront();
        let pointCircle = new paper.Path.Circle(new paper.Point(mouseX, mouseY), 5);
        pointCircle.strokeColor = '#000';
        pointCircle.fillColor = '#fff';
        pointCircles.push(pointCircle);
      } else if (pointCircles[0].fillColor.toCSS() === 'rgb(255,255,255)') {
        nowPath.lineTo(mouseX, mouseY);
      } else {
        nowPath.removeSegment(nowPath.segments.length - 1);
        nowPath.lineTo(nowPath.segments[0].point);
        let resultPath;
        resultPath = nowPath.unite(chokokuPath);
        chokokuPath.remove();
        chokokuPath = resultPath;
        for (let i = nowPath.segments.length - 1; i >= 0; i--) {
          nowPath.removeSegment(i);
        }
        pointCircles[0].remove();
        pointCircles = [];
        renderer.domElement.style.cursor = 'url(./static/img/chokoku-cursor.svg) 5 5, auto';
        modifyRemoveCursorPath(false);
      }
    }
  });
});

window.addEventListener('resize', function() {
  pathCanvas.width = screenWidth - 330;
  pathCanvas.height = screenHeight;
});

document.querySelector('#chokoku-setting-chokoku-btn').addEventListener('click', function() {
  document.querySelector('#chokoku-setting-lock-btn').classList.remove('selected');
  if (document.querySelector('#chokoku-setting-eraser-btn').classList.contains('selected')) {
    nowPath.fillColor = 'rgba(0, 123, 255, 0.5)';
    chokokuPath.fillColor = 'rgba(0, 123, 255, 0.5)';
  } else {
    nowPath.fillColor = 'rgba(255, 255, 255, 0.6)';
    chokokuPath.fillColor = 'rgba(255, 255, 255, 0.6)';
  }
  this.classList.add('selected');
});

document.querySelector('#chokoku-setting-lock-btn').addEventListener('click', function() {
  document.querySelector('#chokoku-setting-chokoku-btn').classList.remove('selected');
  if (document.querySelector('#chokoku-setting-eraser-btn').classList.contains('selected')) {
    nowPath.fillColor = 'rgba(123, 255, 123, 0.5)';
    chokokuPath.fillColor = 'rgba(123, 255, 123, 0.5)';
  } else {
    nowPath.fillColor = 'rgba(255, 0, 0, 0.6)';
    chokokuPath.fillColor = 'rgba(255, 0, 0, 0.6)';
  }
  this.classList.add('selected');
});

document.querySelector('#chokoku-setting-add-btn').addEventListener('click', function() {
  document.querySelector('#chokoku-setting-edit-btn').classList.remove('selected');
  document.querySelector('#chokoku-setting-add-mode-params').classList.remove('hidden');
  document.querySelector('#chokoku-setting .btn').parentNode.classList.remove('hidden');
  this.classList.add('selected');
  nowPath.visible = true;
  statuses['setpath'].change();
  let firstI = 0;
  if (nowPath.curves.length > 0) { // パスが作りかけの場合
    pointCircles[0].visible = true;
    firstI = 1;
  }
  for (let i = firstI; i < pointCircles.length; i++) {
    pointCircles[i].remove();
  }
  if (firstI === 0) {
    pointCircles = [];
  } else {
    pointCircles = [pointCircles[0]];
  }
})

document.querySelector('#chokoku-setting-edit-btn').addEventListener('click', function() {
  document.querySelector('#chokoku-setting-add-btn').classList.remove('selected');
  document.querySelector('#chokoku-setting-add-mode-params').classList.add('hidden');
  document.querySelector('#chokoku-setting .btn').parentNode.classList.add('hidden');
  document.querySelector('#chokoku-setting-issnap').parentNode.parentNode.classList.add('hidden');
  this.classList.add('selected');
  statuses['adjustpath'].change();
  nowPath.visible = false;
  hoverPoint = -1;
  if (nowPath.curves.length > 0) pointCircles[0].visible = false;
  for (let i = 0; i < chokokuPath.curves.length; i++) {
    let pointCircle = new paper.Path.Circle(
      chokokuPath.curves[i].point1, 5
    );
    pointCircle.strokeColor = '#000';
    pointCircle.fillColor = '#fff';
    pointCircles.push(pointCircle);
  }
});

document.querySelector('#chokoku-setting-pencil-btn').addEventListener('click', function() {
  document.querySelector('#chokoku-setting-eraser-btn').classList.remove('selected');
  if (document.querySelector('#chokoku-setting-lock-btn').classList.contains('selected')) {
    nowPath.fillColor = 'rgba(255, 0, 0, 0.6)';
    chokokuPath.fillColor = 'rgba(255, 0, 0, 0.6)';
  } else {
    nowPath.fillColor = 'rgba(255, 255, 255, 0.6)';
    chokokuPath.fillColor = 'rgba(255, 255, 255, 0.6)';
  }
  this.classList.add('selected');
});

document.querySelector('#chokoku-setting-eraser-btn').addEventListener('click', function() {
  document.querySelector('#chokoku-setting-pencil-btn').classList.remove('selected');
  if (document.querySelector('#chokoku-setting-lock-btn').classList.contains('selected')) {
    nowPath.fillColor = 'rgba(123, 255, 123, 0.5)';
    chokokuPath.fillColor = 'rgba(123, 255, 123, 0.5)';
  } else {
    nowPath.fillColor = 'rgba(0, 123, 255, 0.5)';
    chokokuPath.fillColor = 'rgba(0, 123, 255, 0.5)';
  }
  this.classList.add('selected');
});

document.querySelector('#reuse-btn').addEventListener('click', function() {
  if (document.querySelector('#reuse-btn').classList.contains('disabled')) return;
  if (this.textContent === i18n('一つ前のパスを使用', 'Use previous path')) {
    this.textContent = i18n('新しいパスを使う', 'Use new path');
    chokokuPath = prevPath;
    chokokuPath.visible = true; // visible property of prevPath is false by default
  } else {
    this.textContent = i18n('一つ前のパスを使用', 'Use previous path');
    chokokuPath.visible = false;
    pointCircles = [];
  }
});

export {nowPath, chokokuPath, prevPath, pointCircles, mouseX, mouseY};
