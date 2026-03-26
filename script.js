// ========== NAVIGATION ==========

function goToLogin() {
  window.location.href = 'login.html';
}

function goToSignup() {
  window.location.href = 'Signup.html';
}

function goToDashboard() {
  window.location.href = 'dashboard.html';
}

// ========== LANDING PAGE ==========

function toggleHowToPlay() {
  const box = document.getElementById('how-to-play');
  box.classList.toggle('hidden');
}

// ========== LOGIN PAGE ==========

function handleLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const box = document.querySelector('.form-container');

  const old = document.querySelector('.error-msg, .success-msg');
  if (old) old.remove();

  if (!username || !password) {
    showMessage(box, '⚠️ Fill in all fields, adventurer!', 'error');
    return;
  }

  // Save the username so dashboard can use it
  localStorage.setItem('playerName', username);

  showMessage(box, '⚔️ Welcome back, ' + username + '!', 'success');
  setTimeout(function() {
    goToDashboard();
  }, 1500);
}

// ========== SIGNUP PAGE ==========

function handleSignup() {
  const username = document.getElementById('signup-username').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value.trim();
  const confirm = document.getElementById('signup-confirm').value.trim();
  const box = document.querySelector('.form-container');

  const old = document.querySelector('.error-msg, .success-msg');
  if (old) old.remove();

  if (!username || !email || !password || !confirm) {
    showMessage(box, '⚠️ All fields must be filled, hero!', 'error');
    return;
  }

  if (password !== confirm) {
    showMessage(box, '⚠️ Passwords do not match!', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage(box, '⚠️ Password must be at least 6 characters!', 'error');
    return;
  }

  showMessage(box, '🛡️ Your legend begins, ' + username + '!', 'success');
  setTimeout(function() {
    goToLogin();
  }, 1500);
}

// ========== DASHBOARD ==========

function selectAvatar(element) {
  document.querySelectorAll('.avatar-item').forEach(function(item) {
    item.classList.remove('active');
  });
  element.classList.add('active');
}

// ========== HELPER ==========

function showMessage(container, text, type) {
  const msg = document.createElement('p');
  msg.className = type === 'error' ? 'error-msg' : 'success-msg';
  msg.textContent = text;
  container.appendChild(msg);
}
// ========== LOAD PLAYER NAME ON DASHBOARD ==========
function loadPlayerName() {
  const name = localStorage.getItem('playerName');
  const nameSpan = document.getElementById('player-name');
  if (name && nameSpan) {
    nameSpan.textContent = name;
  }
}
// ========== TOGGLE PASSWORD VISIBILITY ==========

function togglePassword(inputId, eyeIcon) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    eyeIcon.textContent = '🙈';
  } else {
    input.type = 'password';
    eyeIcon.textContent = '👁️';
  }
}
