import {screenHeight, gridSizeInput} from './gui.js';
import {camera} from './renderer.js'; // TODO: move to renderer.js
let gridXLines = [];
let gridYLines = [];
export function updateGrid() {
  let gridSize = gridSizeInput.value;
  removeGrid();
  let canvasWidth = window.mainCanvas.width / 2; // support retina
  const cameraHeight = window.mainCanvas.height / 7;
  const screenGridSize = gridSize / cameraHeight * screenHeight * camera.zoom; // grid size in screen pixels at the current camera zoom
  let gridCountY = Math.ceil(screenHeight / screenGridSize); // number of grid lines to draw
  let gridCountX = Math.ceil(canvasWidth / screenGridSize); 
  gridCountX = gridCountX % 2 == 0 ? gridCountX : gridCountX + 1; // make sure the number of grid lines is odd
  gridCountY = gridCountY % 2 == 0 ? gridCountY : gridCountY + 1;
  for (let i = -gridCountY / 2;i < gridCountY / 2;i++) { // draw the grid lines
    gridYLines.push(new paper.Path.Line(
      new paper.Point(0, (i * screenGridSize) + screenHeight / 2),
      new paper.Point(canvasWidth, (i * screenGridSize) + screenHeight / 2)
    ));
    gridYLines[gridYLines.length - 1].strokeColor = '#fff';
    gridYLines[gridYLines.length - 1].sendToBack();
  }
  for (let i = -gridCountX / 2;i < gridCountX / 2;i++) { // draw the grid lines
    gridXLines.push(new paper.Path.Line(
      new paper.Point((i * screenGridSize) + canvasWidth / 2, 0),
      new paper.Point((i * screenGridSize) + canvasWidth / 2, screenHeight)
    ));
    gridXLines[gridXLines.length - 1].strokeColor = '#fff';
    gridXLines[gridXLines.length - 1].sendToBack();
  }
}

export function removeGrid() {
  if (gridXLines.length !== 0) {
    for (let i = 0; i < gridXLines.length; i++) {
      gridXLines[i].visible = false;
      gridXLines[i].remove();
    }
    for (let i = 0; i < gridYLines.length; i++) {
      gridYLines[i].visible = false;
      gridYLines[i].remove();
    }
    gridXLines = [];
    gridYLines = [];
  }
}

export function getNearGridPoint(mouseX, mouseY) {
  let gridSize = gridSizeInput.value;
  let canvasWidth = window.mainCanvas.width / 2; // Screen width in pixels
  let cameraHeight = window.mainCanvas.height / 7; // THREE.js camera height
  let screenGridSize = gridSize / cameraHeight * screenHeight * camera.zoom; // grid size in screen pixels at the current camera zoom
  let gridX = Math.floor((mouseX - canvasWidth / 2 + gridSize / 2) / screenGridSize);
  let gridY = Math.floor((mouseY - screenHeight / 2 + gridSize / 2) / screenGridSize);
  return [gridX * screenGridSize + canvasWidth / 2, gridY * screenGridSize + screenHeight / 2];
}