[![build](https://github.com/itta611/ChokokuCAD/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/itta611/ChokokuCAD/actions/workflows/build.yml)
<img src="./static/img/logo.svg" height="300">

Chokoku CAD can create complex shapes with few and simple controls.

https://chokokucad.itta.dev

<img src="./static/img/sample1.png" height="300"> <img src="./static/img/video.gif" height="300">
## Installation
This requires node.js and npm to be installed.

```
git clone https://github.com/itta611/ChokokuCAD.git
cd ChokokuCAD
npm install
```

## Running
run:
```
npm run start
```
Then go to [http://localhost:8603/](http://localhost:8603/)

## How to use Chokoku tool
### Make path
Click the screen to create the path.
Click start point to close.

### Editing path
Select the edit icon<img src="./static/img/chokoku-setting-edit.svg" width="30"> and move the segments.

### Shave model
Select the path add icon<img src="./static/img/chokoku-setting-add.svg" width="30"> and click OK button or press Enter key.

### Lock
Maybe you want to create a shape with holes like a cup.
To do so, select the lock icon<img src="./static/img/chokoku-setting-lock.svg" width="30">, and the Chokoku tool will not shave off the area selected by the path.

## Credits
- THREE.js (https://github.com/mrdoob/three.js)
- paper.js (https://github.com/paperjs/paper.js)
- ThreeBSP (https://github.com/sshirokov/ThreeBSP)
