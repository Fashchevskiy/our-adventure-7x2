import {
  initTouch,
  poll,
  input
} from './input.js';

import { Forest } from './forest.js';
import { Meeting } from './meeting.js';

const KEY = 'ola_save_v1';

const cv = document.getElementById('game');
const ctx = cv.getContext('2d');

let save = {};

try {
  save =
    JSON.parse(
      localStorage.getItem(KEY)
    ) || {};
} catch {}

const store = () => {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify(save)
    );
  } catch {}
};

const onSave = s => {
  save = {
    ...save,
    ...s
  };

  store();
};

// Масштабування гри
function fit() {
  const s = Math.min(
    innerWidth / 1280,
    innerHeight / 720
  );

  cv.style.width =
    1280 * s + 'px';

  cv.style.height =
    720 * s + 'px';
}

addEventListener(
  'resize',
  fit
);

fit();
initTouch();

let scene = null;
let last = 0;
let acc = 0;
let running = false;

const STEP = 1 / 60;

// Перемикання сцен
function goto(n) {
  onSave({
    level: n
  });

  scene =
    n === 'meeting'
      ? new Meeting(
          save,
          onSave,
          goto
        )
      : new Forest(
          save,
          onSave,
          goto
        );
}

// Головний ігровий цикл
function loop(t) {
  requestAnimationFrame(loop);

  const dt = Math.min(
    0.1,
    (t - last) / 1000 || 0
  );

  last = t;
  acc += dt;

  poll();

  while (acc >= STEP) {
    scene.update(
      STEP,
      input
    );

    acc -= STEP;
  }

  scene.draw(ctx);
}

// Запуск гри
function start() {
  try {
    (
      window.audioCtx =
        new (
          window.AudioContext ||
          window.webkitAudioContext
        )()
    ).resume();
  } catch {}

  document.getElementById(
    'start'
  ).style.display = 'none';

  document.body.classList.add(
    'playing'
  );

  goto(
    save.level || 'forest'
  );

  if (!running) {
    running = true;
    requestAnimationFrame(loop);
  }
}

// Кнопка старту
document.getElementById(
  'go'
).onclick = start;

// Скидання прогресу
document.getElementById(
  'reset'
).onclick = () => {
  save = {};
  store();
  start();
};