window.addEventListener('load', () => {
  // Wait for the intro animation to finish, then:
  setTimeout(() => {
    // No need to hide .intro-title; it will now be in the top-right corner.
    // Remove the hidden class from the overlay-text to show it after intro.
    document.body.classList.add('loaded');
  }, 2000); // match animation duration + delay
});

// === DOM Elements ===
const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popup-title");
const popupText = document.getElementById("artwork-description");
const popupImage = document.getElementById("popup-image");
const userDot = document.getElementById("userDot");
const arrowButtons = document.querySelectorAll('.arrow');

// === State Variables ===
let popupVisible = false;
let posX = 50;
let posY = 50;

// === Position Update ===
function updateUserDotPosition() {
  userDot.style.left = `${posX}%`;
  userDot.style.top = `${posY}%`;
}

// === Popup Handling ===
function showPopup(dot, userRect) {
    const title = dot.getAttribute("data-title");
    const description = dot.getAttribute("data-description");
    const imageSrc = dot.getAttribute("data-image");
  
    popupTitle.textContent = title || '';
    popupText.textContent = description || '';
  
    if (imageSrc) {
      popupImage.src = imageSrc;
      popupImage.style.display = "block";
    } else {
      popupImage.style.display = "none";
    }
  
    // Default position near user
    let popupLeft = userRect.left + userRect.width / 2 + 10;
    let popupTop = userRect.top - 10;
  
    // Temporarily show the popup to get its size
    popup.style.display = "block";
    popup.style.opacity = "0";
    popup.style.left = "0px";
    popup.style.top = "0px";
  
    const popupRect = popup.getBoundingClientRect();
  
    // Adjust horizontal if it overflows
    if (popupLeft + popupRect.width > window.innerWidth) {
      popupLeft = window.innerWidth - popupRect.width - 20; // add padding
    }
    if (popupLeft < 0) {
      popupLeft = 50;
    }
  
    // Adjust vertical if it overflows
    if (popupTop + popupRect.height > window.innerHeight) {
        popupTop = window.innerHeight - popupRect.height - 20;
      }
    if (popupTop < 10) {
    // Not enough space above — show below the dot
    popupTop = userRect.bottom + 10;
      }
  
    // Apply final position
    popup.style.left = `${popupLeft}px`;
    popup.style.top = `${popupTop}px`;
    popup.style.opacity = "1";
  
    popupVisible = true;
  }
  
  

function closePopup() {
  popup.style.opacity = "0";
  setTimeout(() => {
    popup.style.display = "none";
  }, 300);
  popupVisible = false;
}

// === Collision Detection ===
function getWallRects() {
  return Array.from(document.querySelectorAll(".wall")).map(wall =>
    wall.getBoundingClientRect()
  );
}

function isInsideWall(dotRect, wallRects) {
  return wallRects.some(wall =>
    !(dotRect.right < wall.left ||
      dotRect.left > wall.right ||
      dotRect.bottom < wall.top ||
      dotRect.top > wall.bottom)
  );
}

function isInsideDotCollision(userRect, dot, radius) {
  const dotRect = dot.getBoundingClientRect();
  const centerX = dotRect.left + dotRect.width / 2;
  const centerY = dotRect.top + dotRect.height / 2;

  const userCenterX = userRect.left + userRect.width / 2;
  const userCenterY = userRect.top + userRect.height / 2;

  const distance = Math.sqrt(
    Math.pow(userCenterX - centerX, 2) + Math.pow(userCenterY - centerY, 2)
  );

  return distance < radius + userRect.width / 2;
}

// === Keyboard Movement Handler ===
document.addEventListener("keydown", (e) => {
  let newX = posX;
  let newY = posY;
  const step = 4.5;

  switch (e.key) {
    case "ArrowUp": newY -= step; break;
    case "ArrowDown": newY += step; break;
    case "ArrowLeft": newX -= step; break;
    case "ArrowRight": newX += step; break;
    default: return;
  }

  newX = Math.max(0, Math.min(100, newX));
  newY = Math.max(0, Math.min(100, newY));

  const testDot = userDot.cloneNode();
  testDot.style.left = `${newX}%`;
  testDot.style.top = `${newY}%`;
  testDot.style.position = "absolute";
  testDot.style.visibility = "hidden";
  testDot.style.transform = "scale(0.95)";
  userDot.parentElement.appendChild(testDot);

  const testDotRect = testDot.getBoundingClientRect();
  const wallRects = getWallRects();

  if (isInsideWall(testDotRect, wallRects)) {
    userDot.parentElement.removeChild(testDot);
    return;
  }

  let collisionDetected = false;

  document.querySelectorAll(".interactive-dot").forEach(dot => {
    const radius = parseInt(dot.getAttribute("data-collision-radius")) || 20;

    if (isInsideDotCollision(testDotRect, dot, radius)) {
      showPopup(dot, testDotRect);
      collisionDetected = true;
    }
  });

  if (!collisionDetected) {
    posX = newX;
    posY = newY;

    if (popupVisible) {
      closePopup();
    }
  }

  userDot.parentElement.removeChild(testDot);
  updateUserDotPosition();
});

// === Initial Position ===
updateUserDotPosition();

// === Arrow Button Visual Feedback ===
arrowButtons.forEach(btn => {
  btn.addEventListener('mouseleave', () => btn.classList.remove('pressed'));
  btn.addEventListener('mousedown', () => btn.classList.add('pressed'));
  btn.addEventListener('click', () => {
    const keyEvent = new KeyboardEvent('keydown', { key: btn.dataset.direction });
    document.dispatchEvent(keyEvent);
  });
});

document.addEventListener('keydown', (e) => {
  const arrow = document.querySelector(`.arrow[data-direction="${e.key}"]`);
  if (arrow) arrow.classList.add('pressed');
});

document.addEventListener('keyup', (e) => {
  const arrow = document.querySelector(`.arrow[data-direction="${e.key}"]`);
  if (arrow) arrow.classList.remove('pressed');
});

document.getElementById("introTitle").addEventListener("click", function () {
  document.getElementById("introPopup").style.display = "block";
});

function closeIntroPopup() {
  document.getElementById("introPopup").style.display = "none";
}
