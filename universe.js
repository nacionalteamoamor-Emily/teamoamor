/* ============================================================
   NACIONAL × AMOR · UNIVERSO 3D A PANTALLA COMPLETA
   ------------------------------------------------------------
   Escena Three.js (r160) con la cámara en el centro de un mundo
   3D. Versión chica y romántica: centro intacto, alrededor
   solo fotos y unos pocos regalos.
   Todo se edita en UNIVERSE_CONFIG (más abajo).
   ============================================================ */
"use strict";

/* ---------- Helpers reutilizados (paleta, semilla, texturas, corazón, rosa) ---------- */
const UNIVERSE_PALETTE = {
  blue: 0x003b70,
  blueLight: 0x2f7fff,
  red: 0xd71920,
  redSoft: 0xe85d68,
  white: 0xffffff,
  night: 0x061426,
  steel: 0xa8bed5
};
function universeClamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function universeSeed(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function universeSupportsWebGL() {
  try {
    const probe = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (probe.getContext("webgl2") || probe.getContext("webgl"))
    );
  } catch (error) {
    return false;
  }
}

function universeGlowTexture(stops) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  const glow = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([offset, color]) => glow.addColorStop(offset, color));
  context.fillStyle = glow;
  context.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function universeSparkTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  context.translate(size / 2, size / 2);
  context.fillStyle = "rgba(255, 255, 255, 1)";
  context.shadowColor = "rgba(170, 215, 255, 0.95)";
  context.shadowBlur = 18;
  context.beginPath();
  context.moveTo(0, -60);
  context.quadraticCurveTo(7, -7, 60, 0);
  context.quadraticCurveTo(7, 7, 0, 60);
  context.quadraticCurveTo(-7, 7, -60, 0);
  context.quadraticCurveTo(-7, -7, 0, -60);
  context.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function universeStarTexture() {
  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  const glow = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  glow.addColorStop(0, "rgba(255, 255, 255, 1)");
  glow.addColorStop(0.2, "rgba(235, 246, 255, 0.9)");
  glow.addColorStop(0.55, "rgba(150, 205, 255, 0.24)");
  glow.addColorStop(1, "rgba(120, 180, 255, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function universeEnvironment(renderer) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d");

  const base = context.createLinearGradient(0, 0, 0, 512);
  base.addColorStop(0, "#0b315a");
  base.addColorStop(0.42, "#061426");
  base.addColorStop(1, "#071b35");
  context.fillStyle = base;
  context.fillRect(0, 0, 1024, 512);

  const blob = (x, y, radius, color) => {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  };

  blob(170, 160, 310, "rgba(22, 112, 220, 0.95)");
  blob(830, 310, 330, "rgba(255, 48, 60, 0.86)");
  blob(520, 80, 250, "rgba(255, 255, 255, 0.82)");
  blob(500, 430, 320, "rgba(0, 59, 112, 0.8)");

  context.save();
  context.globalAlpha = 0.85;
  context.fillStyle = "#ffffff";
  context.fillRect(60, 112, 600, 9);
  context.fillRect(300, 300, 640, 5);
  context.fillRect(740, 176, 240, 7);
  context.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  const generator = new THREE.PMREMGenerator(renderer);
  generator.compileEquirectangularShader();
  const environment = generator.fromEquirectangular(texture).texture;
  texture.dispose();
  generator.dispose();
  return environment;
}

function universeHeartGeometry() {
  const shape = new THREE.Shape();
  const x = 0;
  const y = 0;
  shape.moveTo(x, y + 0.5);
  shape.bezierCurveTo(x, y + 0.5, x - 0.5, y + 1.2, x - 1.1, y + 0.6);
  shape.bezierCurveTo(x - 1.8, y, x - 1.1, y - 0.8, x, y - 1.35);
  shape.bezierCurveTo(x + 1.1, y - 0.8, x + 1.8, y, x + 1.1, y + 0.6);
  shape.bezierCurveTo(x + 0.5, y + 1.2, x, y + 0.5, x, y + 0.5);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.34,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 3,
    curveSegments: 10
  });
  geometry.center();
  geometry.scale(0.52, 0.52, 0.52);
  return geometry;
}

/* Corazón de partículas del centro (mismo trazo que la referencia, en tricolor).
   Se devuelve con opacidad 0: la intro lo enciende de a poco. */
function uParticleHeart(scale, z, count) {
  const group = new THREE.Group();
  group.position.z = z;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const palette = [[0.18, 0.52, 1], [1, 0.2, 0.26], [1, 1, 1]];
  for (let i = 0; i < count; i += 1) {
    const t = Math.random() * Math.PI * 2;
    const h = (a) => 16 * Math.pow(Math.sin(a), 3);
    const v = (a) => 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
    const x0 = h(t), y0 = v(t);
    const tx = h(t + 0.001) - x0, ty = v(t + 0.001) - y0;
    const len = Math.hypot(tx, ty) || 1;
    const off = (Math.random() - 0.5) * 3.2;
    pos.set([
      (x0 + (-ty / len) * off) * scale,
      (y0 + (tx / len) * off) * scale + scale * 2.4,
      (Math.random() - 0.5) * 7 * scale
    ], i * 3);
    const k = Math.random();
    const c = palette[k < 0.42 ? 0 : k < 0.78 ? 1 : 2];
    col.set(c, i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.42, map: universeStarTexture(), vertexColors: true,
    transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  group.add(points);
  group.userData.material = mat;
  return group;
}

/* Brazos espirales tricolor: una sola nube de puntos, muy barata en celular. */
function uSpiralGalaxy(radius, arms, count) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const palette = [[0.15, 0.45, 0.95], [0.95, 0.16, 0.22], [0.9, 0.95, 1]];
  for (let i = 0; i < count; i += 1) {
    const r = 1.8 + Math.pow(Math.random(), 0.72) * radius;
    const arm = Math.floor(Math.random() * arms);
    const theta = (arm / arms) * Math.PI * 2 + r * 0.27 + (Math.random() - 0.5) * 0.55;
    const scatter = (Math.random() - 0.5) * (1.2 + r * 0.07);
    pos.set([
      Math.cos(theta) * r + scatter,
      Math.sin(theta) * r * 0.72 + (Math.random() - 0.5) * 1.4,
      -26 + (Math.random() - 0.5) * 7
    ], i * 3);
    const t = Math.random();
    const c = t < 0.45 ? palette[0] : t < 0.72 ? palette[1] : palette[2];
    col.set(c, i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.28, map: universeStarTexture(), vertexColors: true,
    transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.position.z = 0;
  return pts;
}

function uStarShapeGeometry(points = 5, outer = 0.6, inner = 0.27) {
  const s = new THREE.Shape();
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 ? inner : outer;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
  }
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
  g.center();
  return g;
}

/* Regalos chicos: solo caja, corazón o estrella. Sin cofres ni sobres. */
function uGiftMesh(type, M, heartGeo, heartSpriteTex) {
  const group = new THREE.Group();
  let lid = null, reveal = null;
  const addRevealHeart = (y, colorIndex) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: heartSpriteTex[colorIndex % heartSpriteTex.length],
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false
    }));
    s.position.set(0, y, 0.5);
    s.scale.setScalar(0.01);
    group.add(s);
    return s;
  };

  if (type === "box") {
    const w = 1.08, h = 0.8, d = 0.86;
    const base = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.red);
    base.position.y = -h / 2;
    group.add(base);
    const bandV = new THREE.Mesh(new THREE.BoxGeometry(0.13, h + 0.04, d + 0.03), M.white);
    const bandH = new THREE.Mesh(new THREE.BoxGeometry(w + 0.03, 0.13, d + 0.03), M.white);
    group.add(bandV, bandH);
    lid = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.22, d + 0.1), M.blue);
    top.position.y = 0.11;
    lid.add(top);
    const lidBand = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.24, d + 0.13), M.white);
    lidBand.position.y = 0.1;
    lid.add(lidBand);
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.045, 6, 14), M.redSoft);
    bow.position.set(0, 0.26, 0);
    bow.rotation.x = Math.PI / 2;
    lid.add(bow);
    group.add(lid);
    reveal = addRevealHeart(0.05, 1);
  } else if (type === "star") {
    const star = new THREE.Mesh(uStarShapeGeometry(), M.blue);
    group.add(star);
    const small = new THREE.Mesh(uStarShapeGeometry(5, 0.3, 0.13), M.white);
    small.position.z = 0.12;
    group.add(small);
    reveal = addRevealHeart(0, 1);
  } else {
    const h = new THREE.Mesh(heartGeo, M.red);
    h.scale.setScalar(1.15);
    group.add(h);
    const rim = new THREE.Mesh(heartGeo, M.blue);
    rim.scale.setScalar(1.32);
    rim.position.z = -0.09;
    group.add(rim);
    reveal = addRevealHeart(0, 2);
  }
  group.userData = { type, lid, reveal, opened: 0, baseY: 0 };
  return group;
}

function universeRose(materials, random) {
  const rose = new THREE.Group();
  const petalGeometry = new THREE.SphereGeometry(1, 10, 7);

  const layers = [
    { count: 8, radius: 0.36, scale: [0.34, 0.26, 0.1], material: materials.red, angle: 0 },
    { count: 6, radius: 0.26, scale: [0.27, 0.22, 0.09], material: materials.redSoft, angle: 0.4 },
    { count: 4, radius: 0.16, scale: [0.2, 0.17, 0.08], material: materials.white, angle: 0.8 },
    { count: 3, radius: 0.08, scale: [0.13, 0.12, 0.07], material: materials.blue, angle: 1.2 }
  ];

  layers.forEach((layer) => {
    for (let index = 0; index < layer.count; index += 1) {
      const angle = (index / layer.count) * Math.PI * 2 + layer.angle;
      const petal = new THREE.Mesh(petalGeometry, layer.material);
      petal.position.set(
        Math.cos(angle) * layer.radius,
        Math.sin(angle) * layer.radius,
        (random() - 0.5) * 0.04
      );
      petal.scale.set(layer.scale[0], layer.scale[1], layer.scale[2]);
      petal.rotation.set(random() * 0.3, random() * 0.3, angle);
      rose.add(petal);
    }
  });

  const center = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), materials.white);
  center.position.z = 0.11;
  rose.add(center);

  for (let index = 0; index < 3; index += 1) {
    const angle = (index / 3) * Math.PI * 2 + 0.4;
    const leaf = new THREE.Mesh(petalGeometry, materials.leaf);
    leaf.position.set(Math.cos(angle) * 0.48, Math.sin(angle) * 0.48, -0.08);
    leaf.scale.set(0.1, 0.29, 0.035);
    leaf.rotation.z = angle - Math.PI / 2;
    rose.add(leaf);
  }

  return rose;
}


/* ============================================================
   CONFIGURACIÓN EDITABLE
   ============================================================ */
const UNIVERSE_CONFIG = {
  /* ==========================================================
     1) FOTO DEL MEDIO
     Reemplazá assets/foto-central.jpg por la misma ruta/nombre.
     "position" recorta la foto: "50% 50%" = centro, "50% 30%" = más arriba.
     ========================================================== */
  photo: { src: "assets/foto-central.jpg", position: "50% 50%" },

  /* ==========================================================
     2) TEXTOS  ← editá SOLAMENTE acá
     ========================================================== */
  texts: {
    welcome: "Bienvenida a nuestra galaxia teamo mivida❤️💙🤍",
    hint: "Desliza la pantalla para mirar alrededor y toca cosas para abrirlas y eso",
    centerKicker: "Mi cabeza de pingo",
    centerTitle: "Vos",
    centerText: "Hablando posta me da mucha risa JAJAJJA, pero te juro q te amo, no sabia q poner y ta JAJAJAJ",
    centerSign: "Te amo muchísimo ❤️💙🤍",
    memoryKicker: "Pequeños regalitos con cariño de tu supernovio dea",
    giftKicker: "TE RE AMOOOOO",
    roseTap: "Te doy un beso amor DEAA, toma una rosita 🌹"
  },

  /* ==========================================================
     3) CORAZÓN Y GALAXIA DEL CENTRO (dejalo como está)
     ========================================================== */
  galaxy: { heartScale: 0.42, heartZ: -26, spiralRadius: 25, arms: 4 },

  /* ==========================================================
     4) FOTOS ALREDEDOR
     Una línea = una foto. Agregá todas las que quieras copiando
     una línea y cambiando src, az, el y r.
       az = giro (0 = frente, + = derecha, - = izquierda)
       el = altura (- = abajo, + = arriba)
       r  = distancia (9 a 13 se ve bien en celular)
     Si el archivo no existe, se ve un lugar lindo para tu foto.
     ========================================================== */
  memories: [
    { src: "assets/recuerdo-01.jpg", az: 58, el: 4, r: 10.5, title: "Teamo", text: "Pero no solo te amo, porque te juro sos mi novia, mi mejor amiga y puedo ser mas yo contigo que con nadie mas. Sos muy personal para mi te juro te re amo.", sign: "Teamo ∞." },
    { src: "assets/recuerdo-02.jpg", az: -62, el: -6, r: 10.5, title: "Tu VOZ", text: "Tenia que tomarme un espacio para hablar esto sacando a Nacional de todo esto, me encanta, me enamora, me parece tierna y es muy bonita, te juro me encanta una banda. Podria hablarte todo el dia de porque me encanta tanto AJAKSJK.", sign: "Fuera de eso, me quiero descargar tu playlist si lees esto pasame todo " },
    { src: "assets/recuerdo-03.jpg", az: 132, el: 8, r: 11.5, title: "Lo HERMOSA que sos", text: "Yo se que tenes una inseguridad en este tema, pero te juro por mi paquito que vos sabes que lo re amo y no lo pondria en juego por nada en el mundo, pero justamente lo pongo aca porque es verdad lo que digo. Te prometo que ta ademas de ser hermosa saliste muuuuy bien en la foto, mira que yo no soy NADA fotogenico salgo todo torcido por mas posicion buena que intente ponerme rial JAJAJ, pero vos salis impecable JAJAJAJ, realmente osea se que ta coso usaste filtro, pero estoy seguro que ta coso, no se explicarme, pero te re amo ok y que ta no me molesta igual a mi no sacarme fotos porq de vrd en mi caso salgo muy mal, entonces de esa parte compartimos opinion mucho, no soy de las fotos JAJAJ.", sign: "Ojala nunca, pero nunca de los nunca pase nada en la relacion porque de verdad te amo demasiado" },
    { src: "assets/recuerdo-04.jpg", az: -138, el: 6, r: 11.5, title: "Estoy muy feliz", text: "Posta estoy demasiado feliz, pero no solo porque te amo, si no porque tuve la valentia de decirte lo que siento aunque fue un poco de virgo meter a Nacional y tambien en esto, aguantas todas mis pelotudeces JAJAJ, pero sacando todo esto literalmente tuviste experiencias de mrd en tu anterior relacion, te quiero hacer feliz y tambien hacer sentir una princesa que realmente nunca te falte felicidad, no quiero ser tu preocupacion de nada, no quiero que sobre penses posta, habla todo, yo te pregunto absolutamente todo igual porque se que a veces capaz puede ser que te cueste expresarte o hablar, prefiero que hables a mi no me molesta absolutamente nada, lo que me molestaria es saber que estas mal por algo y no me dijiste nada porq pensas que es molestar o una boludez. Quiero cuidarte y que estes bien de verdad 💗", sign: "Mi prioridad es tu tranquilidad de todo💖" },
    { src: "assets/recuerdo-05.jpg", az: 26, el: 42, r: 11, title: "La trasparencia", text: "Soy muy trasparente en todo lo que digo a menos que sea una boludez, soy trasparente y serio cuando debo estarlo. A lo que voy con esto es que tengo las cosas bastantes claras del tipo de relacion que quiero contigo, no te quiero por tu cuerpo, ni por tu cara, te amo por como sos, lo que compartimos y lo que me haces sentir. Me da completamente igual si el dia de mañana me entero que por ejemplo tuviste un accidente y te paso algo en la cara yo quiero aclarar eso, me da igual, mientras te tenga a vos moralmente correcto para mi en mi vida, seras la mujer mas amada del mundo porque ya sabes que no soy tibio a mi me gusta amar muchisimo bien intenso. Ademas decime mis errores, me puedo equivocar a ver no soy tonto se las cosas que estan bien y las que no, pero puedo equivocarme o confundirme. pido que me comuniques todo, para mi todo es MUY importante y mas si se trata de vos. 💞", sign: "Totalmente sincero, lo que realmente siento" },
    { src: "assets/recuerdo-06.jpg", az: -34, el: -40, r: 11, title: "Cuidarnos", text: "Con cuidarnos me refiero a ademas de ser sincero en todo, poder comprendernos y entender como somos. Yo por ejemplo soy muy celoso, pero nunca te voy a prohibir nada ni mucho menos, aunque prefiero siempre que las cosas nazcan de uno es importantisimo JKASJKA a mi me encanta como sos no te veo nada de malo, pero siempre me preocupo por todo esto y lo importante que es que ambos nos sintamos seguros, aclaro que con esto no quiero llegar a decir que estas atada a mi NO. Yo digo y me refiero que tiene que haber siempre una comunicacion y ademas que te nazca la mayoria de cosas y no esperar a que te digan y coso. Te amo de verdad ya te lo dije 800 veces, yo soy alguien que me suele nacer las cosas a menos que no me de cuenta, pero intento que me nazca todo y no esperar a que me lo digas JAJA. Se que no sos de revisar celular y eso esta perfecto igual yo tampoco soy asi, pero de todas formas yo te digo que mi contraseña es tu cumpleaños porque no me gusta que puedas llegar a desconfiar por X, prefiero que sepas absolutamente todo y asi sera siempre 💕", sign: "Estas totalmente segura y te voy a cuidar mucho 💗" }
  ],

  /* ==========================================================
     5) REGALOS CHICOS (solo 4)
     Tipos: "box" (cajita), "heart" (corazón) o "star" (estrella).
     No hay cofres, sobres ni cartas: quedó todo más simple.
     Agregá otro copiando una línea. size: 0.8 a 1 se ve bien.
     photo (opcional): "assets/mi-foto.jpg" dentro de la sorpresa.
     ========================================================== */
  gifts: [
    { type: "box", az: 20, el: -8, r: 9.5, size: 0.9, title: "Para vos", text: "Osea no hay nada, pero te mando un beso JAJAJ", sign: "Abrila las veces que quieras miamor" },
    { type: "heart", az: -54, el: 9, r: 9.8, size: 0.95, title: "Mi amor", text: "Vos sabes cuanto me gusta Nacional, pero somos como Davo y Mile 😻", sign: "Azul, rojo, blanco… y vos😽." },
    { type: "box", az: 126, el: 7, r: 10.5, size: 0.8, title: "Te cuento algo", text: "Estoy re enamorado mal, osea ya sabes, pero te juro que te amo un monton KAJSKAJ", sign: "Cualquier detalle nunca es suficiente AKSJKA" },
    { type: "star", az: -136, el: -10, r: 11, size: 0.9, title: "Gracias", text: "Gracias posta porque literalmente nunca me senti tan bien con alguien y eso que es poco lo que te conozco te re amo", sign: "Sos el amor mas alla de mi vida, porq te quiero amar en cualquier otra vida te juro" }
  ]
};

/* ============================================================
   UTILIDADES
   ============================================================ */
const uRad = (d) => (d * Math.PI) / 180;
const uPos = (azDeg, elDeg, r) => {
  const a = uRad(azDeg), e = uRad(elDeg);
  return new THREE.Vector3(r * Math.cos(e) * Math.sin(a), r * Math.sin(e), -r * Math.cos(e) * Math.cos(a));
};
const uEase = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const uStep = (p, a, b) => uEase((p - a) / (b - a));
const uWait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function uHeartPath(ctx, cx, cy, s) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.9);
  ctx.bezierCurveTo(cx - s * 1.3, cy - s * 0.2, cx - s * 0.6, cy - s * 1.1, cx, cy - s * 0.4);
  ctx.bezierCurveTo(cx + s * 0.6, cy - s * 1.1, cx + s * 1.3, cy - s * 0.2, cx, cy + s * 0.9);
  ctx.closePath();
}

function uLoadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = (window.__PHOTO_DATA_URLS__ && window.__PHOTO_DATA_URLS__[src]) || src;
  });
}

function uParseFocal(value) {
  const t = String(value || "50% 50%").split(/\s+/).map((v) => parseFloat(v) / 100);
  return { x: isFinite(t[0]) ? t[0] : 0.5, y: isFinite(t[1]) ? t[1] : isFinite(t[0]) ? t[0] : 0.5 };
}

/* Foto recortada tipo "cover" a un lienzo de tamaño acotado (ahorra memoria en celulares). */
function uPhotoTexture(img, label, focal, maxH) {
  const h = maxH, w = Math.round(h * 0.8);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const x = c.getContext("2d");
  let usable = false;
  if (img) {
    try {
      const s = Math.max(w / img.width, h / img.height);
      const sw = w / s, sh = h / s;
      x.drawImage(img, (img.width - sw) * focal.x, (img.height - sh) * focal.y, sw, sh, 0, 0, w, h);
      x.getImageData(0, 0, 1, 1); // detecta imágenes file:// que no pueden subir como textura
      usable = true;
    } catch (error) { usable = false; }
  }
  if (usable) {
    // La imagen ya quedó pintada en el lienzo.
  } else {
    const g = x.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#0d3f7a"); g.addColorStop(0.55, "#0a2344"); g.addColorStop(1, "#5a0d16");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = "rgba(255,255,255,.85)"; x.lineWidth = w * 0.012;
    uHeartPath(x, w / 2, h * 0.42, w * 0.24); x.stroke();
    x.fillStyle = "rgba(255,255,255,.92)"; x.textAlign = "center";
    x.font = `italic 600 ${Math.round(w * 0.085)}px "Cormorant Garamond", Georgia, serif`;
    x.fillText("Tu foto va acá", w / 2, h * 0.78);
    x.font = `500 ${Math.round(w * 0.04)}px Manrope, Arial, sans-serif`;
    x.fillStyle = "rgba(255,255,255,.6)"; x.fillText(label, w / 2, h * 0.84);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* Frase en una textura de lienzo, con ajuste de línea; devuelve un plano 3D. */
function uTextPlane(text, worldW, style) {
  const W = 1024, fs = 92;
  const font = `italic 600 ${fs}px "Cormorant Garamond", Georgia, serif`;
  const c = document.createElement("canvas");
  c.width = W;
  let x = c.getContext("2d");
  x.font = font;
  const lines = [];
  let line = "";
  text.split(" ").forEach((word) => {
    const t = line ? `${line} ${word}` : word;
    if (x.measureText(t).width > W - 120 && line) { lines.push(line); line = word; } else line = t;
  });
  lines.push(line);
  const lh = fs * 1.2;
  c.height = Math.ceil(lines.length * lh + 90);
  x = c.getContext("2d");
  x.font = font; x.textAlign = "center"; x.textBaseline = "middle";
  const glow = style === 1 ? "#ff2a38" : style === 2 ? "#2f7fff" : "#9cc4ff";
  const y0 = (c.height - lines.length * lh) / 2 + lh / 2;
  [[40, 1], [8, 1]].forEach(([blur]) => {
    x.shadowColor = glow; x.shadowBlur = blur; x.fillStyle = "#ffffff";
    lines.forEach((l, i) => x.fillText(l, W / 2, y0 + i * lh));
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(worldW, (worldW * c.height) / W),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, toneMapped: false })
  );
  return mesh;
}

/* Marco tricolor con volumen: rojo interior, blanco medio, azul exterior. */
function uTriFrame(w, h, mats, k) {
  const g = new THREE.Group();
  let iw = w, ih = h;
  [[0.1 * k, 0.5 * k, mats.red], [0.12 * k, 0.62 * k, mats.white], [0.3 * k, 0.4 * k, mats.blue]].forEach(([t, d, m]) => {
    const bar = (bw, bh, x, y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, d), m); b.position.set(x, y, 0); g.add(b); };
    bar(iw + 2 * t, t, 0, (ih + t) / 2);
    bar(iw + 2 * t, t, 0, -(ih + t) / 2);
    bar(t, ih, -(iw + t) / 2, 0);
    bar(t, ih, (iw + t) / 2, 0);
    iw += 2 * t; ih += 2 * t;
  });
  return g;
}

/* ============================================================
   ESCENA
   ============================================================ */
function uBuildUniverse(ctx) {
  const { canvas, quality, reduced, photoImg, memImgs } = ctx;
  const low = quality === "low";
  const rnd = universeSeed(2026);
  const T = UNIVERSE_CONFIG.texts;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !low, alpha: false, powerPreference: "high-performance" });
  renderer.setClearColor(0x030a15, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, low ? 1.5 : 2);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(universeColorFog(), 0.011);
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 400);
  camera.rotation.order = "YXZ";
  try { scene.environment = universeEnvironment(renderer); } catch (e) { /* sigue sin reflejos */ }

  /* ----- Luces tricolor (arrancan apagadas y se encienden en la intro) ----- */
  const lights = [];
  const addLight = (color, power, x, y, z, a, b) => {
    const l = new THREE.PointLight(color, 0, 34, 2);
    l.position.set(x, y, z); scene.add(l);
    lights.push({ l, power, a, b });
  };
  addLight(0x2f7fff, 80, -5, 2.2, -5.5, 0, 0.55);
  addLight(0xff2a38, 70, 5, -1.6, -5.5, 0.2, 0.75);
  addLight(0xffffff, 30, 0, 4.6, -3, 0.4, 1);
  addLight(0xff2a38, 46, -9, 3, 12, 0.5, 1);
  if (!low) addLight(0x2f7fff, 46, 9, -3, 12, 0.6, 1);
  const ambient = new THREE.AmbientLight(0x7ea6d8, 0);
  const hemi = new THREE.HemisphereLight(0x8ec5ff, 0x2a060c, 0);
  scene.add(ambient, hemi);

  /* ----- Materiales compartidos ----- */
  const phys = (color, emissive, metal, rough) => new THREE.MeshPhysicalMaterial({ color, emissive, metalness: metal, roughness: rough, clearcoat: 1, clearcoatRoughness: 0.15, envMapIntensity: 1.3 });
  const M = {
    blue: phys(0x0a58a8, 0x003b70, 0.3, 0.28),
    red: phys(UNIVERSE_PALETTE.red, 0x5a0a10, 0.35, 0.3),
    redSoft: phys(0xf04a56, 0x2a0408, 0.35, 0.3),
    white: phys(0xffffff, 0x1c2433, 0.15, 0.2),
    leaf: new THREE.MeshStandardMaterial({ color: 0x2d7d5a, roughness: 0.5 })
  };
  const tracked = []; // texturas propias para liberar memoria
  const interactive = [];
  const spinners = [];
  const floaters = [];
  const openers = [];   // regalos con animación de apertura

  /* ----- Fondo: estrellas, nebulosas, polvo, destellos ----- */
  const starTex = universeStarTexture();
  tracked.push(starTex);
  const makeStars = (count, size, rmin, rspan) => {
    const p = new Float32Array(count * 3), col = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const z = rnd() * 2 - 1, a = rnd() * Math.PI * 2, s = Math.sqrt(1 - z * z), r = rmin + rnd() * rspan;
      p.set([r * s * Math.cos(a), r * z, r * s * Math.sin(a)], i * 3);
      const k = rnd();
      col.set(k < 0.65 ? [0.85, 0.92, 1] : k < 0.82 ? [1, 0.62, 0.66] : [0.55, 0.75, 1], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const m = new THREE.PointsMaterial({ size, map: starTex, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = false;
    scene.add(pts);
    return pts;
  };
  const starsFar = makeStars(low ? 700 : 1300, 0.9, 80, 60);
  const starsNear = makeStars(low ? 70 : 150, 1.7, 45, 35);

  const nebulae = [];
  [[[0, "rgba(47,127,255,.9)"], [0.5, "rgba(0,59,112,.35)"], [1, "rgba(0,0,0,0)"]], [[0, "rgba(255,50,64,.8)"], [0.5, "rgba(120,10,24,.3)"], [1, "rgba(0,0,0,0)"]], [[0, "rgba(255,255,255,.55)"], [0.5, "rgba(120,170,255,.2)"], [1, "rgba(0,0,0,0)"]]].forEach((stops, i) => {
    const tex = universeGlowTexture(stops);
    tracked.push(tex);
    for (let n = 0; n < (low ? 2 : 3); n += 1) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      s.position.copy(uPos(rnd() * 360 - 180, rnd() * 100 - 50, 85 + rnd() * 30));
      s.scale.setScalar(70 + rnd() * 60);
      s.userData.o = i === 2 ? 0.2 : 0.34;
      nebulae.push(s); scene.add(s);
    }
  });

  const dustCount = low ? 80 : 160;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) dustPos.set(uPos(rnd() * 360, rnd() * 160 - 80, 4 + rnd() * 26).toArray(), i * 3);
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.16, map: starTex, color: 0xcfe2ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  dust.frustumCulled = false;
  scene.add(dust);

  const sparkTex = universeSparkTexture();
  tracked.push(sparkTex);
  const sparks = [];
  for (let i = 0; i < (low ? 14 : 26); i += 1) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    s.position.copy(uPos(rnd() * 360, rnd() * 120 - 60, 8 + rnd() * 16));
    s.userData = { base: 0.45 + rnd() * 0.8, ph: rnd() * 6.28, sp: 0.8 + rnd() * 1.6 };
    sparks.push(s); scene.add(s);
  }

  /* ----- Centro galáctico: espiral tricolor + corazón de partículas ----- */
  const spiral = uSpiralGalaxy(
    UNIVERSE_CONFIG.galaxy.spiralRadius,
    UNIVERSE_CONFIG.galaxy.arms,
    low ? 1100 : 2400
  );
  tracked.push(spiral.material.map);
  scene.add(spiral);

  const heartSculpture = uParticleHeart(
    UNIVERSE_CONFIG.galaxy.heartScale,
    UNIVERSE_CONFIG.galaxy.heartZ,
    low ? 1600 : 3600
  );
  tracked.push(heartSculpture.userData.material.map);
  scene.add(heartSculpture);

  const coreTex = universeGlowTexture([
    [0, "rgba(255,255,255,.9)"], [0.28, "rgba(215,25,32,.55)"], [0.6, "rgba(0,59,112,.32)"], [1, "rgba(0,0,0,0)"]
  ]);
  tracked.push(coreTex);
  const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: coreTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, opacity: 0
  }));
  coreGlow.position.set(0, UNIVERSE_CONFIG.galaxy.heartScale * 2.4, UNIVERSE_CONFIG.galaxy.heartZ - 1.5);
  coreGlow.scale.setScalar(28);
  scene.add(coreGlow);
  const coreLight = new THREE.PointLight(0xff4a56, 0, 70, 2);
  coreLight.position.set(0, 1, UNIVERSE_CONFIG.galaxy.heartZ + 3);
  scene.add(coreLight);
  lights.push({ l: coreLight, power: 95, a: 0.28, b: 0.95 });

  /* ----- Foto central con marco tricolor, halo y órbitas ----- */
  const PW = 3, PH = 3.75;
  const photoGroup = new THREE.Group();
  photoGroup.position.set(0, 0, -10);
  scene.add(photoGroup);
  const makePhoto = (w, h, tex, k) => {
    const mat = new THREE.MeshStandardMaterial({ color: 0x000000, map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1, roughness: 0.4, metalness: 0, envMapIntensity: 0, fog: false, toneMapped: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    const g = new THREE.Group();
    g.add(mesh, uTriFrame(w, h, M, k));
    return { g, mesh, mat };
  };
  const setPhotoTexture = (photo, tex) => {
    const old = photo.mat.map;
    photo.mat.map = tex; photo.mat.emissiveMap = tex; photo.mat.needsUpdate = true;
    if (old) old.dispose();
  };
  const focal = uParseFocal(UNIVERSE_CONFIG.photo.position);
  const central = makePhoto(PW, PH, uPhotoTexture(photoImg, "assets/foto-central.jpg", focal, low ? 900 : 1280), 1);
  central.mesh.userData.tap = {
    focus: { pos: new THREE.Vector3(0, 0, -4.6), az: 0, el: 0 },
    text: "Mi foto favorita en todo el universo ❤️",
    surprise: {
      kicker: T.centerKicker, title: T.centerTitle,
      text: T.centerText,
      sign: T.centerSign, photo: UNIVERSE_CONFIG.photo.src
    }
  };
  photoGroup.add(central.g);
  interactive.push(central.mesh);

  const haloTex = universeGlowTexture([[0, "rgba(120,170,255,.75)"], [0.45, "rgba(215,25,32,.28)"], [1, "rgba(0,0,0,0)"]]);
  tracked.push(haloTex);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, opacity: 0 }));
  halo.scale.setScalar(15); halo.position.z = -1.2;
  photoGroup.add(halo);

  [[3.5, M.blue, 0.3, 0.2, 0.18], [4, M.red, -0.25, 0.3, -0.14], [4.5, M.white, 0.12, -0.3, 0.1]].forEach(([R, mat, tx, ty, sp], i) => {
    const holder = new THREE.Group();
    holder.rotation.set(tx, ty, 0);
    const ring = new THREE.Group();
    ring.add(new THREE.Mesh(new THREE.TorusGeometry(R, 0.028, 8, 120), mat));
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), M[i === 1 ? "white" : "red"]);
    bead.position.set(R, 0, 0);
    ring.add(bead);
    holder.add(ring); photoGroup.add(holder);
    spinners.push({ o: ring, ax: "z", s: sp * 3 });
  });

  /* ----- Recuerdos repartidos por el espacio ----- */
  const memories = UNIVERSE_CONFIG.memories.map((m, i) => {
    const photo = makePhoto(PW, PH, uPhotoTexture(memImgs[i], m.src, { x: 0.5, y: 0.5 }, low ? 640 : 900), 0.8);
    const pos = uPos(m.az, m.el, m.r);
    photo.g.position.copy(pos);
    photo.g.scale.setScalar(0.62);
    photo.g.lookAt(0, 0, 0);
    photo.mesh.userData.tap = {
      focus: { pos: pos.clone().multiplyScalar((m.r - 3.4) / m.r), az: m.az, el: m.el },
      text: m.text,
      surprise: {
        kicker: T.memoryKicker, title: m.title || `Recuerdo ${String(i + 1).padStart(2, "0")}`,
        text: m.text || "Un recuerdo nuestro. Y vienen muchos más 💙", sign: m.sign || "Siempre con vos.", photo: m.src
      }
    };
    interactive.push(photo.mesh);
    floaters.push({ o: photo.g, y: pos.y, a: 0.1, f: 0.5 + i * 0.07, p: i });
    scene.add(photo.g);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, opacity: 0.16 }));
    glow.scale.setScalar(5.5); glow.position.z = -0.6; photo.g.add(glow);
    return photo;
  });

  /* ----- Corazones 3D, rosas y órbitas (decoración suave, sin texto) ----- */
  const heartGeo = universeHeartGeometry();
  const heartMats = [M.red, M.blue, M.white, M.redSoft];
  const forward = new THREE.Vector3(0, 0, -1);
  for (let i = 0; i < (low ? 6 : 10); i += 1) {
    let dir;
    do { dir = uPos(rnd() * 360 - 180, rnd() * 120 - 60, 1).normalize(); } while (dir.angleTo(forward) < 0.5);
    const near = rnd() < 0.5, r = near ? 7 + rnd() * 2 : 16 + rnd() * 6;
    const h = new THREE.Mesh(heartGeo, heartMats[i % 4]);
    h.position.copy(dir.multiplyScalar(r));
    h.scale.setScalar(near ? 0.28 + rnd() * 0.22 : 0.7 + rnd() * 0.7);
    h.rotation.set(rnd() * 0.6, rnd() * 6.28, rnd() * 0.5);
    spinners.push({ o: h, ax: "y", s: 0.25 + rnd() * 0.5 });
    floaters.push({ o: h, y: h.position.y, a: 0.16, f: 0.4 + rnd() * 0.6, p: rnd() * 6 });
    scene.add(h);
  }
  const roseMats = { red: M.red, redSoft: M.redSoft, white: M.white, blue: M.blue, leaf: M.leaf };
  for (let i = 0; i < (low ? 3 : 4); i += 1) {
    let dir;
    do { dir = uPos(rnd() * 360 - 180, rnd() * 90 - 45, 1).normalize(); } while (dir.angleTo(forward) < 0.5);
    const rose = universeRose(roseMats, rnd);
    rose.position.copy(dir.multiplyScalar(8 + rnd() * 5));
    rose.scale.setScalar(0.75 + rnd() * 0.45);
    rose.lookAt(0, 0, 0);
    rose.userData.tap = { text: T.roseTap };
    interactive.push(rose);
    scene.add(rose);
  }
  [[24, M.white, 0.32, 0.1, 0.02], [31, M.blue, -0.5, 0.4, -0.015]].forEach(([R, mat, rx, rz, sp]) => {
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(R, 0.035, 8, 160), mat);
    orbit.rotation.set(Math.PI / 2 + rx, 0, rz);
    scene.add(orbit);
    spinners.push({ o: orbit, ax: "z", s: sp });
  });

  /* ----- Efectos de toque: partículas y corazones que suben ----- */
  const BN = 180;
  const bPos = new Float32Array(BN * 3), bCol = new Float32Array(BN * 3), bBase = new Float32Array(BN * 3), bVel = new Float32Array(BN * 3), bLife = new Float32Array(BN);
  const bGeo = new THREE.BufferGeometry();
  bGeo.setAttribute("position", new THREE.BufferAttribute(bPos, 3));
  bGeo.setAttribute("color", new THREE.BufferAttribute(bCol, 3));
  const bursts = new THREE.Points(bGeo, new THREE.PointsMaterial({ size: 0.5, map: sparkTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  bursts.frustumCulled = false;
  scene.add(bursts);
  let bHead = 0, bAlive = 0;
  const burst = (p) => {
    const palette = [[0.2, 0.5, 1], [1, 0.16, 0.2], [1, 1, 1]];
    for (let k = 0; k < 45; k += 1) {
      const i = bHead; bHead = (bHead + 1) % BN;
      const d = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(2 + Math.random() * 4);
      bPos.set([p.x, p.y, p.z], i * 3); bVel.set(d.toArray(), i * 3);
      bBase.set(palette[k % 3], i * 3); bLife[i] = 1;
    }
    bAlive = 1;
  };

  const heartTexes = ["#2f7fff", "#ff2a38", "#ffffff"].map((color) => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d");
    x.shadowColor = color; x.shadowBlur = 16; x.fillStyle = color;
    uHeartPath(x, 64, 62, 42); x.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; tracked.push(t);
    return t;
  });
  const risers = [];
  for (let i = 0; i < 18; i += 1) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartTexes[i % 3], transparent: true, depthWrite: false, fog: false, opacity: 0 }));
    s.userData = { life: 0, vel: new THREE.Vector3() };
    risers.push(s); scene.add(s);
  }
  let rHead = 0;
  const riseHearts = (p) => {
    for (let k = 0; k < 6; k += 1) {
      const s = risers[rHead]; rHead = (rHead + 1) % risers.length;
      s.position.set(p.x + (Math.random() - 0.5), p.y + (Math.random() - 0.5), p.z + (Math.random() - 0.5));
      s.userData.vel.set((Math.random() - 0.5) * 0.8, 1 + Math.random() * 1.2, (Math.random() - 0.5) * 0.8);
      s.userData.life = 1; s.scale.setScalar(0.5 + Math.random() * 0.5);
    }
  };

  /* ----- Regalos chicos (los que cargaste en UNIVERSE_CONFIG.gifts) ----- */
  const gifts = UNIVERSE_CONFIG.gifts.map((data, i) => {
    const gift = uGiftMesh(data.type, M, heartGeo, heartTexes);
    const pos = uPos(data.az, data.el, data.r);
    gift.position.copy(pos);
    gift.scale.setScalar(data.size * (low ? 0.88 : 1));
    gift.rotation.set((rnd() - 0.5) * 0.35, rnd() * 6.28, (rnd() - 0.5) * 0.28);
    gift.userData.baseY = pos.y;
    gift.userData.lidY = gift.userData.lid ? gift.userData.lid.position.y : 0;
    gift.userData.opened = 0;
    gift.userData.tap = {
      gift,
      surprise: {
        kicker: T.giftKicker,
        title: data.title,
        text: data.text,
        sign: data.sign,
        photo: data.photo || null
      }
    };
    interactive.push(gift);
    openers.push(gift);
    floaters.push({ o: gift, y: pos.y, a: 0.16 + rnd() * 0.12, f: 0.35 + rnd() * 0.45, p: i * 0.9 });
    spinners.push({ o: gift, ax: "y", s: (i % 2 ? -1 : 1) * (0.08 + rnd() * 0.12) });
    scene.add(gift);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, opacity: 0.45
    }));
    glow.scale.setScalar(3.2 * data.size);
    gift.add(glow);
    return gift;
  });

  const openGift = (gift) => {
    if (gift && gift.userData && gift.userData.opened < 0.05) gift.userData.opened = 0.001;
  };

  /* Mensaje adicional: aparece en el espacio, cerca del punto tocado. */
  const reveals = [];
  const revealText = (p, text, origin, visW) => {
    const v = p.clone().sub(origin);
    const d = Math.max(3.8, Math.min(v.length() * 0.6, 8));
    const m = uTextPlane(text, Math.min(4.8, visW(d) * 0.8), 1);
    m.position.copy(origin).add(v.normalize().multiplyScalar(d)).add(new THREE.Vector3(0, d * 0.1, 0));
    m.lookAt(origin);
    m.userData.born = performance.now();
    m.material.opacity = 0;
    scene.add(m); reveals.push(m);
    while (reveals.length > 3) uDisposeObject(scene, reveals.shift());
  };

  return {
    renderer, scene, camera, lights, ambient, hemi, starsFar, starsNear, nebulae, dust, sparks, halo,
    spiral, heartSculpture, coreGlow, gifts, openers, openGift,
    spinners, floaters, interactive, tracked, central, memories, setPhotoTexture, burst, riseHearts, revealText, reveals,
    risers, bursts: { bPos, bCol, bBase, bVel, bLife, bGeo, alive: () => bAlive, set: (v) => { bAlive = v; } },
    setPixelRatio: (v) => { pixelRatio = v; }, getPixelRatio: () => pixelRatio, reduced
  };
}

function universeColorFog() { return 0x050f20; }

function uDisposeObject(scene, obj) {
  scene.remove(obj);
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    mats.forEach((m) => { ["map", "emissiveMap"].forEach((k) => m[k] && m[k].dispose()); m.dispose(); });
  });
}

/* ============================================================
   CONTROL, BUCLE Y ARRANQUE
   ============================================================ */
let universeStarted = false;

window.startUniverse = async function startUniverse() {
  if (universeStarted) return;
  universeStarted = true;

  if (location.protocol === "file:" && !window.__PHOTO_DATA_URLS__) {
    await new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = "assets/photos-data.js";
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });
  }

  const stage = document.getElementById("universe-stage");
  const canvas = document.getElementById("universe-canvas");
  const veil = document.getElementById("universe-veil");
  const loader = document.getElementById("universe-loader");
  const welcome = document.getElementById("universe-welcome");
  const hint = document.getElementById("universe-hint");
  const status = document.getElementById("universe-status");
  const resetBtn = document.getElementById("universe-reset");
  const gyroBtn = document.getElementById("universe-gyro");
  const fallback = document.getElementById("universe-fallback");
  const fallbackImg = document.getElementById("universe-fallback-img");
  const fallbackText = document.getElementById("universe-fallback-text");
  const reduced = prefersReducedMotion.matches;
  const T = UNIVERSE_CONFIG.texts;
  if (welcome) welcome.textContent = T.welcome;
  if (hint) hint.textContent = T.hint;

  /* ----- Sorpresas: el único HTML adicional, se abre al tocar un objeto 3D ----- */
  const surprise = document.getElementById("surprise-overlay");
  const surpriseTitle = document.getElementById("surprise-title");
  const surpriseKicker = document.getElementById("surprise-kicker");
  const surpriseBody = document.getElementById("surprise-body");
  const surpriseSign = document.getElementById("surprise-sign");
  const surprisePhoto = document.getElementById("surprise-photo");
  const surpriseImg = document.getElementById("surprise-img");
  const surpriseClose = document.getElementById("surprise-close");
  let lastSurpriseFocus = null;

  const closeSurprise = () => {
    if (!surprise || surprise.hidden) return;
    surprise.classList.remove("is-visible");
    window.setTimeout(() => {
      surprise.hidden = true;
      if (lastSurpriseFocus && lastSurpriseFocus.focus) lastSurpriseFocus.focus({ preventScroll: true });
    }, 320);
  };
  const openSurprise = (info) => {
    if (!surprise || !info) return;
    lastSurpriseFocus = document.activeElement;
    surpriseKicker.textContent = info.kicker || "UN MENSAJE PARA VOS";
    surpriseTitle.textContent = info.title || "Para vos 💙";
    surpriseBody.replaceChildren();
    const paragraphs = Array.isArray(info.text) ? info.text : [info.text || "Gracias por existir ❤️"];
    paragraphs.forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      surpriseBody.appendChild(p);
    });
    surpriseSign.textContent = info.sign || "";
    if (info.photo) {
      surpriseImg.src = info.photo;
      surpriseImg.alt = info.title || "Recuerdo nuestro";
      surprisePhoto.hidden = false;
    } else {
      surpriseImg.removeAttribute("src");
      surprisePhoto.hidden = true;
    }
    surprise.hidden = false;
    window.requestAnimationFrame(() => surprise.classList.add("is-visible"));
    if (surpriseClose) window.setTimeout(() => surpriseClose.focus({ preventScroll: true }), 60);
    hideHint();
  };
  if (surpriseClose) surpriseClose.addEventListener("click", (e) => { e.stopPropagation(); closeSurprise(); });
  if (surprise) surprise.addEventListener("pointerdown", (e) => e.stopPropagation());
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSurprise(); });

  const showFallback = (img) => {
    if (loader) loader.classList.add("is-hidden");
    if (canvas) canvas.hidden = true;
    fallback.hidden = false;
    if (img) { fallbackImg.src = UNIVERSE_CONFIG.photo.src; fallbackImg.hidden = false; }
    fallbackText.textContent = T.welcome;
    veil.classList.add("is-clear");
  };

  if (!universeSupportsWebGL() || typeof THREE === "undefined") { showFallback(false); return; }

  /* Fuentes y foto central antes de revelar el escenario (con tiempo máximo). */
  const memImgs = UNIVERSE_CONFIG.memories.map(() => null);
  const memLoads = UNIVERSE_CONFIG.memories.map((m, i) => uLoadImage(m.src).then((img) => { memImgs[i] = img; return img; }));
  const photoLoad = uLoadImage(UNIVERSE_CONFIG.photo.src);
  const fontLoad = document.fonts && document.fonts.load ? document.fonts.load('italic 600 80px "Cormorant Garamond"').catch(() => null) : Promise.resolve();
  const [photoImg] = await Promise.race([Promise.all([photoLoad, fontLoad]), uWait(3500).then(() => [null])]);

  let U;
  try {
    U = uBuildUniverse({ stage, canvas, quality: universeQuality(), reduced, photoImg, memImgs });
  } catch (error) {
    console.error("Universo 3D no disponible:", error);
    showFallback(true);
    return;
  }
  const { renderer, scene, camera } = U;

  /* Los recuerdos se incorporan cuando terminan de cargar. */
  memLoads.forEach((p, i) => p.then((img) => { if (img) U.setPhotoTexture(U.memories[i], uPhotoTexture(img, "", { x: 0.5, y: 0.5 }, 900)); }));
  if (!photoImg) console.info("Falta assets/foto-central.jpg: se muestra un espacio provisional.");

  /* ----- Estado de cámara ----- */
  const S = { az: 0, el: 0, vAz: 0, vEl: 0, zoom: 1, fovBase: 78, focus: null, dragging: false, intro: reduced ? 1 : 0, started: false };
  const camPos = new THREE.Vector3();
  const camBase = new THREE.Vector3();
  const gyro = { on: false, has: false, off: 0, q: new THREE.Quaternion(), qd: new THREE.Quaternion(), qo: new THREE.Quaternion() };
  const euler = new THREE.Euler(), q1 = new THREE.Quaternion(-Math.SQRT1_2, 0, 0, Math.SQRT1_2), q0 = new THREE.Quaternion(), zee = new THREE.Vector3(0, 0, 1);
  const clampEl = (v) => Math.max(-1.45, Math.min(1.45, v));
  const fovNow = () => Math.max(30, Math.min(100, S.fovBase * S.zoom * (0.62 + 0.38 * uEase(S.intro))));
  const announce = (t) => { status.textContent = t; };

  const resize = () => {
    const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
    renderer.setPixelRatio(U.getPixelRatio());
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    S.fovBase = w / h < 1 ? 80 : 66;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", resize);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", resize);

  const recenter = () => {
    S.focus = null; S.zoom = 1; S.vAz = S.vEl = 0;
    S.homing = !gyro.on;
    if (gyro.on && gyro.has) { euler.setFromQuaternion(gyro.q, "YXZ"); gyro.off = -euler.y; }
    announce("Vista centrada");
  };
  resetBtn.addEventListener("click", (e) => { e.stopPropagation(); recenter(); });

  /* ----- Mensajes de bienvenida y pista ----- */
  let hintDone = false;
  const hideHint = () => { if (hintDone) return; hintDone = true; hint.classList.remove("is-visible"); window.setTimeout(() => { hint.hidden = true; }, 1300); };

  /* ----- Entrada con transición cinematográfica ----- */
  loader.classList.add("is-hidden");
  window.requestAnimationFrame(() => veil.classList.add("is-clear"));
  S.started = true;
  S.t0 = performance.now();
  welcome.hidden = false;
  window.setTimeout(() => welcome.classList.add("is-visible"), 900);
  window.setTimeout(() => welcome.classList.remove("is-visible"), 4900);
  window.setTimeout(() => { welcome.hidden = true; hint.hidden = false; window.requestAnimationFrame(() => hint.classList.add("is-visible")); }, 6200);
  window.setTimeout(hideHint, 12500);

  /* ----- Entrada táctil / mouse ----- */
  const ptrs = new Map();
  let drag = null, pinch = 0;
  const radPerPx = () => (fovNow() * Math.PI) / 180 / Math.max(1, stage.clientHeight);

  stage.addEventListener("pointerdown", (e) => {
    if (surprise && !surprise.hidden) return;
    if (e.target.closest && e.target.closest(".universe-tools")) return;
    try { stage.setPointerCapture(e.pointerId); } catch (error) { /* punteros sintéticos u otros navegadores */ }
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) drag = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, lx: e.clientX, ly: e.clientY, lt: performance.now() };
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); drag = null; }
    S.dragging = true; S.vAz = S.vEl = 0;
    stage.classList.add("is-dragging");
  });

  stage.addEventListener("pointermove", (e) => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch > 0 && d > 0) S.zoom = Math.max(0.45, Math.min(1.25, S.zoom * (pinch / d)));
      pinch = d; hideHint();
      return;
    }
    if (!drag) return;
    const now = performance.now(), dx = e.clientX - drag.lx, dy = e.clientY - drag.ly, k = radPerPx();
    drag.moved += Math.abs(dx) + Math.abs(dy);
    if (drag.moved > 6) { S.homing = false; S.focus = S.focus ? { ...S.focus, lock: false } : null; hideHint(); }
    S.az -= dx * k; S.el = clampEl(S.el + dy * k);
    if (gyro.on) gyro.off += dx * k;
    const dt = Math.max(8, now - drag.lt) / 1000;
    S.vAz = S.vAz * 0.6 + ((-dx * k) / dt) * 0.4;
    S.vEl = S.vEl * 0.6 + ((dy * k) / dt) * 0.4;
    drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = now;
  });

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const onTap = (cx, cy) => {
    const r = stage.getBoundingClientRect();
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(U.interactive, true);
    let o = hits.length ? hits[0].object : null;
    while (o && !(o.userData && o.userData.tap)) o = o.parent;
    if (!o) { if (S.focus) recenter(); return; }
    const info = o.userData.tap, p = hits[0].point.clone();
    U.burst(p); U.riseHearts(p);
    if (info.focus) {
      const same = S.focus && S.focus.pos === info.focus.pos;
      if (same) { recenter(); return; }
      S.focus = { pos: info.focus.pos, az: info.focus.az, el: info.focus.el, lock: true };
      S.zoom = 0.8;
    }
    if (info.surprise) {
      U.openGift(info.gift);
      openSurprise(info.surprise);
      announce(info.surprise.title || info.text || "Una sorpresa para vos");
      return;
    }
    const text = info.text || T.roseTap;
    const origin = S.focus ? S.focus.pos : camera.position;
    U.revealText(p, text, origin, (d) => 2 * d * Math.tan(uRad(fovNow()) / 2) * camera.aspect);
    announce(text);
  };

  const endPointer = (e) => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.delete(e.pointerId);
    if (ptrs.size === 0) {
      S.dragging = false; stage.classList.remove("is-dragging");
      if (drag && drag.moved < 8 && performance.now() - drag.t < 450) { S.vAz = S.vEl = 0; onTap(e.clientX, e.clientY); }
      drag = null; pinch = 0;
    } else if (ptrs.size === 1) { const [a] = [...ptrs.values()]; drag = { x: a.x, y: a.y, t: 0, moved: 99, lx: a.x, ly: a.y, lt: performance.now() }; pinch = 0; }
  };
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);
  stage.addEventListener("wheel", (e) => { e.preventDefault(); S.zoom = Math.max(0.45, Math.min(1.25, S.zoom * (1 + e.deltaY * 0.0012))); hideHint(); }, { passive: false });
  stage.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("gesturestart", (e) => e.preventDefault());
  stage.addEventListener("keydown", (e) => {
    const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (!k) return;
    e.preventDefault(); S.az += k[0] * 0.12; S.el = clampEl(S.el + k[1] * 0.1); hideHint();
  });

  /* ----- Giroscopio (opcional, siempre queda el control manual) ----- */
  const onOrient = (e) => {
    if (e.alpha == null) return;
    const o = uRad((screen.orientation && screen.orientation.angle) || window.orientation || 0);
    euler.set(uRad(e.beta), uRad(e.alpha), -uRad(e.gamma), "YXZ");
    gyro.qd.setFromEuler(euler).multiply(q1).multiply(q0.setFromAxisAngle(zee, -o));
    if (!gyro.has) {
      gyro.has = true; gyro.q.copy(gyro.qd);
      euler.setFromQuaternion(gyro.qd, "YXZ");
      gyro.off = -S.az - euler.y;
    } else gyro.q.slerp(gyro.qd, 0.3);
  };
  const setGyro = async (on) => {
    if (on) {
      try {
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
          if ((await DeviceOrientationEvent.requestPermission()) !== "granted") { announce("Permiso de movimiento denegado. Seguí deslizando."); return; }
        }
      } catch (err) { announce("No se pudo activar el movimiento."); return; }
      gyro.on = true; gyro.has = false;
      window.addEventListener("deviceorientation", onOrient);
    } else {
      window.removeEventListener("deviceorientation", onOrient);
      const d = camera.getWorldDirection(new THREE.Vector3());
      S.az = Math.atan2(d.x, -d.z); S.el = clampEl(Math.asin(d.y));
      gyro.on = false;
    }
    gyroBtn.setAttribute("aria-pressed", String(gyro.on));
    announce(gyro.on ? "Movimiento del teléfono activado" : "Control manual");
  };
  if ("DeviceOrientationEvent" in window && window.matchMedia("(pointer: coarse)").matches) {
    gyroBtn.hidden = false;
    gyroBtn.addEventListener("click", (e) => { e.stopPropagation(); setGyro(!gyro.on); });
  }

  /* ----- Bucle de render ----- */
  let raf = 0, last = performance.now(), slowFrames = 0, frames = 0, adapted = false;
  const base = U.lights.map((l) => l.power);
  const tmp = new THREE.Vector3();

  const frame = (now) => {
    raf = window.requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;

    if (!adapted && ++frames > 40) {
      slowFrames += dt > 0.034 ? 1 : 0;
      if (frames === 160) { adapted = true; if (slowFrames > 55 && U.getPixelRatio() > 1) { U.setPixelRatio(1); resize(); } }
    }

    if (!S.dragging) {
      if (S.homing || (S.focus && S.focus.lock)) {
        const k = 1 - Math.exp(-dt * 4);
        const tAz = S.homing ? 0 : (S.focus.az * Math.PI) / 180, tEl = S.homing ? 0 : (S.focus.el * Math.PI) / 180;
        let d = tAz - S.az;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        S.az += d * k; S.el += (tEl - S.el) * k;
        if (S.homing && Math.abs(d) < 0.003 && Math.abs(S.el) < 0.003) S.homing = false;
      } else {
        S.az += S.vAz * dt; S.el = clampEl(S.el + S.vEl * dt);
        const damp = Math.exp(-dt * 3.2);
        S.vAz *= damp; S.vEl *= damp;
      }
    }
    if (S.started && S.intro < 1) S.intro = Math.min(1, S.intro + dt / 3.4);
    const p = S.intro;

    camPos.copy(S.focus ? S.focus.pos : tmp.set(0, 0, 0));
    camBase.lerp(camPos, 1 - Math.exp(-dt * 3));
    // Vuelo cinematográfico: la cámara arranca lejos y desciende hacia el corazón.
    const flight = 1 - uEase(Math.min(1, p / 0.92));
    camera.position.copy(camBase);
    camera.position.z += flight * 7;
    camera.position.y += flight * 1.4;
    camera.fov = fovNow();
    camera.updateProjectionMatrix();
    if (gyro.on && gyro.has) {
      gyro.qo.setFromAxisAngle(new THREE.Vector3(0, 1, 0), gyro.off);
      camera.quaternion.copy(gyro.qo).multiply(gyro.q);
    } else camera.rotation.set(S.el, -S.az, 0, "YXZ");
    if (flight > 0.001) { camera.rotateY(flight * 0.32); camera.rotateX(flight * 0.1); }

    /* Luces tricolor que se encienden progresivamente */
    U.lights.forEach((l, i) => { l.l.intensity = base[i] * uStep(p, l.a, l.b); });
    U.ambient.intensity = 0.55 * uStep(p, 0, 0.5);
    U.hemi.intensity = 0.6 * uStep(p, 0, 0.5);
    const fadeBg = uStep(p, 0.1, 0.8);
    U.starsFar.material.opacity = fadeBg; U.starsNear.material.opacity = fadeBg; U.dust.material.opacity = 0.6 * fadeBg;
    U.nebulae.forEach((n) => { n.material.opacity = n.userData.o * fadeBg; });
    U.halo.material.opacity = 0.25 * uStep(p, 0.2, 0.9);
    U.sparks.forEach((s) => { const d = s.userData; s.material.opacity = fadeBg * (0.25 + 0.75 * Math.abs(Math.sin(t * d.sp + d.ph))); s.scale.setScalar(d.base * (0.7 + 0.3 * Math.sin(t * d.sp * 1.3 + d.ph))); });

    /* El corazón central se enciende y late; la espiral gira lentamente. */
    const beat = 1 + 0.035 * Math.sin(t * 2.4) + 0.018 * Math.sin(t * 5.1);
    U.heartSculpture.userData.material.opacity = 0.95 * uStep(p, 0.18, 0.95);
    U.heartSculpture.scale.setScalar(beat);
    U.heartSculpture.rotation.y = Math.sin(t * 0.24) * 0.08;
    U.spiral.material.opacity = 0.85 * uStep(p, 0.06, 0.85);
    U.coreGlow.material.opacity = 0.8 * uStep(p, 0.25, 1) * (0.74 + 0.26 * Math.sin(t * 2.4));
    U.coreGlow.scale.setScalar(27 + 2.2 * Math.sin(t * 2.4));

    const ramp = uStep(p, 0.45, 1);
    if (!U.reduced) {
      U.spinners.forEach((s) => { s.o.rotation[s.ax] += s.s * dt; });
      U.floaters.forEach((f) => { f.o.position.y = f.y + Math.sin(t * f.f + f.p) * f.a; });
      U.dust.rotation.y += dt * 0.004;
      U.spiral.rotation.z += dt * 0.018 * ramp;
    }

    /* Apertura suave de las cajitas. */
    U.openers.forEach((g) => {
      const raw = g.userData.opened;
      if (raw > 0 && raw < 1) g.userData.opened = Math.min(1, raw + dt * 1.6);
      const q = uEase(g.userData.opened);
      if (q <= 0) return;
      if (g.userData.lid) {
        g.userData.lid.rotation.x = -q * 2.25;
        g.userData.lid.position.y = g.userData.lidY + q * 0.22;
      }
      if (g.userData.reveal) g.userData.reveal.scale.setScalar(0.01 + q * 0.95);
    });

    /* Partículas y corazones del toque */
    const B = U.bursts;
    if (B.alive()) {
      let any = 0;
      const damp = Math.pow(0.97, dt * 60);
      for (let i = 0; i < B.bLife.length; i += 1) {
        const life = B.bLife[i];
        if (life > 0) {
          any = 1;
          B.bPos[i * 3] += B.bVel[i * 3] * dt; B.bPos[i * 3 + 1] += B.bVel[i * 3 + 1] * dt; B.bPos[i * 3 + 2] += B.bVel[i * 3 + 2] * dt;
          B.bVel[i * 3] *= damp; B.bVel[i * 3 + 1] *= damp; B.bVel[i * 3 + 2] *= damp;
          B.bLife[i] = life - dt / 1.4;
          const f = Math.max(0, B.bLife[i]);
          B.bCol[i * 3] = B.bBase[i * 3] * f; B.bCol[i * 3 + 1] = B.bBase[i * 3 + 1] * f; B.bCol[i * 3 + 2] = B.bBase[i * 3 + 2] * f;
        }
      }
      B.bGeo.attributes.position.needsUpdate = true; B.bGeo.attributes.color.needsUpdate = true;
      if (!any) B.set(0);
    }
    U.risers.forEach((s) => {
      const d = s.userData;
      if (d.life <= 0) return;
      d.life -= dt / 2.2;
      s.position.addScaledVector(d.vel, dt);
      s.material.opacity = Math.max(0, Math.min(1, d.life * 1.6));
    });
    for (let i = U.reveals.length - 1; i >= 0; i -= 1) {
      const m = U.reveals[i], age = (performance.now() - m.userData.born) / 1000;
      m.material.opacity = Math.min(1, age / 0.5, Math.max(0, (6 - age) / 1));
      if (age > 6) { uDisposeObject(scene, m); U.reveals.splice(i, 1); }
    }

    renderer.render(scene, camera);
  };

  const run = () => { if (!raf) { last = performance.now(); raf = window.requestAnimationFrame(frame); } };
  const pause = () => { window.cancelAnimationFrame(raf); raf = 0; };
  document.addEventListener("visibilitychange", () => (document.hidden ? pause() : run()));
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); pause(); showFallback(true); });
  run();

  /* ----- Liberación de memoria ----- */
  window.addEventListener("pagehide", () => {
    pause();
    window.removeEventListener("resize", resize);
    window.removeEventListener("orientationchange", resize);
    if (window.visualViewport) window.visualViewport.removeEventListener("resize", resize);
    window.removeEventListener("deviceorientation", onOrient);
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      mats.forEach((m) => { ["map", "emissiveMap"].forEach((k) => m[k] && m[k].dispose()); m.dispose(); });
    });
    U.tracked.forEach((tex) => tex.dispose());
    if (scene.environment) scene.environment.dispose();
    renderer.dispose();
  }, { once: true });
};

function universeQuality() {
  const memory = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  return window.innerWidth < 820 || memory <= 4 || cores <= 4 ? "low" : "high";
}
