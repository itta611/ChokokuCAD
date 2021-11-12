import {language} from './i18n.js';
import {toolItems} from './tools.js';
import {statusBar} from './gui.js';
let statuses = [];
let status;

class Status {
  constructor(option) {
    this.status = option.statusName;
    this.group = option.group;
    this.name = option.name;
    this.desc = option.desc;
    this.descEn = option.descEn;
  }

  change() {
    if (language === 'ja') {
      statusBar.textContent = `[${this.name}] ${this.desc}`;
    } else {
      statusBar.textContent = `[${this.group}] ${this.descEn}`;
    }
    if (statuses[status] && toolItems[statuses[status].group]) toolItems[statuses[status].group].unSelect(this.group);
    status = this.status;
    if (toolItems[this.group]) toolItems[this.group].select();
  }
}

statuses['start'] = new Status(
  {name: 'スタート', statusName: 'start', group: 'start', desc: 'Chokoku CADへようこそ。', descEn: 'Welcome to Chokoku CAD.'}
);

statuses['setpath'] = new Status(
  {name: '彫刻ツール', statusName: 'setpath', group: 'setpath', desc: '残す形状を決めてください。', descEn: 'Decide the shave path.'}
);

statuses['adjustpath'] = new Status(
  {name: '彫刻ツール', statusName: 'adjustpath', group: 'setpath', desc: '調節ができます。よければEnterキーを押してください。', descEn: 'You can adjust path. Press enter key to finish.'}
);

statuses['paint'] = new Status(
  {name: 'ペイント', statusName: 'paint', group: 'paint', desc: 'オブジェクトの色を設定してください。', descEn: 'Set the object color.'}
);

statuses['modelAdd1'] = new Status(
  {name: 'モデル追加', statusName: 'modelAdd1', group: 'upload', desc: '新しく追加するモデルをアップロードしてください。', descEn: 'Upload the new model.'}
);

statuses['modelAdd2'] = new Status(
  {name: 'モデル追加', statusName: 'modelAdd2', group: 'upload', desc: 'アップロードしたモデルを回転・移動・大きさを調節してください。', descEn: 'Transform the object.'}
);

statuses['export'] = new Status(
  {name: 'モデル出力', statusName: 'export', group: 'export', desc: 'モデルをglb(gltf)形式でエクスポートしダウンロードします。', descEn: 'Export the model with glb(gltf) format file.'}
);

statuses['add'] = new Status(
  {name: '追加', statusName: 'add', group: 'add', desc: '新しくモデルを作成して結合します。', descEn: 'Create a new model and merge it.'}
);

statuses['addStep2'] = new Status(
  {name: '追加', statusName: 'addStep2', group: 'add', desc: '新しくモデルを作成して結合します。', descEn: 'Create a new model and merge it.'}
);

statuses['start'].change();

export {statuses, status};
