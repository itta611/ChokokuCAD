import {language} from './i18n.js';
import {statusBar} from './gui.js';
import {statuses, status} from './status.js';
import {renderer} from './renderer.js';
import {nowPath, pointCircles} from './pathCanvas.js';
let toolItems = [];

export class ToolItem {
  constructor(option) {
    this.domName = option.domName;
    this.status = option.status;
    this.domElement = document.querySelector(`#${this.domName}-tool`);
    this.settingDomElement = document.querySelector(`#${this.domName}-setting`);
    this.onUnselected = option.onUnselected ?? function() {};
    this.onSelected = option.onSelected ?? function() {};
    this.statuses = option.statuses ?? [this.status];

    this.domElement.addEventListener('click', () => {
      statuses[this.status].change();
    });

    this.domElement.addEventListener('mouseover', () => {
      if (language === 'ja') {
        statusBar.textContent = `[${statuses[this.status].name}] ${statuses[this.status].desc}`;
      } else {
        statusBar.textContent = `[${statuses[this.status].group}] ${statuses[this.status].descEn}`;
      }
    });

    this.domElement.addEventListener('mouseout', () => {
      if (language === 'ja') {
        statusBar.textContent = `[${statuses[status].name}] ${statuses[status].desc}`;
      } else {
        statusBar.textContent = `[${statuses[status].group}] ${statuses[status].descEn}`;
      }
    });
  }

  select() {
    this.domElement.classList.add('selected');
    this.settingDomElement.classList.remove('hidden');
    renderer.domElement.style.cursor = 'default';
    this.onSelected();
  }

  unSelect() { 
    this.domElement.classList.remove('selected');
    this.settingDomElement.classList.add('hidden');
    this.onUnselected();
    console.log(`${this.domName}: unselected`);
  }
}

toolItems['setpath'] = new ToolItem(
  {domName: 'chokoku', status: 'setpath', statuses: ['setpath', 'adjustpath'], 
  onSelected: function() {
    renderer.domElement.style.cursor = "url('img/chokoku-cursor.svg') 5 5, auto";
  },
  onUnselected: function() {
    // removeCursorPath = false;
    if (status !== 'setpath' && status !== 'adjustpath') {
      for (let i = nowPath.segments.length - 1; i >= 0; i--) {
        nowPath.removeSegment(i);
      }
      if (pointCircles.length === 1) pointCircles[0].remove();
    }
  }}
);
toolItems['paint'] = new ToolItem(
  {domName: 'paint', status: 'paint',
  onSelected: function() {
    renderer.domElement.style.cursor = "url('img/paint-cursor.svg') 5 5, auto";
  }
});
toolItems['upload'] = new ToolItem(
  {domName: 'upload', status: 'modelAdd1', statuses: ['modelAdd1', 'modelAdd2']}
);
toolItems['export'] = new ToolItem({domName: 'export', status: 'export'});

export {toolItems};
