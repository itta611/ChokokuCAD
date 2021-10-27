import {pathCanvas, screenWidth, screenHeight} from './gui.js';
import {mouseX, mouseY} from "./pathCanvas.js";
import {status, statuses} from './status.js';
let gridSize = 10;
let screenGridSize = 30;
let canvasWidth = screenWidth - 300;
let gridCountY = Math.ceil(screenHeight / screenGridSize);
let gridCountX = Math.ceil(canvasWidth / screenGridSize);
let gridYLines = [];
let gridXLines = [];

export function initGrid() {
  // for (let i = -gridCountY / 2;i < gridCountY / 2;i++) {
  //   gridYLines.push(new paper.Path.Line(
  //     new paper.Point(0, (i * screenGridSize) + screenHeight / 2),
  //     new paper.Point(canvasWidth, (i * screenGridSize) + screenHeight / 2)
  //   ));
  //   gridYLines[gridYLines.length - 1].strokeColor = '#fff';
  //   gridYLines[gridYLines.length - 1].sendToBack();
  // }
  // for (let i = -gridCountX / 2;i < gridCountX / 2;i++) {
  //   gridXLines.push(new paper.Path.Line(
  //     new paper.Point((i * screenGridSize) + canvasWidth / 2, 0),
  //     new paper.Point((i * screenGridSize) + canvasWidth / 2, screenHeight)
  //   ));
  //   gridXLines[gridXLines.length - 1].strokeColor = '#fff';
  //   gridXLines[gridXLines.length - 1].sendToBack();
  // }
}