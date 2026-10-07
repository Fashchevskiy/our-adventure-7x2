export class Enemy {
  constructor(type, x, y, range) {
    const f = type === 'fox';

    Object.assign(this, {
      type,
      x,
      y,
      x0: x - range,
      x1: x + range,
      hp: f ? 2 : 5,
      w: f ? 54 : 86,
      h: f ? 36 : 58,
      dir: 1,
      dmg: f ? 1 : 2,
      t: 0,
      stun: 0,
      kv: 0,
      swing: -1,
      flash: 0,
      dead: false
    });
  }

  update(dt, p) {
    this.t += dt;
    this.flash -= dt;

    // Якщо ворог оглушений
    if (this.stun > 0) {
      this.stun -= dt;
      this.x += this.kv * dt;
      this.kv *= 0.9;
      return;
    }

    const fox = this.type === 'fox';
    const d = p.x - this.x;
    const near = Math.abs(p.y - this.y) < 90;

    let sp = fox ? 100 : 70;

    // Переслідування гравця
    if (
      near &&
      Math.abs(d) < (fox ? 260 : 380)
    ) {
      this.dir = Math.sign(d) || 1;
      sp = fox ? 190 : 300;
    } else {
      // Патрулювання
      if (this.x > this.x1) {
        this.dir = -1;
      }

      if (this.x < this.x0) {
        this.dir = 1;
      }
    }

    this.x += this.dir * sp * dt;
  }

  draw(c) {
    const sw = Math.sin(this.t * 14) * 6;

    c.save();

    c.translate(
      this.x,
      this.y
    );

    c.scale(
      this.dir,
      1
    );

    // Ефект отримання шкоди
    if (
      this.flash > 0 &&
      Math.floor(this.t * 30) % 2
    ) {
      c.globalAlpha = 0.4;
    }

    // Лисиця
    if (this.type === 'fox') {
      c.fillStyle = '#d9742c';

      // Ноги
      c.fillRect(
        -18 + sw,
        -12,
        7,
        12
      );

      c.fillRect(
        12 - sw,
        -12,
        7,
        12
      );

      // Тіло
      c.beginPath();

      c.ellipse(
        0,
        -20,
        26,
        14,
        0,
        0,
        7
      );

      c.fill();

      // Хвіст
      c.beginPath();

      c.ellipse(
        -30,
        -26,
        16,
        8,
        -0.5,
        0,
        7
      );

      c.fill();

      // Кінчик хвоста
      c.fillStyle = '#fff';

      c.beginPath();

      c.arc(
        -42,
        -30,
        6,
        0,
        7
      );

      c.fill();

      // Голова
      c.fillStyle = '#e8803a';

      c.beginPath();

      c.arc(
        24,
        -28,
        12,
        0,
        7
      );

      c.fill();

      // Вуха
      c.beginPath();

      c.moveTo(16, -36);
      c.lineTo(20, -52);
      c.lineTo(26, -38);

      c.fill();

      c.beginPath();

      c.moveTo(26, -38);
      c.lineTo(32, -50);
      c.lineTo(34, -34);

      c.fill();

      // Очі
      c.fillStyle = '#222';

      c.fillRect(
        28,
        -31,
        4,
        4
      );

      c.fillRect(
        34,
        -26,
        4,
        4
      );
    }

    // Кабан
    else {
      // Ноги
      c.fillStyle = '#4a3022';

      c.fillRect(
        -30 + sw,
        -16,
        10,
        16
      );

      c.fillRect(
        22 - sw,
        -16,
        10,
        16
      );

      // Тіло
      c.fillStyle = '#6b4a3a';

      c.beginPath();

      c.ellipse(
        0,
        -36,
        42,
        26,
        0,
        0,
        7
      );

      c.fill();

      // Щетина
      c.fillStyle = '#3a2418';

      for (
        let i = -30;
        i < 30;
        i += 12
      ) {
        c.beginPath();

        c.moveTo(i, -58);
        c.lineTo(i + 6, -72);
        c.lineTo(i + 12, -58);

        c.fill();
      }

      // Голова
      c.fillStyle = '#7a5645';

      c.beginPath();

      c.arc(
        38,
        -32,
        18,
        0,
        7
      );

      c.fill();

      // Рило
      c.fillStyle = '#fff';

      c.beginPath();

      c.moveTo(46, -24);
      c.lineTo(62, -34);
      c.lineTo(52, -18);

      c.fill();

      // Око
      c.fillStyle = '#222';

      c.fillRect(
        40,
        -40,
        5,
        5
      );
    }

    c.restore();
  }
}