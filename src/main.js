import './renderer.js';
import './domEvents.js';
import { i18n } from './i18n.js';

if (navigator.userAgent.indexOf('MSIE') !== -1 && navigator.userAgent.indexOf('TRIDENT') !== -1) {
  alert(i18n('IEブラウザには対応していません。'));
}