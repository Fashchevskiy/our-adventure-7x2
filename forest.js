import { Player } from './player.js';
import { Enemy } from './enemy.js';

const W = 6000;
const GY = 620;

export function heart(c, x, y, s, col) {
  c.fillStyle = col;
  c.beginPath();

  c.moveTo(
    x,
    y + s * 0.6
  );

  c.bezierCurveTo(
    x - s * 1.2,
    y - s * 0.1,
    x - s * 0.6,
    y - s,
    x,
    y - s * 0.4
  );

  c.bezierCurveTo(
    x + s * 0.6,
    y - s,
    x + s * 1.2,
    y - s * 0.1,
    x,
    y + s * 0.6
  );

  c.fill();
}

export function tree(c, x, y, h, col) {
  c.fillStyle = col;
  c.fillRect(
    x - 8,
    y - h * 0.3,
    16,
    h * 0.3
  );

  for (let k = 0; k < 3; k++) {
    const w = 70 - k * 16;
    const b = y - h * 0.25 - k * h * 0.24;

    c.beginPath();

    c.moveTo(
      x - w,
      b
    );

    c.lineTo(
      x + w,
      b
    );

    c.lineTo(
      x,
      b - h * 0.38
    );

    c.fill();
  }
}

export class Forest {
  constructor(save, onSave, goto) {
    Object.assign(this, {
      onSave,
      goto,
      t: 0,
      cam: 0,
      fx: [],
      left: false
    });

    this.solids = [
      {
        x: 0,
        y: GY,
        w: W,
        h: 200
      },

      ...[
        [700, 500],
        [1100, 420],
        [1500, 520],
        [2400, 470],
        [3300, 400],
        [4200, 480],
        [5000, 430]
      ].map(([x, y]) => ({
        x,
        y,
        w: 200,
        h: 20,
        p: true
      }))
    ];

    this.hearts = [
      [800, 450],
      [2500, 420],
      [4300, 430]
    ].map(([x, y], i) => ({
      x,
      y,
      got: !!(save.hearts && save.hearts[i])
    }));

    this.player = new Player(
      120,
      GY
    );

    this.en = [
      ['fox', 900, 150],
      ['fox', 1700, 160],
      ['boar', 2200, 200],
      ['fox', 2900, 150],
      ['boar', 3500, 200],
      ['fox', 4000, 150],
      ['boar', 4700, 220],
      ['fox', 5200, 150]
    ].map(
      ([t, x, r]) =>
        new Enemy(
          t,
          x,
          GY,
          r
        )
    );

    this.ff = Array.from(
      { length: 40 },
      (_, i) => ({
        x: (i * 337) % 1380,
        y: 150 + (i * 91) % 450,
        s: 0.6 + (i % 5) * 0.2,
        p: i
      })
    );
  }

  burst(x, y, n, c) {
    for (let i = 0; i < n; i++) {
      this.fx.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 400,
        vy: -Math.random() * 300,
        l: 0.7,
        c
      });
    }
  }

  update(dt, inp) {
    this.t += dt;

    const p = this.player;

    p.update(
      dt,
      inp,
      this.solids
    );

    p.x = Math.max(
      30,
      Math.min(
        W - 30,
        p.x
      )
    );

    // Збір сердечок
    for (const h of this.hearts) {
      if (
        !h.got &&
        Math.abs(h.x - p.x) < 45 &&
        Math.abs(h.y - (p.y - 60)) < 70
      ) {
        h.got = true;

        this.onSave({
          hearts: this.hearts.map(
            q => q.got
          )
        });

        for (let i = 0; i < 14; i++) {
          this.fx.push({
            x: h.x,
            y: h.y,
            vx: (Math.random() - 0.5) * 300,
            vy: -Math.random() * 300,
            l: 1,
            h: true,
            c: '#ff5082'
          });
        }
      }
    }

    // Атака гравця
    if (p.atk > 0.08) {
      const b = p.box();

      for (const e of this.en) {
        if (
          !e.dead &&
          e.swing !== p.swing &&
          e.x + e.w / 2 > b.x1 &&
          e.x - e.w / 2 < b.x2 &&
          e.y > b.y1 &&
          e.y - e.h < b.y2
        ) {
          e.swing = p.swing;
          e.hp--;
          e.stun = 0.3;
          e.kv = p.face * 400;
          e.flash = 0.3;

          this.burst(
            e.x,
            e.y - e.h / 2,
            6,
            '#fff'
          );

          if (e.hp <= 0) {
            e.dead = true;

            this.burst(
              e.x,
              e.y - e.h / 2,
              14,
              '#ffd36b'
            );
          }
        }
      }
    }

    // Вороги
    for (const e of this.en) {
      e.update(
        dt,
        p
      );

      if (
        e.stun <= 0 &&
        Math.abs(p.x - e.x) <
          (p.w + e.w) / 2 &&
        p.y > e.y - e.h &&
        p.y - p.h < e.y
      ) {
        p.hurt(
          e.dmg,
          Math.sign(p.x - e.x) || 1
        );
      }
    }

    // Видалення мертвих ворогів
    this.en = this.en.filter(
      e => !e.dead
    );

    // Смерть гравця
    if (p.hp <= 0) {
      p.hp = 5;
      p.x = Math.max(
        120,
        Math.floor(p.x / 1500) * 1500
      );
      p.y = GY - 200;
      p.vy = 0;
      p.kb = 0;
    }

    // Частинки
    for (const f of this.fx) {
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.vy += 500 * dt;
      f.l -= dt;
    }

    this.fx = this.fx.filter(
      f => f.l > 0
    );

    // Перевірка всіх сердечок
    this.open = this.hearts.every(
      h => h.got
    );

    // Перехід у Meeting
    if (
      this.open &&
      !this.left &&
      Math.abs(p.x - 5800) < 50
    ) {
      this.left = true;
      this.goto('meeting');
    }

    // Камера
    const tg = Math.max(
      0,
      Math.min(
        W - 1280,
        p.x - 640
      )
    );

    this.cam +=
      (tg - this.cam) *
      Math.min(
        1,
        dt * 5
      );
  }

  layer(c, f, gap, col, hb, y) {
    const off = this.cam * f;
    const i0 = Math.floor(
      off / gap
    );

    for (
      let i = i0;
      i < i0 + 1280 / gap + 2;
      i++
    ) {
      tree(
        c,
        i * gap - off,
        y,
        hb + ((i * 37 % 5 + 5) % 5) * 35,
        col
      );
    }
  }

  draw(c) {
    // Небо
    const g = c.createLinearGradient(
      0,
      0,
      0,
      720
    );

    g.addColorStop(
      0,
      '#2b1b5a'
    );

    g.addColorStop(
      0.55,
      '#e98fb5'
    );

    g.addColorStop(
      1,
      '#ffd6a5'
    );

    c.fillStyle = g;

    c.fillRect(
      0,
      0,
      1280,
      720
    );

    // Світло
    const sg = c.createRadialGradient(
      900,
      260,
      10,
      900,
      260,
      260
    );

    sg.addColorStop(
      0,
      '#fff3c4'
    );

    sg.addColorStop(
      1,
      '#fff3c400'
    );

    c.fillStyle = sg;

    c.fillRect(
      500,
      0,
      800,
      600
    );

    // Дерева на задньому плані
    this.layer(
      c,
      0.2,
      220,
      '#6a3f93',
      300,
      650
    );

    this.layer(
      c,
      0.45,
      170,
      '#3f2a74',
      260,
      670
    );

    this.layer(
      c,
      0.75,
      230,
      '#241a4d',
      330,
      720
    );

    c.save();

    c.translate(
      -this.cam,
      0
    );

    // Земля
    const gr = c.createLinearGradient(
      0,
      GY,
      0,
      720
    );

    gr.addColorStop(
      0,
      '#3d7a46'
    );

    gr.addColorStop(
      1,
      '#1d3a2a'
    );

    for (const s of this.solids) {
      c.fillStyle = s.p
        ? '#6b4a3a'
        : gr;

      c.fillRect(
        s.x,
        s.y,
        s.w,
        s.p ? s.h : 200
      );

      c.fillStyle = '#6fd07a';

      c.fillRect(
        s.x,
        s.y,
        s.w,
        8
      );
    }

    // Трава
    c.fillStyle = '#6fd07a';

    for (
      let x = Math.floor(this.cam / 40) * 40;
      x < this.cam + 1320;
      x += 40
    ) {
      const h =
        8 + ((x / 40 * 7) % 3) * 5;

      c.beginPath();

      c.moveTo(
        x,
        GY
      );

      c.lineTo(
        x + 6,
        GY - h
      );

      c.lineTo(
        x + 12,
        GY
      );

      c.fill();
    }

    // Сердечка
    for (const h of this.hearts) {
      if (!h.got) {
        heart(
          c,
          h.x,
          h.y + Math.sin(this.t * 3 + h.x) * 6,
          26,
          '#ff3b6f'
        );
      }
    }

    // Портал
    c.fillStyle = this.open
      ? '#ff9be0'
      : '#555';

    c.globalAlpha = this.open
      ? 0.7 + 0.2 * Math.sin(this.t * 4)
      : 0.6;

    c.beginPath();

    c.ellipse(
      5800,
      GY - 90,
      45,
      90,
      0,
      0,
      7
    );

    c.fill();

    c.globalAlpha = 1;

    // Вороги
    for (const e of this.en) {
      e.draw(c);
    }

    // Гравець
    this.player.draw(c);

    // Частинки
    for (const f of this.fx) {
      c.globalAlpha = Math.max(
        0,
        f.l
      );

      if (f.h) {
        heart(
          c,
          f.x,
          f.y,
          8,
          f.c
        );
      } else {
        c.fillStyle = f.c;

        c.beginPath();

        c.arc(
          f.x,
          f.y,
          4,
          0,
          7
        );

        c.fill();
      }
    }

    c.globalAlpha = 1;

    c.restore();

    // Світлячки
    for (const f of this.ff) {
      const x =
        ((f.x - this.cam * 0.9) % 1380 + 1380) %
          1380 -
        50;

      const y =
        f.y +
        Math.sin(
          this.t * f.s + f.p
        ) * 20;

      const a =
        0.5 +
        0.5 *
          Math.sin(
            this.t * 2 + f.p
          );

      c.fillStyle =
        `rgba(255,246,168,${0.15 * a})`;

      c.beginPath();

      c.arc(
        x,
        y,
        10,
        0,
        7
      );

      c.fill();

      c.fillStyle =
        `rgba(255,250,200,${0.4 + 0.5 * a})`;

      c.beginPath();

      c.arc(
        x,
        y,
        3,
        0,
        7
      );

      c.fill();
    }

    // Промені світла
    c.fillStyle =
      'rgba(255,240,200,.07)';

    for (let i = 0; i < 4; i++) {
      const x =
        200 +
        i * 300 +
        Math.sin(
          this.t * 0.3 + i
        ) * 30;

      c.beginPath();

      c.moveTo(
        x,
        0
      );

      c.lineTo(
        x + 90,
        0
      );

      c.lineTo(
        x + 330,
        720
      );

      c.lineTo(
        x + 150,
        720
      );

      c.fill();
    }

    // HUD
    const n = this.hearts.filter(
      h => h.got
    ).length;

    c.fillStyle = '#fff';
    c.font =
      'bold 26px system-ui,sans-serif';

    c.shadowColor = '#0008';
    c.shadowBlur = 6;

    c.fillText(
      `❤️ Hearts: ${n}/3`,
      40,
      52
    );

    c.fillText(
      'HP: ' +
        '💗'.repeat(
          Math.max(
            0,
            this.player.hp
          )
        ),
      40,
      90
    );

    if (this.player.x > 5200) {
      c.fillText(
        this.open
          ? 'Іди в портал ✨'
          : '🔒 Збери всі 3 сердечка',
        500,
        100
      );
    }

    c.shadowBlur = 0;
  }
}