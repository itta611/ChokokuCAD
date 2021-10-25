const documentWidth = window.innerWidth;
const documentHeight = window.innerHeight;

function onMouseMove(e) {
  let loadingMask = document.querySelector('#loading-mask');
  let logo = document.querySelector('#loading-mask-inner > img');
  let loadingText = document.querySelector('#loading-mask-inner > h4');
  let normalizeMouseX = e.clientX / documentWidth * 2 - 1;
  let normalizeMouseY = e.clientY / documentHeight * 2 - 1;
  logo.style.transform = `translateX(${normalizeMouseX * 20}px) translateY(${normalizeMouseY * 20}px)`;
  loadingMask.style.backgroundPositionX = `${normalizeMouseX * 5}px`;
  loadingMask.style.backgroundPositionY = `${normalizeMouseY * 5}px`;
  loadingText.style.transform = `translateX(${normalizeMouseX * 10}px) translateY(${normalizeMouseY * 10}px)`;
}

document.addEventListener('mousemove', onMouseMove);

// documentじゃなくてwindow
function endParallax() {
  document.removeEventListener('mousemove', onMouseMove, false);
};
