// ========== CONFIGURATION DU JEU ==========

// On récupère le canvas (la feuille de dessin) depuis le HTML
const canvas = document.getElementById('game-canvas');

// ctx = context, c'est le "crayon" qu'on utilise pour dessiner sur le canvas
const ctx = canvas.getContext('2d');

// On définit la taille exacte du canvas en pixels
canvas.width = 800;
canvas.height = 400;

// LE SOL : position verticale où les personnages marchent
// 340 = 400 (hauteur canvas) - 60 (hauteur du sol)
const GROUND_Y = 340;

// GRAVITE : force qui tire le joueur vers le bas
// Plus ce nombre est grand, plus la chute est rapide
const GRAVITY = 0.5;

// FORCE DU SAUT : vitesse vers le haut quand le joueur saute
// Négatif car vers le haut = direction négative sur le canvas
const JUMP_FORCE = -12;

// VITESSE DES ENNEMIS : pixels par frame qu'ils se déplacent
const ENEMY_SPEED = 2;

// Variables du jeu qui changent pendant la partie
let score = 0;        // score du joueur, commence à 0
let health = 3;       // vie du joueur, commence à 3
let level = 1;        // niveau actuel
let gameRunning = true; // true = jeu en cours, false = jeu arrêté
let frameCount = 0;   // compte les frames pour spawner les ennemis
// ========== LE JOUEUR ==========

// Objet qui contient toutes les infos du joueur
const player = {
  x: 100,           // position horizontale de départ
  y: GROUND_Y,      // position verticale = sur le sol
  width: 32,        // largeur du joueur en pixels
  height: 48,       // hauteur du joueur en pixels
  speedX: 0,        // vitesse horizontale actuelle (0 = immobile)
  speedY: 0,        // vitesse verticale actuelle (0 = immobile)
  isJumping: false, // true si le joueur est dans les airs
  direction: 1,     // 1 = regarde à droite, -1 = regarde à gauche
  frame: 0,         // frame d'animation actuelle
  frameTimer: 0,    // compteur pour changer de frame
  isMoving: false,  // true si le joueur bouge
  color: '#c9a84c', // couleur dorée du joueur
};

// Objet qui garde en mémoire quelles touches sont pressées
// true = touche enfoncée, false = touche relâchée
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  Space: false,
};

// EVENEMENT : quand le joueur appuie sur une touche
document.addEventListener('keydown', function(e) {
  // On met la touche à true dans l'objet keys
  if (keys.hasOwnProperty(e.code)) {
    keys[e.code] = true;
  }

  // Si le joueur appuie sur haut ou espace ET qu'il est sur le sol
  // alors il saute
  if ((e.code === 'ArrowUp' || e.code === 'Space') && !player.isJumping) {
    player.speedY = JUMP_FORCE; // on lui donne une vitesse vers le haut
    player.isJumping = true;    // on marque qu'il est dans les airs
  }
});

// EVENEMENT : quand le joueur relâche une touche
document.addEventListener('keyup', function(e) {
  // On remet la touche à false dans l'objet keys
  if (keys.hasOwnProperty(e.code)) {
    keys[e.code] = false;
  }
});
// ========== LES ENNEMIS ==========

// Tableau vide qui contiendra tous les ennemis en jeu
let enemies = [];

// Les différents types d'ennemis avec leurs caractéristiques
const ENEMY_TYPES = [
  {
    type: 'goblin',   // nom de l'ennemi
    emoji: '👺',      // emoji utilisé pour le dessiner
    width: 30,        // largeur en pixels
    height: 40,       // hauteur en pixels
    speed: 2,         // vitesse de déplacement
    color: '#2ecc71', // couleur verte
  },
  {
    type: 'skeleton',
    emoji: '💀',
    width: 30,
    height: 45,
    speed: 2.5,       // plus rapide que le goblin
    color: '#ecf0f1',
  },
  {
    type: 'monster',
    emoji: '👹',
    width: 40,
    height: 50,
    speed: 1.5,       // plus lent mais plus grand
    color: '#e74c3c',
  },
  {
    type: 'dragon',
    emoji: '🐉',
    width: 50,
    height: 50,
    speed: 3,         // le plus rapide et le plus grand
    color: '#9b59b6',
  },
];

// Fonction qui crée un nouvel ennemi et l'ajoute au tableau
function spawnEnemy() {
  // On choisit un type d'ennemi au hasard
  const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];

  // On crée l'ennemi avec ses caractéristiques
  enemies.push({
    x: canvas.width,          // apparaît à droite du canvas
    y: GROUND_Y + (player.height - type.height), // positionné sur le sol
    width: type.width,
    height: type.height,
    speed: type.speed + (level * 0.3), // plus rapide selon le niveau
    emoji: type.emoji,
    color: type.color,
    type: type.type,
  });
}
// ========== DESSIN DU JEU ==========

// Fonction qui dessine le fond du donjon
function drawBackground() {
  // Fond noir profond
  ctx.fillStyle = '#0a0808';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Lueur orange en haut comme des torches
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(100, 40, 0, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dessine des "pierres" sur le mur du fond
  ctx.strokeStyle = 'rgba(80, 60, 20, 0.3)'; // couleur dorée très transparente
  ctx.lineWidth = 1;

  // Lignes horizontales pour simuler les rangées de pierres
  for (let y = 40; y < GROUND_Y; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Lignes verticales décalées pour simuler les joints des pierres
  for (let y = 40; y < GROUND_Y; y += 80) {
    for (let x = 0; x < canvas.width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 40);
      ctx.stroke();
    }
  }

  // Lignes verticales décalées (rangée alternée)
  for (let y = 80; y < GROUND_Y; y += 80) {
    for (let x = 40; x < canvas.width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 40);
      ctx.stroke();
    }
  }
}

// Fonction qui dessine le sol
function drawGround() {
  // Bande de sol dorée
  ctx.fillStyle = '#3d2e10';
  ctx.fillRect(0, GROUND_Y + player.height, canvas.width, 60);

  // Ligne brillante au dessus du sol
  ctx.fillStyle = '#7a5c1e';
  ctx.fillRect(0, GROUND_Y + player.height, canvas.width, 3);
}

// Fonction qui dessine le joueur comme un personnage pixel art
function drawPlayer() {
  // On sauvegarde l'état du canvas avant de transformer
  ctx.save();

  // Si le joueur regarde à gauche on retourne le dessin
  if (player.direction === -1) {
    ctx.scale(-1, 1); // retourne horizontalement
    ctx.translate(-player.x * 2 - player.width, 0); // repositionne
  }

  // CORPS du joueur : rectangle doré
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height * 0.6);

  // TETE du joueur : carré plus clair
  ctx.fillStyle = '#e8d9b0'; // couleur peau
  ctx.fillRect(
    player.x + 4,
    player.y - player.height * 0.35,
    player.width - 8,
    player.height * 0.35
  );

  // YEUX du joueur : deux petits carrés noirs
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(player.x + 7, player.y - player.height * 0.25, 4, 4);
  ctx.fillRect(player.x + 17, player.y - player.height * 0.25, 4, 4);

  // EPEE du joueur : rectangle gris
  ctx.fillStyle = '#bdc3c7';
  ctx.fillRect(
    player.x + player.width,
    player.y + 5,
    16, // longueur de l'épée
    4   // épaisseur de l'épée
  );

  // JAMBES du joueur : animation selon le mouvement
  ctx.fillStyle = '#7a5c1e'; // couleur plus foncée pour les jambes
  if (player.isMoving && !player.isJumping) {
    // Anime les jambes quand le joueur marche
    const legOffset = Math.sin(frameCount * 0.2) * 5;
    // Jambe gauche
    ctx.fillRect(player.x + 2, player.y + player.height * 0.6, 10, player.height * 0.4 + legOffset);
    // Jambe droite
    ctx.fillRect(player.x + player.width - 12, player.y + player.height * 0.6, 10, player.height * 0.4 - legOffset);
  } else {
    // Jambes statiques
    ctx.fillRect(player.x + 2, player.y + player.height * 0.6, 10, player.height * 0.4);
    ctx.fillRect(player.x + player.width - 12, player.y + player.height * 0.6, 10, player.height * 0.4);
  }

  // On restaure l'état du canvas après le dessin
  ctx.restore();
}

// Fonction qui dessine tous les ennemis
function drawEnemies() {
  enemies.forEach(function(enemy) {
    // On utilise les emojis pour dessiner les ennemis
    // font size = hauteur de l'ennemi pour qu'il rentre bien
    ctx.font = enemy.height + 'px serif';
    ctx.textAlign = 'center';

    // On dessine l'emoji à la position de l'ennemi
    ctx.fillText(
      enemy.emoji,
      enemy.x + enemy.width / 2,  // centré horizontalement
      enemy.y + enemy.height       // aligné avec le bas de l'ennemi
    );
  });
}
// ========== LOGIQUE DU JEU ==========

// Fonction qui met à jour la position du joueur à chaque frame
function updatePlayer() {
  // MOUVEMENT HORIZONTAL
  if (keys.ArrowLeft) {
    player.speedX = -5;      // vitesse vers la gauche
    player.direction = -1;   // regarde à gauche
    player.isMoving = true;
  } else if (keys.ArrowRight) {
    player.speedX = 5;       // vitesse vers la droite
    player.direction = 1;    // regarde à droite
    player.isMoving = true;
  } else {
    player.speedX = 0;       // immobile si aucune touche
    player.isMoving = false;
  }

  // GRAVITE : on ajoute la gravité à la vitesse verticale
  // Cela fait tomber le joueur naturellement
  player.speedY += GRAVITY;

  // On applique les vitesses aux positions
  player.x += player.speedX;
  player.y += player.speedY;

  // COLLISION AVEC LE SOL
  // Si le joueur touche ou dépasse le sol
  if (player.y >= GROUND_Y) {
    player.y = GROUND_Y;     // on le remet exactement sur le sol
    player.speedY = 0;       // on arrête la chute
    player.isJumping = false; // il n'est plus dans les airs
  }

  // LIMITES HORIZONTALES : empêche le joueur de sortir du canvas
  if (player.x < 0) player.x = 0; // limite gauche
  if (player.x + player.width > canvas.width) { // limite droite
    player.x = canvas.width - player.width;
  }
}

// Fonction qui met à jour la position de tous les ennemis
function updateEnemies() {
  enemies.forEach(function(enemy) {
    // L'ennemi se déplace vers la gauche
    enemy.x -= enemy.speed;
  });

  // On supprime les ennemis qui sont sortis du canvas à gauche
  // filter garde seulement les ennemis dont x + width > 0
  enemies = enemies.filter(function(enemy) {
    return enemy.x + enemy.width > 0;
  });
}

// Fonction qui vérifie si le joueur touche un ennemi
function checkCollisions() {
  enemies.forEach(function(enemy, index) {
    // COLLISION = les deux rectangles se chevauchent
    // On vérifie les 4 côtés
    const touching =
      player.x < enemy.x + enemy.width &&   // joueur pas trop à droite
      player.x + player.width > enemy.x &&   // joueur pas trop à gauche
      player.y < enemy.y + enemy.height &&   // joueur pas trop bas
      player.y + player.height > enemy.y;    // joueur pas trop haut

    if (touching) {
      // Le joueur perd une vie
      health--;

      // On met à jour la vie affichée dans le HUD
      document.getElementById('health-value').textContent = health;

      // On supprime l'ennemi touché du tableau
      enemies.splice(index, 1);

      // Si le joueur n'a plus de vie, game over
      if (health <= 0) {
        gameOver();
      }
    }

    // Si le joueur saute PAR DESSUS l'ennemi
    // Le bas du joueur est au dessus du milieu de l'ennemi
    const jumpedOver =
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y + player.height <= enemy.y + enemy.height / 2 &&
      player.speedY > 0; // le joueur tombe (speedY positif = vers le bas)

    if (jumpedOver) {
      // Le joueur gagne des points
      score += 10;

      // On met à jour le score dans le HUD
      document.getElementById('score-value').textContent = score;

      // On supprime l'ennemi sauté
      enemies.splice(index, 1);

      // Tous les 50 points on monte de niveau
      if (score % 50 === 0) {
        level++;
        document.getElementById('level-value').textContent = 'Level ' + level;
      }

      // A 200 points le joueur gagne
      if (score >= 200) {
        victory();
      }
    }
  });
}

// Fonction appelée quand le joueur perd
function gameOver() {
  gameRunning = false; // on arrête la boucle de jeu

  // On affiche l'écran game over
  document.getElementById('gameover-screen').classList.remove('hidden');
}

// Fonction appelée quand le joueur gagne
function victory() {
  gameRunning = false; // on arrête la boucle de jeu

  // On affiche l'écran victory
  document.getElementById('victory-screen').classList.remove('hidden');
}

// Fonction qui remet le jeu à zéro
function restartGame() {
  // On remet toutes les variables à leurs valeurs de départ
  score = 0;
  health = 3;
  level = 1;
  gameRunning = true;
  enemies = [];
  frameCount = 0;

  // On remet le joueur à sa position de départ
  player.x = 100;
  player.y = GROUND_Y;
  player.speedX = 0;
  player.speedY = 0;
  player.isJumping = false;

  // On met à jour le HUD
  document.getElementById('health-value').textContent = health;
  document.getElementById('score-value').textContent = score;
  document.getElementById('level-value').textContent = 'Level ' + level;

  // On cache les écrans game over et victory
  document.getElementById('gameover-screen').classList.add('hidden');
  document.getElementById('victory-screen').classList.add('hidden');

  // On relance la boucle de jeu dungeon
  gameLoop();
}
