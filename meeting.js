import { Player } from './player.js';
import { tree, heart } from './forest.js';

const GY = 620;

export class Meeting {
  constructor(save, onSave, goto) {
    Object.assign(this, {
      goto,
      t: 0,
      state: 'walk',
      st: 0,
      fx: [],
      hc: 0,
      end: false
    });

    this.solids = [
      {
        x: 0,
        y: GY,
        w: 1280,
        h: 200
      }
    ];

    this.p = new Player(
      100,
      GY
    );

    this.n = new Player(
      1000,
      GY,
      'assets/characters/me_head.png',
      '#4a8fe0',
      false
    );

    this.n.face = -1;

    this.stars = Array.from(
      { length: 80 },
      (_, i) => ({
        x: (i * 397) % 1280,
        y: (i * 173) % 420,
        r: 1 + (i % 3) * 0.6
      })
    );
  }

  update(dt, inp) {
    this.t += dt;

    const p = this.p;
    const n = this.n;

    n.update(
      dt,
      { ax: 0 },
      this.solids
    );

    if (this.state === 'walk') {
      p.update(
        dt,
        inp,
        this.solids
      );

      p.x = Math.max(
        40,
        Math.min(
          1240,
          p.x
        )
      );

      if (p.x > n.x - 170) {
        this.state = 'meet';
        this.st = 0;
      }
    } else {
      this.st += dt;

      if (this.state === 'meet') {
        p.update(
          dt,
          { ax: 0 },
          this.solids
        );

        p.x +=
          (n.x - 95 - p.x) *
          Math.min(
            1,
            dt * 3
          );

        p.face = 1;
        n.face = -1;

        this.hc -= dt;

        if (this.hc <= 0) {
          this.hc = 0.18;

          const mx =
            (p.x + n.x) / 2;

          this.fx.push({
            x: mx + (Math.random() - 0.5) * 120,
            y: GY - 200,
            vy: -70 - Math.random() * 50,
            l: 2.5
          });
        }

        if (this.st > 6) {
          this.state = 'done';
        }
      } else {
        p.update(
          dt,
          inp,
          this.solids
        );

        p.x = Math.max(
          40,
          Math.min(
            1240,
            p.x
          )
        );

        if (Math.abs(p.x - 1190) < 50) {
          this.end = true;
        }
      }
    }

    // Сердечка
    for (const f of this.fx) {
      f.y += f.vy * dt;
      f.l -= dt;
    }

    this.fx = this.fx.filter(
      f => f.l > 0
    );
  }

  draw(c) {
    const p = this.p;
    const n = this.n;
    const t = this.t;

    let k = 0;

    if (this.state === 'meet') {
      k = Math.min(
        1,
        this.st / 2
      );
    } else if (this.state === 'done') {
      k = Math.max(
        0,
        1 - (this.st - 6) / 1.5
      );
    }

    k = k * k * (3 - 2 * k);

    // Небо
    const g = c.createLinearGradient(
      0,
      0,
      0,
      720
    );

    g.addColorStop(
      0,
      '#0b0a2e'
    );

    g.addColorStop(
      0.7,
      '#3a1d5c'
    );

    g.addColorStop(
      1,
      '#7a3a6a'
    );

    c.fillStyle = g;

    c.fillRect(
      0,
      0,
      1280,
      720
    );

    c.save();

    c.translate(
      640,
      470
    );

    c.scale(
      1 + 0.55 * k,
      1 + 0.55 * k
    );

    c.translate(
      -(
        640 +
        ((p.x + n.x) / 2 - 640) * k
      ),
      -470
    );

    // Зірки
    c.fillStyle = '#fff';

    for (const s of this.stars) {
      c.globalAlpha =
        0.5 +
        0.5 *
          Math.sin(
            t * 2 + s.x
          );

      c.beginPath();

      c.arc(
        s.x,
        s.y,
        s.r,
        0,
        7
      );

      c.fill();
    }

    c.globalAlpha = 1;

    // Місяць
    c.fillStyle = '#fff6d8';

    c.beginPath();

    c.arc(
      1000,
      130,
      46,
      0,
      7
    );

    c.fill();

    // Задні дерева
    for (let i = -1; i < 9; i++) {
      tree(
        c,
        i * 170 + 40,
        GY,
        330 + ((i * 37 % 5 + 5) % 5) * 30,
        '#1b1440'
      );
    }

    for (let i = 0; i < 7; i++) {
      tree(
        c,
        i * 210 + 110,
        GY + 30,
        280,
        '#2a1d5c'
      );
    }

    // Земля
    const gr = c.createLinearGradient(
      0,
      GY,
      0,
      720
    );

    gr.addColorStop(
      0,
      '#2f5f45'
    );

    gr.addColorStop(
      1,
      '#14301f'
    );

    c.fillStyle = gr;

    c.fillRect(
      -300,
      GY,
      1900,
      200
    );

    c.fillStyle = '#5fbf6b';

    c.fillRect(
      -300,
      GY,
      1900,
      6
    );

    // Лавки
    c.fillStyle = '#6b4a3a';

    c.fillRect(
      330,
      GY - 34,
      150,
      14
    );

    c.fillRect(
      345,
      GY - 20,
      12,
      20
    );

    c.fillRect(
      455,
      GY - 20,
      12,
      20
    );

    c.fillRect(
      740,
      GY - 70,
      170,
      14
    );

    c.fillRect(
      755,
      GY - 56,
      12,
      56
    );

    c.fillRect(
      885,
      GY - 56,
      12,
      56
    );

    c.fillStyle = '#fff';

    c.fillRect(
      780,
      GY - 84,
      22,
      14
    );

    c.fillRect(
      840,
      GY - 84,
      22,
      14
    );

    // Вогнище
    const fl =
      1 +
      0.15 * Math.sin(t * 17) +
      0.1 * Math.sin(t * 9);

    const fg = c.createRadialGradient(
      620,
      GY - 30,
      5,
      620,
      GY - 30,
      220 * fl
    );

    fg.addColorStop(
      0,
      'rgba(255,170,60,.55)'
    );

    fg.addColorStop(
      1,
      'rgba(255,170,60,0)'
    );

    c.fillStyle = fg;

    c.fillRect(
      300,
      GY - 300,
      640,
      400
    );

    c.fillStyle = '#4a2f20';

    c.fillRect(
      585,
      GY - 12,
      70,
      12
    );

    c.fillStyle = '#ff7a1a';

    c.beginPath();

    c.ellipse(
      620,
      GY - 32,
      22 * fl,
      34 * fl,
      0,
      0,
      7
    );

    c.fill();

    c.fillStyle = '#ffd24a';

    c.beginPath();

    c.ellipse(
      620,
      GY - 26,
      12 * fl,
      22 * fl,
      0,
      0,
      7
    );

    c.fill();

    // Портал після зустрічі
    if (this.state === 'done') {
      const a = Math.min(
        1,
        this.st - 6
      );

      c.globalAlpha = Math.max(
        0,
        a
      );

      c.fillStyle = '#ff9be0';

      c.beginPath();

      c.ellipse(
        1190,
        GY - 90,
        45,
        90,
        0,
        0,
        7
      );

      c.fill();

      c.globalAlpha = 1;
    }

    // Персонажі
    n.draw(c);
    p.draw(c);

    // Сердечка
    for (const f of this.fx) {
      c.globalAlpha = Math.min(
        1,
        f.l
      );

      heart(
        c,
        f.x,
        f.y,
        16,
        '#ff5082'
      );
    }

    c.globalAlpha = 1;

    // Світлячки
    for (let i = 0; i < 25; i++) {
      const x =
        (i * 53 +
          t * 8 * (1 + i % 3)) %
        1280;

      const y =
        250 +
        (i * 61) % 350 +
        Math.sin(t + i) * 15;

      c.fillStyle =
        `rgba(255,246,168,${0.4 + 0.4 * Math.sin(t * 2 + i)})`;

      c.beginPath();

      c.arc(
        x,
        y,
        2.5,
        0,
        7
      );

      c.fill();
    }

    c.restore();

    // Текст
    c.fillStyle = '#fff';

    c.font =
      'bold 30px system-ui,sans-serif';

    c.textAlign = 'center';

    c.shadowColor = '#000a';
    c.shadowBlur = 8;

    if (this.state === 'walk') {
      c.fillText(
        'Іди вправо →',
        640,
        90
      );
    }

    if (
      this.state === 'meet' &&
      this.st > 1.5
    ) {
      c.fillText(
        'Нарешті ми разом ❤️',
        640,
        100
      );
    }

    if (this.state === 'done') {
      c.fillText(
        this.end
          ? '🪐 LOVE PLANET — наступний етап скоро ✨'
          : 'Іди в портал →',
        640,
        100
      );
    }

    c.shadowBlur = 0;
    c.textAlign = 'left';

    // Затемнення при старті
    if (t < 0.8) {
      c.fillStyle =
        `rgba(0,0,0,${1 - t / 0.8})`;

      c.fillRect(
        0,
        0,
        1280,
        720
      );
    }
  }
}