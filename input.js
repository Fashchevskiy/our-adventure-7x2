export const input = {
    ax: 0,
    jump: false,
    attack: false,
    interact: false,
    run: false
};

const kb = {};
const tc = {};
let joyAx = 0;

const M = {
    KeyA: 'l',
    ArrowLeft: 'l',
    KeyD: 'r',
    ArrowRight: 'r',

    Space: 'jump',
    KeyW: 'jump',
    ArrowUp: 'jump',

    KeyJ: 'attack',
    KeyK: 'attack',

    KeyE: 'interact',

    ShiftLeft: 'run'
};

addEventListener('keydown', e => {
    if (M[e.code]) {
        kb[M[e.code]] = 1;
        e.preventDefault();
    }
});

addEventListener('keyup', e => {
    if (M[e.code]) {
        kb[M[e.code]] = 0;
    }
});

addEventListener('blur', () => {
    for (const k in kb) {
        kb[k] = 0;
    }
});

export function poll() {
    const k =
        (kb.r ? 1 : 0) -
        (kb.l ? 1 : 0);

    input.ax = k || joyAx;

    input.run =
        !!kb.run ||
        (!k && Math.abs(joyAx) > 0.85);

    for (const a of [
        'jump',
        'attack',
        'interact'
    ]) {
        input[a] = !!(kb[a] || tc[a]);
    }
}

export function initTouch() {
    const joy = document.getElementById('joy');
    const knob = joy.firstElementChild;

    let id = null;

    const set = e => {
        const r = joy.getBoundingClientRect();
        const R = r.width / 2;
        const m = R * 0.6;

        const dx = Math.max(
            -m,
            Math.min(
                m,
                e.clientX - (r.left + R)
            )
        );

        joyAx =
            Math.abs(dx) < m * 0.2
                ? 0
                : dx / m;

        knob.style.transform =
            `translateX(${dx}px)`;
    };

    const end = e => {
        if (e.pointerId === id) {
            id = null;
            joyAx = 0;
            knob.style.transform = '';
        }
    };

    joy.addEventListener(
        'pointerdown',
        e => {
            id = e.pointerId;
            joy.setPointerCapture(id);
            set(e);
        }
    );

    joy.addEventListener(
        'pointermove',
        e => {
            if (e.pointerId === id) {
                set(e);
            }
        }
    );

    joy.addEventListener(
        'pointerup',
        end
    );

    joy.addEventListener(
        'pointercancel',
        end
    );

    document
        .querySelectorAll('#btns b')
        .forEach(b => {
            const a = b.dataset.a;

            b.addEventListener(
                'pointerdown',
                e => {
                    tc[a] = 1;
                    b.setPointerCapture(
                        e.pointerId
                    );
                }
            );

            const up = () => {
                tc[a] = 0;
            };

            b.addEventListener(
                'pointerup',
                up
            );

            b.addEventListener(
                'pointercancel',
                up
            );
        });

    addEventListener(
        'contextmenu',
        e => e.preventDefault()
    );
}