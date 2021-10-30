
document.querySelectorAll('input[type="number"]').forEach(function (element) {
  element.addEventListener('change', function() {
    console.log(element.value);
    if (element.value * 1 <= 0.01 && element.dataset.zeroFix === 'true') {
      element.value = '0.01';
    }
    element.value = (element.value * 1).toFixed(2) * 1;
  });
});
