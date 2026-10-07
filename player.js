const HEAD_W = 84;     // ширина голови в грі
const HEAD_LIFT = 0;   // зсув голови вгору(-)/вниз(+)

export class Player {
  constructor(
    x,
    y,
    headFile = 'assets/characters/dasha_head.png',
    color = '#ff6fa5',
    dress = true
  ) {
    Object.assign(this, {
      x,
      y,
      prevY: y,
      vx: 0,
      vy: 0,
      w: 44,
      h: 110,
      face: 1,
      ground: false,
      t: 0,
      prevJump: false,
      atk: 0,
      swing: 0,
      hp: 5,
      inv: 0,
      kb: 0,
      color,
      dress
    });

    const i = new Image();

    i.onload = () => {
      this.head = i;
    };

    i.src = headFile;
  }

  update(dt, inp, solids) {
    this.t += dt;
    this.inv -= dt;

    const sp = inp.run ? 400 : 250;

    this.vx = inp.ax * sp + this.kb;
    this.kb *= Math.pow(0.001, dt);

    if (inp.ax) {
      this.face = Math.sign(inp.ax);
    }

    // Стрибок
    if (
      inp.jump &&
      !this.prevJump &&
      this.ground
    ) {
      this.vy = -800;
      this.ground = false;
    }

    this.prevJump = inp.jump;

    // Атака
    if (
      inp.attack &&
      this.atk <= 0
    ) {
      this.atk = 0.25;
      this.swing++;
    }

    this.atk -= dt;

    // Гравітація
    this.vy = Math.min(
      this.vy + 1900 * dt,
      1200
    );

    this.x += this.vx * dt;

    // Горизонтальні колізії
    for (const s of solids) {
      if (!s.p && this.hit(s)) {
        this.x =
          this.vx > 0
            ? s.x - this.w / 2
            : s.x + s.w + this.w / 2;
      }
    }

    // Вертикальний рух
    this.prevY = this.y;
    this.y += this.vy * dt;
    this.ground = false;

    // Вертикальні колізії
    for (const s of solids) {
      if (this.hit(s)) {
        if (
          s.p &&
          !(
            this.vy >= 0 &&
            this.prevY <= s.y + 2
          )
        ) {
          continue;
        }

        if (this.vy >= 0) {
          this.y = s.y;
          this.ground = true;
        } else if (!s.p) {
          this.y = s.y + s.h + this.h;
        }

        this.vy = 0;
      }
    }
  }

  hit(s) {
    return (
      this.x + this.w / 2 > s.x &&
      this.x - this.w / 2 < s.x + s.w &&
      this.y > s.y &&
      this.y - this.h < s.y + s.h
    );
  }

  box() {
    const a = this.x;
    const b = this.x + this.face * 95;

    return {
      x1: Math.min(a, b),
      x2: Math.max(a, b),
      y1: this.y - 110,
      y2: this.y
    };
  }

  hurt(d, dir) {
    if (this.inv > 0) {
      return;
    }

    this.hp -= d;
    this.inv = 1.2;
    this.kb = dir * 450;
    this.vy = -350;
    this.ground = false;
  }

  draw(c) {
    if (
      this.inv > 0 &&
      Math.floor(this.t * 20) % 2
    ) {
      return;
    }

    const mv =
      Math.abs(this.vx) > 10 &&
      this.ground;

    const sw = mv
      ? Math.sin(
          this.t *
            (Math.abs(this.vx) > 300
              ? 22
              : 14)
        )
      : 0;

    c.save();

    c.translate(
      this.x,
      this.y
    );

    c.scale(
      this.face,
      1
    );

    // Ноги
    c.fillStyle = this.dress
      ? '#f2c9a5'
      : '#2c3e66';

    c.fillRect(
      -13 + sw * 9,
      -24,
      9,
      24
    );

    c.fillRect(
      4 - sw * 9,
      -24,
      9,
      24
    );

    // Тіло
    c.fillStyle = this.color;
    c.beginPath();

    if (this.dress) {
      c.moveTo(-14, -62);
      c.lineTo(14, -62);
      c.lineTo(26, -20);
      c.lineTo(-26, -20);
    } else {
      c.moveTo(-16, -64);
      c.lineTo(16, -64);
      c.lineTo(16, -22);
      c.lineTo(-16, -22);
    }

    c.fill();

    // Голова
    const hy =
      -60 +
      (mv ? -Math.abs(sw) * 4 : 0) +
      HEAD_LIFT;

    if (this.head) {
      const hh =
        HEAD_W *
        this.head.height /
        this.head.width;

      c.drawImage(
        this.head,
        -HEAD_W / 2,
        hy - hh,
        HEAD_W,
        hh
      );
    } else {
      // Запасний варіант голови
      c.fillStyle = this.dress
        ? '#5a3420'
        : '#2a2018';

      c.beginPath();

      c.arc(
        0,
        hy - 38,
        34,
        0,
        7
      );

      c.fill();

      // Обличчя
      c.fillStyle = '#f2c9a5';

      c.beginPath();

      c.arc(
        0,
        hy - 34,
        28,
        0,
        7
      );

      c.fill();

      // Очі
      c.fillStyle = '#222';

      c.fillRect(
        6,
        hy - 40,
        5,
        7
      );

      c.fillRect(
        -9,
        hy - 40,
        5,
        7
      );

      // Посмішка
      c.strokeStyle = '#c0505a';
      c.lineWidth = 2;

      c.beginPath();

      c.arc(
        0,
        hy - 28,
        6,
        0.2,
        2.9
      );

      c.stroke();
    }

    // Ефект атаки
    if (this.atk > 0) {
      c.strokeStyle = '#fff';
      c.globalAlpha = Math.min(
        1,
        this.atk * 4
      );

      c.lineWidth = 6;

      c.beginPath();

      c.arc(
        20,
        -60,
        60,
        -1.2,
        1.2
      );

      c.stroke();

      c.globalAlpha = 1;
    }

    c.restore();
  }
}