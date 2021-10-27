const language = (window.navigator.languages && window.navigator.languages[0]) ||
  window.navigator.language ||
  window.navigator.userLanguage ||
  window.navigator.browserLanguage;
if (language !== 'ja') {
  document.querySelectorAll('*[data-en]:not(input)').forEach(function (element) {
    element.textContent = element.dataset.en;
  });
  document.querySelectorAll('input[data-en]').forEach(function (element) {
    element.value = element.dataset.en;
  });
}

export function i18n(textJa, textEn) {
  if (language === 'ja') {
    return textJa;
  } else {
    return textEn;
  }
}

export {language};
