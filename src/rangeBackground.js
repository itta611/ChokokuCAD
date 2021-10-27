
document.querySelectorAll('input[type="range"]').forEach(function(element) {
  element.addEventListener('input', function() {
    let percent = (element.value - element.min) / (element.max - element.min) * 100;
    element.style.background = `linear-gradient(to right, #ffc42d ${percent}%, #eee ${percent}% 100%)`;
  });
  let percent = (element.value - element.min) / (element.max - element.min) * 100;
  element.style.background = `linear-gradient(to right, #ffc42d ${percent}%, #eee ${percent}% 100%)`;
});
