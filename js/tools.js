import {language} from './i18n.js';
import {statusBar} from './gui.js';
import {statuses, status} from './status.js';
import {renderer} from './renderer.js';
import {chokokuPath, nowPath, pointCircles} from './pathCanvas.js';
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

  unSelect(statusTo) { 
    this.domElement.classList.remove('selected');
    this.settingDomElement.classList.add('hidden');
    this.onUnselected(statusTo);
  }
}

toolItems['setpath'] = new ToolItem(
  {domName: 'chokoku', status: 'setpath', statuses: ['setpath', 'adjustpath'], 
  onSelected: function() {
    if (status === 'setpath') {
      document.querySelector('#chokoku-setting-add-btn').classList.add('selected');
      document.querySelector('#chokoku-setting-edit-btn').classList.remove('selected');
      document.querySelector('#chokoku-setting .btn').parentNode.classList.remove('hidden');
      document.querySelector('#chokoku-setting-issnap').parentNode.parentNode.classList.remove('hidden');
      renderer.domElement.style.cursor = "url('img/chokoku-cursor.svg') 5 5, auto";
      nowPath.visible = true;
      chokokuPath.visible = true;
      if (pointCircles.length === 1) pointCircles[0].visible = true;
    }
  },
  onUnselected: function(statusTo) {
    console.log(statuses[statusTo].group)
    if (statuses[statusTo] && statuses[statusTo].group !== 'setpath') {
      nowPath.visible = false;
      chokokuPath.visible = false;
      if (status === 'adjustpath') {
        for (let i = 0;i < pointCircles.length;i++) {
          pointCircles[i].visible = false;
        }
      } else {
        if (pointCircles.length === 1) pointCircles[0].visible = false;
      }
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
