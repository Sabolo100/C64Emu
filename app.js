let screenEl = document.getElementById("screen");
let screenTextEl = document.getElementById("screenText");
let canvas = document.getElementById("gfx");
let viewToggleEl = document.getElementById("viewToggle");
let aiGenerateEl = document.getElementById("aiGenerateButton");
let ctx = null;

const C64_COLUMNS = 40;
const C64_MIN_ROWS = 25;
const DEFAULT_ARRAY_BOUND = 10;
const DEFAULT_DEVICE = 8;
const STORAGE_PREFIX = "c64.basic.program.";
const STORAGE_LAST = "c64.basic.last";
const STORAGE_SESSION = "c64.basic.session.v1";
const SESSION_VERSION = 1;
const TESTPACK_INDEX_NAME = "TP00-INDEX";

const TEST_PACK_PROGRAMS = [
  {
    name: "TP01-BASIC",
    description: "Alap PRINT/FOR/IF",
    lines: [
      [10, 'PRINT "TP01 BASIC OK"'],
      [20, "FOR I=1 TO 5"],
      [30, 'PRINT "SOR ";I'],
      [40, "NEXT I"],
      [50, "A=7"],
      [60, 'IF A>5 THEN PRINT "IF/THEN OK" ELSE PRINT "HIBA"'],
      [70, "END"],
    ],
  },
  {
    name: "TP02-DATA-FN",
    description: "DATA/READ/RESTORE + DEF FN",
    lines: [
      [10, "REM DATA/READ/RESTORE + DEF FN"],
      [20, "DATA 3,5,8"],
      [30, "READ A,B,C"],
      [40, "DEF FNS(X)=X*X"],
      [50, "PRINT A;B;C"],
      [60, 'PRINT "FNS(4)=";FNS(4)'],
      [70, "RESTORE"],
      [80, "READ X"],
      [90, 'PRINT "RESTORE OK:";X'],
      [100, "END"],
    ],
  },
  {
    name: "TP03-FLOW",
    description: "GOSUB/RETURN + ON GOTO",
    lines: [
      [10, 'PRINT "TP03 START"'],
      [20, "GOSUB 100"],
      [30, "ON 2 GOTO 200,300,400"],
      [40, "END"],
      [100, 'PRINT "GOSUB/RETURN OK"'],
      [110, "RETURN"],
      [200, 'PRINT "ON GOTO 1"'],
      [210, "GOTO 500"],
      [300, 'PRINT "ON GOTO 2"'],
      [310, "GOTO 500"],
      [400, 'PRINT "ON GOTO 3"'],
      [410, "GOTO 500"],
      [500, 'PRINT "VEGE"'],
      [510, "END"],
    ],
  },
  {
    name: "TP04-DRAW",
    description: "GRAPHIC + DRAW",
    lines: [
      [10, "GRAPHIC 1,1"],
      [20, "COLOR 0,6"],
      [30, "COLOR 1,14"],
      [40, "DRAW 1,10,10 TO 310,10 TO 310,190 TO 10,190 TO 10,10"],
      [50, "DRAW 1,10,100 TO 310,100"],
      [60, "DRAW 1,160,10 TO 160,190"],
      [70, 'PRINT "TP04 DRAW"'],
      [80, "END"],
    ],
  },
  {
    name: "TP05-BOX-PAINT",
    description: "BOX + PAINT",
    lines: [
      [10, "GRAPHIC 3,1"],
      [20, "COLOR 0,6"],
      [30, "COLOR 1,14"],
      [40, "COLOR 2,3"],
      [50, "COLOR 3,8"],
      [60, "BOX 1,40,30,280,170"],
      [70, "BOX 2,70,60,250,140,25,0"],
      [80, "BOX 3,100,80,220,120,0,1"],
      [90, "PAINT 2,160,100,0"],
      [100, 'PRINT "TP05 BOX/PAINT"'],
      [110, "END"],
    ],
  },
  {
    name: "TP06-CIRCLE",
    description: "CIRCLE/ellipse/arc",
    lines: [
      [10, "GRAPHIC 1,1"],
      [20, "COLOR 1,14"],
      [30, "CIRCLE 1,160,100,80"],
      [40, "CIRCLE 2,160,100,55,30"],
      [50, "CIRCLE 3,160,100,90,70,30,300,25,2"],
      [60, 'PRINT "TP06 CIRCLE/ARC"'],
      [70, "END"],
    ],
  },
  {
    name: "TP07-SPLIT",
    description: "GRAPHIC split mode",
    lines: [
      [10, "GRAPHIC 2,1,18"],
      [20, "COLOR 1,14"],
      [30, "DRAW 1,0,0 TO 319,0 TO 319,143 TO 0,143 TO 0,0"],
      [40, "FOR X=0 TO 319 STEP 16"],
      [50, "DRAW 1,X,0 TO X,143"],
      [60, "NEXT X"],
      [70, 'PRINT "TP07 GRAPHIC 2 SPLIT"'],
      [80, 'PRINT "ALUL TEXT, FELUL BITMAP"'],
      [90, "END"],
    ],
  },
  {
    name: "TP08-PAINT-MODE",
    description: "PAINT mode 0/1",
    lines: [
      [10, "GRAPHIC 1,1"],
      [20, "COLOR 0,6"],
      [30, "COLOR 1,14"],
      [40, "BOX 1,30,30,290,170"],
      [50, "BOX 1,80,60,240,140"],
      [60, "PAINT 2,50,50,1"],
      [70, "PAINT 3,160,100,0"],
      [80, 'PRINT "TP08 PAINT MODE 0/1"'],
      [90, "END"],
    ],
  },
  {
    name: "TP09-CHANNEL",
    description: "OPEN/CLOSE + PRINT#/INPUT#",
    lines: [
      [10, 'OPEN 1,8,0,"MEM"'],
      [20, 'PRINT#1,"HELLO,123"'],
      [30, 'PRINT#1,"MASODIK,456"'],
      [40, "INPUT#1,A$,B"],
      [50, "PRINT A$;B"],
      [60, "INPUT#1,C$,D"],
      [70, "PRINT C$;D"],
      [80, "CLOSE 1"],
      [90, "END"],
    ],
  },
  {
    name: "TP10-STOP-CONT",
    description: "STOP / CONT demo",
    lines: [
      [10, "FOR I=1 TO 3"],
      [20, 'PRINT "RUN ";I'],
      [30, "NEXT I"],
      [40, "STOP"],
      [50, 'PRINT "CONT OK"'],
      [60, "END"],
    ],
  },
];

const C64_COLORS = [
  "#000000",
  "#ffffff",
  "#813338",
  "#75cec8",
  "#8e3c97",
  "#56ac4d",
  "#2e2c9b",
  "#edf171",
  "#8e5029",
  "#553800",
  "#c46c71",
  "#4a4a4a",
  "#7b7b7b",
  "#a9ff9f",
  "#a6b3ff",
  "#b2b2b2",
];

function createDefaultGraphicsState() {
  return {
    mode: 0,
    splitRow: 20,
    colorSources: [6, 14, 3, 1, 14, 14, 6],
    cursorX: 0,
    cursorY: 0,
  };
}

class BasicError extends Error {
  constructor(message) {
    super(message);
    this.name = "BasicError";
  }
}

class ProgramPause extends Error {
  constructor(lineNumber, continuationPc) {
    super("BREAK");
    this.name = "ProgramPause";
    this.lineNumber = lineNumber;
    this.continuationPc = continuationPc;
  }
}

const terminal = {
  text: "",
  input: "",
  cursorPos: 0,
  cursorVisible: true,
  focused: false,
  blinkTimer: null,
  viewOffset: 0,
  maxChars: 160000,
  lastVisibleLines: [],
  programEditLineNumber: null,
  programEditLineIndex: -1,
};

const machine = {
  program: new Map(),
  programVersion: 0,
  running: false,
  stopRequested: false,
  waitInput: null,
  textColor: 14,
  programmingMode: false,
  continuation: null,
  memory: new Uint8Array(65536),
  channels: new Map(),
  cmdChannel: null,
  status: 0,
  keyQueue: [],
  bootMs: Date.now(),
  tiRefMs: Date.now(),
  tiRefJiffies: 0,
  lastRnd: Math.random(),
  rndSeed: null,
  cpu: { pc: 0, a: 0, x: 0, y: 0 },
  expandedView: false,
  gfx: createDefaultGraphicsState(),
};

let sessionPersistTimer = null;
let suspendSessionPersist = false;

const aiState = {
  enabled: false,
  busy: false,
  checked: false,
  model: "",
  source: "",
};

function createNoopContext() {
  return {
    fillStyle: "#000000",
    strokeStyle: "#ffffff",
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    fillRect() {},
    strokeRect() {},
    rect() {},
    clip() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    closePath() {},
    getImageData() {
      return { data: [] };
    },
    putImageData() {},
    arc() {},
    fill() {},
  };
}

function ensureDomReady() {
  if (!screenEl) {
    screenEl = document.getElementById("screen") || document.querySelector(".c64-screen") || document.body;
  }

  if (!canvas) {
    canvas = document.getElementById("gfx");
  }
  if (!canvas && screenEl && screenEl.appendChild) {
    canvas = document.createElement("canvas");
    canvas.id = "gfx";
    canvas.width = 320;
    canvas.height = 200;
    canvas.setAttribute("aria-hidden", "true");
    screenEl.appendChild(canvas);
  }

  if (!screenTextEl) {
    screenTextEl = document.getElementById("screenText");
  }
  if (!screenTextEl && screenEl && screenEl.appendChild) {
    screenTextEl = document.createElement("pre");
    screenTextEl.id = "screenText";
    screenTextEl.className = "screen-text";
    screenEl.appendChild(screenTextEl);
  }

  if (!viewToggleEl) {
    viewToggleEl = document.getElementById("viewToggle");
  }
  if (!aiGenerateEl) {
    aiGenerateEl = document.getElementById("aiGenerateButton");
  }

  if (screenEl && screenEl.setAttribute && !screenEl.hasAttribute("tabindex")) {
    screenEl.setAttribute("tabindex", "0");
  }

  if (screenTextEl && !screenTextEl.style.whiteSpace) {
    screenTextEl.style.whiteSpace = "pre";
  }

  if (canvas && canvas.getContext) {
    ctx = canvas.getContext("2d");
  }
  if (!ctx) {
    ctx = createNoopContext();
  }
}

function boot() {
  resizeCanvas();
  const restored = restoreSessionState();
  if (!restored) {
    applyGraphicModePresentation();
    clearGraphics();
    printBootBanner();
  }
  focusScreen();
  startCursorBlink();
  refreshAiAvailability();
}

function printBootBanner() {
  screenWriteLine("**** COMMODORE 64 BASIC V2 ****");
  screenWriteLine("");
  screenWriteLine("64K RAM SYSTEM  38911 BASIC BYTES FREE");
  screenWriteLine("");
  screenWriteLine("READY.");
}

function startCursorBlink() {
  if (terminal.blinkTimer) {
    clearInterval(terminal.blinkTimer);
  }
  terminal.blinkTimer = setInterval(() => {
    terminal.cursorVisible = !terminal.cursorVisible;
    render();
  }, 420);
}

function resizeCanvas() {
  if (!canvas) {
    return;
  }
  canvas.width = 320;
  canvas.height = 200;
}

function focusScreen() {
  terminal.focused = true;
  terminal.cursorVisible = true;
  if (screenEl && typeof screenEl.focus === "function") {
    screenEl.focus();
  }
  render();
}

function trimTerminalText() {
  if (terminal.text.length <= terminal.maxChars) {
    return;
  }
  terminal.text = terminal.text.slice(-terminal.maxChars);
}

function appendScreenText(text) {
  terminal.text += text;
  trimTerminalText();
  if (terminal.viewOffset === 0) {
    terminal.viewOffset = 0;
  }
  scheduleSessionPersist();
}

function screenWrite(text = "") {
  appendScreenText(String(text));
  render();
}

function screenWriteLine(text = "") {
  appendScreenText(`${text}\n`);
  render();
}

function clearText() {
  terminal.text = "";
  terminal.viewOffset = 0;
  scheduleSessionPersist();
  render();
}

function clampColor(index) {
  const n = Math.trunc(Number(index) || 0);
  return ((n % C64_COLORS.length) + C64_COLORS.length) % C64_COLORS.length;
}

function toPaletteColorIndex(colorValue) {
  const n = Math.trunc(Number(colorValue));
  if (Number.isNaN(n)) {
    throw new BasicError("ILLEGAL QUANTITY ERROR");
  }
  if (n >= 1 && n <= 16) {
    return n - 1;
  }
  if (n >= 0 && n < C64_COLORS.length) {
    return n;
  }
  throw new BasicError("ILLEGAL QUANTITY ERROR");
}

function normalizeSplitRow(value) {
  const n = Math.trunc(Number(value));
  if (Number.isNaN(n)) {
    throw new BasicError("ILLEGAL QUANTITY ERROR");
  }
  return Math.max(0, Math.min(C64_MIN_ROWS, n));
}

function getBackgroundSourceForMode(mode = machine.gfx.mode) {
  return mode === 5 ? 6 : 0;
}

function getGraphicsClipHeightForMode(mode = machine.gfx.mode, splitRow = machine.gfx.splitRow) {
  if (mode === 2 || mode === 4) {
    const row = normalizeSplitRow(splitRow);
    return Math.max(0, Math.min(canvas.height, Math.round((row / C64_MIN_ROWS) * canvas.height)));
  }
  return canvas.height;
}

function withGraphicsClip(drawFn, mode = machine.gfx.mode, splitRow = machine.gfx.splitRow) {
  const clipHeight = getGraphicsClipHeightForMode(mode, splitRow);
  if (!ctx || typeof drawFn !== "function") {
    return;
  }

  if (!ctx.save || !ctx.restore || !ctx.clip || !ctx.rect) {
    drawFn();
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, clipHeight);
  ctx.clip();
  drawFn();
  ctx.restore();
}

function applyGraphicModePresentation() {
  if (!screenEl || !canvas) {
    return;
  }

  const mode = machine.gfx.mode;
  const source = getBackgroundSourceForMode(mode);
  const bgColor = machine.gfx.colorSources[source] ?? 6;
  const borderColor = machine.gfx.colorSources[4] ?? 14;
  const showGraphics = mode >= 1 && mode <= 4;

  screenEl.style.backgroundColor = C64_COLORS[clampColor(bgColor)];
  screenEl.style.borderColor = C64_COLORS[clampColor(borderColor)];
  canvas.style.opacity = showGraphics ? (mode === 3 || mode === 4 ? "0.72" : "0.58") : "0";
}

function clearGraphics(mode = machine.gfx.mode, splitRow = machine.gfx.splitRow) {
  const source = getBackgroundSourceForMode(mode);
  const colorIndex = machine.gfx.colorSources[source] ?? 6;
  ctx.fillStyle = C64_COLORS[clampColor(colorIndex)];
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const clipHeight = getGraphicsClipHeightForMode(mode, splitRow);
  if (clipHeight < canvas.height) {
    ctx.fillRect(0, clipHeight, canvas.width, canvas.height - clipHeight);
  }
  scheduleSessionPersist();
}

function drawPixel(x, y, color = machine.textColor) {
  withGraphicsClip(() => {
    ctx.fillStyle = C64_COLORS[clampColor(color)];
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  });
}

function drawLine(x1, y1, x2, y2, color = machine.textColor) {
  withGraphicsClip(() => {
    ctx.strokeStyle = C64_COLORS[clampColor(color)];
    ctx.beginPath();
    ctx.moveTo(x1 + 0.5, y1 + 0.5);
    ctx.lineTo(x2 + 0.5, y2 + 0.5);
    ctx.stroke();
  });
}

function drawRect(x, y, w, h, color = machine.textColor, fill = false) {
  withGraphicsClip(() => {
    ctx.strokeStyle = C64_COLORS[clampColor(color)];
    ctx.fillStyle = C64_COLORS[clampColor(color)];
    if (fill) {
      ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    } else {
      ctx.strokeRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }
  });
}

function drawRotatedRect(x1, y1, x2, y2, color = machine.textColor, angleDeg = 0, fill = false) {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const angle = Number(angleDeg) || 0;

  if (Math.abs(angle) % 360 === 0) {
    drawRect(Math.min(x1, x2), Math.min(y1, y2), width, height, color, fill);
    return;
  }

  withGraphicsClip(() => {
    ctx.strokeStyle = C64_COLORS[clampColor(color)];
    ctx.fillStyle = C64_COLORS[clampColor(color)];
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((angle * Math.PI) / 180);
    if (fill) {
      ctx.fillRect(Math.round(-width / 2), Math.round(-height / 2), Math.round(width), Math.round(height));
    } else {
      ctx.strokeRect(Math.round(-width / 2), Math.round(-height / 2), Math.round(width), Math.round(height));
    }
    ctx.restore();
  });
}

function ellipsePoint(cx, cy, xr, yr, angleDeg, rotationDeg) {
  const a = (Number(angleDeg) * Math.PI) / 180;
  const rot = (Number(rotationDeg) * Math.PI) / 180;
  const ex = xr * Math.cos(a);
  const ey = yr * Math.sin(a);
  const rx = ex * Math.cos(rot) + ey * Math.sin(rot);
  const ry = -ex * Math.sin(rot) + ey * Math.cos(rot);
  return { x: cx + rx, y: cy + ry };
}

function drawEllipseSegment(
  x,
  y,
  xr,
  yr,
  color = machine.textColor,
  startAngle = 0,
  endAngle = 360,
  rotation = 0,
  increment = 2,
  fill = false,
) {
  const radiusX = Math.max(0, Math.abs(Number(xr) || 0));
  const radiusY = Math.max(0, Math.abs(Number(yr) || 0));
  const step = Math.max(0.25, Math.abs(Number(increment) || 2));
  const start = Number(startAngle) || 0;
  const end = Number(endAngle) || 0;
  const dir = end >= start ? 1 : -1;

  withGraphicsClip(() => {
    ctx.strokeStyle = C64_COLORS[clampColor(color)];
    ctx.fillStyle = C64_COLORS[clampColor(color)];
    ctx.beginPath();

    let cursor = start;
    let hasPoint = false;
    const canContinue = () => (dir > 0 ? cursor <= end : cursor >= end);

    while (canContinue()) {
      const pt = ellipsePoint(x, y, radiusX, radiusY, cursor, rotation);
      if (!hasPoint) {
        ctx.moveTo(pt.x, pt.y);
        hasPoint = true;
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
      cursor += dir * step;
    }

    const endPoint = ellipsePoint(x, y, radiusX, radiusY, end, rotation);
    if (!hasPoint) {
      ctx.moveTo(endPoint.x, endPoint.y);
    } else {
      ctx.lineTo(endPoint.x, endPoint.y);
    }

    if (fill) {
      if (Math.abs(end - start) >= 359.5) {
        ctx.closePath();
      } else {
        ctx.lineTo(x, y);
        ctx.closePath();
      }
      ctx.fill();
    } else {
      ctx.stroke();
    }
  });
}

function drawCircle(x, y, r, color = machine.textColor, fill = false) {
  drawEllipseSegment(x, y, r, r, color, 0, 360, 0, 2, fill);
}

function colorHexToRgb(colorIndex) {
  const hex = C64_COLORS[clampColor(colorIndex)] || "#000000";
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(m[1].slice(0, 2), 16),
    g: parseInt(m[1].slice(2, 4), 16),
    b: parseInt(m[1].slice(4, 6), 16),
  };
}

function colorMatch(data, offset, rgb, tolerance = 8) {
  return (
    Math.abs(data[offset] - rgb.r) <= tolerance &&
    Math.abs(data[offset + 1] - rgb.g) <= tolerance &&
    Math.abs(data[offset + 2] - rgb.b) <= tolerance
  );
}

function floodFill(x, y, fillColorIndex, mode = 0) {
  if (!ctx || typeof ctx.getImageData !== "function" || typeof ctx.putImageData !== "function") {
    return;
  }

  const width = canvas.width;
  const height = getGraphicsClipHeightForMode();
  const sx = Math.trunc(Number(x));
  const sy = Math.trunc(Number(y));
  if (sx < 0 || sx >= width || sy < 0 || sy >= height) {
    return;
  }

  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  if (!data || !data.length) {
    return;
  }

  const fillRgb = colorHexToRgb(fillColorIndex);
  const backgroundRgb = colorHexToRgb(machine.gfx.colorSources[0] ?? 6);
  const seedOffset = (sy * width + sx) * 4;
  const target = {
    r: data[seedOffset],
    g: data[seedOffset + 1],
    b: data[seedOffset + 2],
  };

  if (mode === 1) {
    if (!colorMatch(data, seedOffset, backgroundRgb)) {
      return;
    }
    target.r = backgroundRgb.r;
    target.g = backgroundRgb.g;
    target.b = backgroundRgb.b;
  }

  if (target.r === fillRgb.r && target.g === fillRgb.g && target.b === fillRgb.b) {
    return;
  }

  const stack = [[sx, sy]];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cx >= width || cy < 0 || cy >= height) {
      continue;
    }
    const offset = (cy * width + cx) * 4;
    if (!colorMatch(data, offset, target)) {
      continue;
    }

    data[offset] = fillRgb.r;
    data[offset + 1] = fillRgb.g;
    data[offset + 2] = fillRgb.b;
    data[offset + 3] = 255;

    stack.push([cx + 1, cy]);
    stack.push([cx - 1, cy]);
    stack.push([cx, cy + 1]);
    stack.push([cx, cy - 1]);
  }

  ctx.putImageData(image, 0, 0);
}

function getColorFromSource(source, maxSource = 6) {
  const n = Math.trunc(Number(source));
  if (Number.isNaN(n) || n < 0 || n > maxSource) {
    throw new BasicError("ILLEGAL QUANTITY ERROR");
  }
  return machine.gfx.colorSources[n] ?? machine.textColor;
}

function setGraphicsCursor(x, y) {
  machine.gfx.cursorX = Number(x) || 0;
  machine.gfx.cursorY = Number(y) || 0;
}

function setTextColor(colorIndex) {
  machine.textColor = clampColor(colorIndex);
  machine.gfx.colorSources[1] = machine.textColor;
  machine.gfx.colorSources[5] = machine.textColor;
  if (screenTextEl) {
    screenTextEl.style.color = C64_COLORS[machine.textColor];
  }
  scheduleSessionPersist();
}

function createSessionSnapshot() {
  return {
    version: SESSION_VERSION,
    savedAt: new Date().toISOString(),
    program: getSortedProgramLines(),
    programVersion: machine.programVersion,
    programmingMode: machine.programmingMode,
    textColor: machine.textColor,
    expandedView: machine.expandedView,
    terminalText: terminal.text,
    terminalInput: terminal.input,
    cursorPos: terminal.cursorPos,
    viewOffset: terminal.viewOffset,
    programEditLineNumber: terminal.programEditLineNumber,
    gfx: {
      mode: machine.gfx.mode,
      splitRow: machine.gfx.splitRow,
      colorSources: Array.isArray(machine.gfx.colorSources) ? machine.gfx.colorSources.slice(0, 7) : null,
      cursorX: machine.gfx.cursorX,
      cursorY: machine.gfx.cursorY,
    },
  };
}

function persistSessionNow() {
  if (suspendSessionPersist || typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(createSessionSnapshot()));
  } catch (error) {
    // Best effort only: session persistence should never break the emulator.
  }
}

function scheduleSessionPersist() {
  if (suspendSessionPersist) {
    return;
  }
  if (sessionPersistTimer) {
    clearTimeout(sessionPersistTimer);
  }
  sessionPersistTimer = setTimeout(() => {
    sessionPersistTimer = null;
    persistSessionNow();
  }, 120);
}

function restoreSessionState() {
  if (typeof localStorage === "undefined") {
    return false;
  }

  let parsed;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION);
    if (!raw) {
      return false;
    }
    parsed = JSON.parse(raw);
  } catch (error) {
    return false;
  }

  if (!parsed || parsed.version !== SESSION_VERSION) {
    return false;
  }

  suspendSessionPersist = true;
  try {
    const lines = sanitizeProgramLines(parsed.program);
    machine.program.clear();
    lines.forEach(([lineNumber, text]) => {
      machine.program.set(Number(lineNumber), String(text));
    });
    machine.programVersion = Math.max(0, Math.trunc(Number(parsed.programVersion) || 0));
    machine.programmingMode = Boolean(parsed.programmingMode);
    machine.continuation = null;
    machine.running = false;
    machine.stopRequested = false;
    machine.waitInput = null;

    terminal.text = String(parsed.terminalText ?? "");
    terminal.input = String(parsed.terminalInput ?? "");
    const cursorPos = Math.trunc(Number(parsed.cursorPos));
    if (Number.isFinite(cursorPos)) {
      terminal.cursorPos = Math.max(0, Math.min(terminal.input.length, cursorPos));
    } else {
      terminal.cursorPos = terminal.input.length;
    }
    terminal.viewOffset = Math.max(0, Math.trunc(Number(parsed.viewOffset) || 0));

    const lineForEdit = parsed.programEditLineNumber == null ? null : Math.trunc(Number(parsed.programEditLineNumber));
    if (lineForEdit != null && machine.program.has(lineForEdit)) {
      terminal.programEditLineNumber = lineForEdit;
      terminal.programEditLineIndex = findProgramLineIndexInText(lineForEdit);
    } else {
      clearProgramEditCursor();
    }

    if (parsed.textColor != null) {
      setTextColor(clampColor(parsed.textColor));
    }

    const savedGfx = parsed.gfx;
    if (savedGfx && typeof savedGfx === "object") {
      const mode = Math.trunc(Number(savedGfx.mode));
      if (Number.isFinite(mode)) {
        machine.gfx.mode = Math.max(0, Math.min(5, mode));
      }

      machine.gfx.splitRow = normalizeSplitRow(savedGfx.splitRow ?? machine.gfx.splitRow);
      machine.gfx.cursorX = Number(savedGfx.cursorX) || 0;
      machine.gfx.cursorY = Number(savedGfx.cursorY) || 0;

      if (Array.isArray(savedGfx.colorSources)) {
        const colors = machine.gfx.colorSources.slice();
        for (let i = 0; i < 7; i += 1) {
          if (savedGfx.colorSources[i] != null) {
            colors[i] = clampColor(savedGfx.colorSources[i]);
          }
        }
        machine.gfx.colorSources = colors;
      }
    }

    machine.expandedView = Boolean(parsed.expandedView);
    if (document?.body?.classList) {
      document.body.classList.toggle("view-expanded", machine.expandedView);
    }
    updateViewToggleLabel();

    applyGraphicModePresentation();
    clearGraphics();
    return true;
  } catch (error) {
    return false;
  } finally {
    suspendSessionPersist = false;
  }
}

function getWrappedBuffer() {
  const cursor = terminal.cursorVisible ? "\u2588" : " ";
  const before = terminal.input.slice(0, terminal.cursorPos);
  const after = terminal.input.slice(terminal.cursorPos);
  const cursorLine = `${before}${cursor}${after}`;
  const full = buildRenderText(cursorLine);
  return wrapForC64(full);
}

function buildRenderText(cursorLine) {
  const lineNumber = terminal.programEditLineNumber;
  if (lineNumber == null) {
    return `${terminal.text}${cursorLine}`;
  }

  const lines = terminal.text.split("\n");
  let idx = terminal.programEditLineIndex;
  if (!isProgramLineAt(lines, idx, lineNumber)) {
    idx = findProgramLineIndexInText(lineNumber);
    terminal.programEditLineIndex = idx;
  }

  if (idx >= 0 && idx < lines.length) {
    lines[idx] = cursorLine;
    return lines.join("\n");
  }

  return `${terminal.text}${cursorLine}`;
}

function isProgramLineAt(lines, idx, lineNumber) {
  if (!Array.isArray(lines) || idx < 0 || idx >= lines.length) {
    return false;
  }
  const re = new RegExp(`^\\s*${lineNumber}\\b`);
  return re.test(lines[idx] || "");
}

function findProgramLineIndexInText(lineNumber) {
  const lines = terminal.text.split("\n");
  const re = new RegExp(`^\\s*${lineNumber}\\b`);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (re.test(lines[i] || "")) {
      return i;
    }
  }
  return -1;
}

function wrapForC64(text) {
  const wrapped = [];
  const lines = text.split("\n");
  for (const line of lines) {
    if (!line.length) {
      wrapped.push("");
      continue;
    }
    for (let i = 0; i < line.length; i += C64_COLUMNS) {
      wrapped.push(line.slice(i, i + C64_COLUMNS));
    }
  }
  return wrapped;
}

function getMaxViewOffset() {
  const wrapped = getWrappedBuffer();
  return Math.max(0, wrapped.length - getVisibleRows());
}

function clampViewOffset() {
  const maxOffset = getMaxViewOffset();
  terminal.viewOffset = Math.max(0, Math.min(maxOffset, terminal.viewOffset));
}

function scrollView(delta) {
  terminal.viewOffset += delta;
  clampViewOffset();
  render();
}

function render() {
  if (!screenTextEl) {
    return;
  }
  const wrapped = getWrappedBuffer();
  clampViewOffset();
  const rows = getVisibleRows();
  const end = Math.max(0, wrapped.length - terminal.viewOffset);
  const start = Math.max(0, end - rows);
  const visible = wrapped.slice(start, end);
  terminal.lastVisibleLines = visible.map((line) => line.replace(/\u2588/g, ""));
  screenTextEl.textContent = visible.join("\n");
}

function getVisibleRows() {
  if (!screenTextEl) {
    return C64_MIN_ROWS;
  }
  if (!window || typeof window.getComputedStyle !== "function") {
    return C64_MIN_ROWS;
  }

  const style = window.getComputedStyle(screenTextEl);
  const fontSize = parseFloat(style.fontSize) || 16;
  const lineHeight = parseFloat(style.lineHeight) || fontSize;
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const paddingBottom = parseFloat(style.paddingBottom) || 0;
  const innerHeight = Math.max(0, screenTextEl.clientHeight - paddingTop - paddingBottom);
  const rows = Math.floor(innerHeight / Math.max(1, lineHeight));
  return Math.max(C64_MIN_ROWS, rows || C64_MIN_ROWS);
}

function updateViewToggleLabel() {
  if (!viewToggleEl) {
    return;
  }
  viewToggleEl.textContent = machine.expandedView ? "NORMAL NEZET" : "MAX NEZET";
}

function updateAiButtonState() {
  if (!aiGenerateEl) {
    return;
  }

  if (aiState.busy) {
    aiGenerateEl.disabled = true;
    aiGenerateEl.textContent = "AI...";
    aiGenerateEl.title = "AI BASIC generator fut...";
    return;
  }

  if (!aiState.checked) {
    aiGenerateEl.disabled = true;
    aiGenerateEl.textContent = "AI?";
    aiGenerateEl.title = "AI BASIC generator ellenorzes...";
    return;
  }

  if (!aiState.enabled) {
    aiGenerateEl.disabled = true;
    aiGenerateEl.textContent = "AI OFF";
    aiGenerateEl.title = "OPENAI_API_KEY nincs beallitva (Vercel env vagy .env.local).";
    return;
  }

  aiGenerateEl.disabled = false;
  aiGenerateEl.textContent = "AI";
  aiGenerateEl.title = aiState.model
    ? `AI BASIC generator (${aiState.model}${aiState.source ? ` | ${aiState.source}` : ""})`
    : "AI BASIC generator";
}

async function refreshAiAvailability() {
  aiState.checked = false;
  aiState.enabled = false;
  aiState.model = "";
  aiState.source = "";
  updateAiButtonState();

  try {
    const response = await fetch("./api/generate-basic", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    let payload = null;
    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }

    aiState.enabled = Boolean(response.ok && payload?.enabled);
    aiState.model = payload?.model ? String(payload.model) : "";
    aiState.source = payload?.source ? String(payload.source) : "";
  } catch (error) {
    aiState.enabled = false;
    aiState.model = "";
    aiState.source = "";
  } finally {
    aiState.checked = true;
    updateAiButtonState();
  }
}

function buildAiProgramName(title = "") {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const cleaned = String(title || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 8);
  return cleaned ? `AI-${cleaned}-${stamp}` : `AI-PROG-${stamp}`;
}

function toAiBasicError(error) {
  if (error instanceof BasicError) {
    return error.message;
  }
  if (error && typeof error.message === "string" && error.message) {
    return error.message.toUpperCase();
  }
  return "AI ERROR";
}

async function requestAiProgram(taskText) {
  let response;
  try {
    response = await fetch("./api/generate-basic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ task: taskText }),
    });
  } catch (error) {
    throw new BasicError("AI SERVICE UNREACHABLE");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (response.status === 503 || payload?.enabled === false) {
    aiState.enabled = false;
    aiState.checked = true;
    updateAiButtonState();
    throw new BasicError("AI DISABLED");
  }

  if (!response.ok) {
    let message = payload?.error ? String(payload.error).toUpperCase() : "AI REQUEST ERROR";
    if (Array.isArray(payload?.details) && payload.details.length) {
      message += `: ${String(payload.details[0]).toUpperCase()}`;
    }
    throw new BasicError(message);
  }

  if (!payload || !Array.isArray(payload.lines)) {
    throw new BasicError("AI RESPONSE ERROR");
  }

  return payload;
}

async function openAiProgramPrompt() {
  if (machine.running) {
    screenWriteLine("?AI DISABLED WHILE RUNNING");
    return;
  }
  if (!aiState.enabled) {
    screenWriteLine("?AI DISABLED");
    screenWriteLine("READY.");
    return;
  }
  if (aiState.busy) {
    return;
  }

  const input = window.prompt(
    "AI BASIC feladat (pl: Csinolj amoba jatekot BASIC-ben):",
    "",
  );
  if (input == null) {
    focusScreen();
    return;
  }

  const taskText = String(input).trim();
  if (!taskText) {
    focusScreen();
    return;
  }

  aiState.busy = true;
  updateAiButtonState();
  screenWriteLine("AI GENERATING BASIC PROGRAM...");

  try {
    const aiPayload = await requestAiProgram(taskText);
    const lines = sanitizeProgramLines(aiPayload.lines);
    if (!lines.length) {
      throw new BasicError("AI EMPTY PROGRAM");
    }

    loadProgramIntoMachine(lines, { programmingMode: true });
    const programTitle = aiPayload.title ? String(aiPayload.title) : "";
    const saveName = saveProgramSnapshot(buildAiProgramName(programTitle), lines, {
      source: "ai",
      device: DEFAULT_DEVICE,
    });

    screenWriteLine(`AI PROGRAM SAVED AS "${saveName}"`);
    listProgram("LIST");
    screenWriteLine("READY.");
  } catch (error) {
    screenWriteLine(`?${toAiBasicError(error)}`);
    screenWriteLine("READY.");
  } finally {
    aiState.busy = false;
    updateAiButtonState();
    focusScreen();
  }
}

function setExpandedView(enabled) {
  machine.expandedView = Boolean(enabled);
  if (document?.body?.classList) {
    document.body.classList.toggle("view-expanded", machine.expandedView);
  }
  terminal.viewOffset = 0;
  updateViewToggleLabel();
  scheduleSessionPersist();
  render();
}

function toggleExpandedView() {
  setExpandedView(!machine.expandedView);
}

function resetInputLine() {
  terminal.input = "";
  terminal.cursorPos = 0;
  scheduleSessionPersist();
}

function setInputLine(value) {
  terminal.input = String(value ?? "");
  terminal.cursorPos = terminal.input.length;
  terminal.viewOffset = 0;
  scheduleSessionPersist();
  render();
}

function clearProgramEditCursor() {
  terminal.programEditLineNumber = null;
  terminal.programEditLineIndex = -1;
}

function alignInputViewport() {
  if (terminal.programEditLineNumber != null) {
    ensureProgramEditVisible();
    return;
  }
  terminal.viewOffset = 0;
}

function getCurrentCursorLine() {
  const cursor = terminal.cursorVisible ? "\u2588" : " ";
  const before = terminal.input.slice(0, terminal.cursorPos);
  const after = terminal.input.slice(terminal.cursorPos);
  return `${before}${cursor}${after}`;
}

function getWrappedRowCountForLine(line) {
  const text = String(line ?? "");
  return Math.max(1, Math.ceil(text.length / C64_COLUMNS));
}

function ensureProgramEditVisible() {
  const lineNumber = terminal.programEditLineNumber;
  if (lineNumber == null) {
    return;
  }

  let textLineIndex = terminal.programEditLineIndex;
  const renderedLines = buildRenderText(getCurrentCursorLine()).split("\n");

  if (!isProgramLineAt(renderedLines, textLineIndex, lineNumber)) {
    const re = new RegExp(`^\\s*${lineNumber}\\b`);
    textLineIndex = renderedLines.findIndex((line) => re.test(line || ""));
    terminal.programEditLineIndex = textLineIndex;
  }

  if (textLineIndex < 0 || textLineIndex >= renderedLines.length) {
    return;
  }

  let wrappedStart = 0;
  for (let i = 0; i < textLineIndex; i += 1) {
    wrappedStart += getWrappedRowCountForLine(renderedLines[i]);
  }

  const wrappedHeight = getWrappedRowCountForLine(renderedLines[textLineIndex]);
  const wrappedTotal = renderedLines.reduce((sum, line) => sum + getWrappedRowCountForLine(line), 0);
  const rows = getVisibleRows();
  const currentEnd = Math.max(0, wrappedTotal - terminal.viewOffset);
  const currentStart = Math.max(0, currentEnd - rows);
  const targetEnd = wrappedStart + wrappedHeight;

  if (wrappedStart >= currentStart && targetEnd <= currentEnd) {
    return;
  }

  let desiredStart = currentStart;
  if (wrappedStart < currentStart) {
    desiredStart = wrappedStart;
  } else if (targetEnd > currentEnd) {
    desiredStart = targetEnd - rows;
  }

  desiredStart = Math.max(0, Math.min(desiredStart, Math.max(0, wrappedTotal - rows)));
  terminal.viewOffset = Math.max(0, wrappedTotal - Math.min(wrappedTotal, desiredStart + rows));
}

function openProgramLineForEdit(lineNumber) {
  if (!machine.program.has(lineNumber)) {
    return false;
  }

  terminal.programEditLineNumber = lineNumber;
  terminal.programEditLineIndex = findProgramLineIndexInText(lineNumber);
  terminal.input = `${lineNumber} ${machine.program.get(lineNumber) ?? ""}`;
  terminal.cursorPos = terminal.input.length;
  terminal.viewOffset = 0;
  scheduleSessionPersist();
  ensureProgramEditVisible();
  render();
  return true;
}

function getSortedProgramLineNumbers() {
  return Array.from(machine.program.keys()).sort((a, b) => a - b);
}

function extractCurrentInputLineNumber() {
  const match = terminal.input.match(/^\s*(\d+)\b/);
  return match ? Number(match[1]) : null;
}

function navigateProgramLine(direction) {
  const lines = getSortedProgramLineNumbers();
  if (!lines.length) {
    return false;
  }

  const current = extractCurrentInputLineNumber();
  if (current == null) {
    if (direction < 0) {
      const target = lines[lines.length - 1];
      return openProgramLineForEdit(target);
    }
    return false;
  }

  const exactIndex = lines.findIndex((line) => line === current);
  let targetIndex = -1;

  if (exactIndex >= 0) {
    targetIndex = exactIndex + direction;
  } else {
    let insertAt = lines.findIndex((line) => line > current);
    if (insertAt < 0) {
      insertAt = lines.length;
    }
    targetIndex = direction < 0 ? insertAt - 1 : insertAt;
  }

  if (targetIndex < 0 || targetIndex >= lines.length) {
    if (direction > 0) {
      clearProgramEditCursor();
      setInputLine("");
      return true;
    }
    return false;
  }

  const targetLine = lines[targetIndex];
  return openProgramLineForEdit(targetLine);
}

function pickProgramLineFromPointer(event) {
  if (!screenTextEl || typeof screenTextEl.getBoundingClientRect !== "function") {
    return false;
  }
  if (!window || typeof window.getComputedStyle !== "function") {
    return false;
  }

  const rect = screenTextEl.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  ) {
    return false;
  }

  const style = window.getComputedStyle(screenTextEl);
  const lineHeight = parseFloat(style.lineHeight) || 16;
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const row = Math.floor((event.clientY - rect.top - paddingTop) / Math.max(1, lineHeight));
  if (row < 0) {
    return false;
  }

  const lines = terminal.lastVisibleLines || [];
  if (row >= lines.length) {
    return false;
  }

  const raw = String(lines[row] || "").trimEnd();
  const match = raw.match(/^\s*(\d+)\s+(.*)$/);
  if (!match) {
    return false;
  }

  const lineNumber = Number(match[1]);
  return openProgramLineForEdit(lineNumber);
}

function commitInputLine() {
  if (terminal.programEditLineNumber != null) {
    const lines = terminal.text.split("\n");
    const idx = terminal.programEditLineIndex;
    if (idx >= 0 && idx < lines.length) {
      lines[idx] = terminal.input;
      terminal.text = lines.join("\n");
      trimTerminalText();
    } else {
      appendScreenText(`${terminal.input}\n`);
    }
    clearProgramEditCursor();
  } else {
    appendScreenText(`${terminal.input}\n`);
  }
  terminal.viewOffset = 0;
  scheduleSessionPersist();
  resetInputLine();
  render();
}

function insertTextAtCursor(text) {
  const left = terminal.input.slice(0, terminal.cursorPos);
  const right = terminal.input.slice(terminal.cursorPos);
  terminal.input = `${left}${text}${right}`;
  terminal.cursorPos += text.length;
  alignInputViewport();
  scheduleSessionPersist();
  render();
}

function canTypeNow() {
  if (machine.running) {
    return Boolean(machine.waitInput);
  }
  return true;
}

function normalizeKey(event) {
  const key = event.key;
  if (key === "UIKeyInputUpArrow") return "ArrowUp";
  if (key === "UIKeyInputDownArrow") return "ArrowDown";
  if (key === "UIKeyInputLeftArrow") return "ArrowLeft";
  if (key === "UIKeyInputRightArrow") return "ArrowRight";
  if (key === "Up") return "ArrowUp";
  if (key === "Down") return "ArrowDown";
  if (key === "Left") return "ArrowLeft";
  if (key === "Right") return "ArrowRight";
  if (key && key !== "Unidentified") return key;

  switch (event.keyCode) {
    case 8:
      return "Backspace";
    case 9:
      return "Tab";
    case 13:
      return "Enter";
    case 27:
      return "Escape";
    case 33:
      return "PageUp";
    case 34:
      return "PageDown";
    case 35:
      return "End";
    case 36:
      return "Home";
    case 37:
      return "ArrowLeft";
    case 38:
      return "ArrowUp";
    case 39:
      return "ArrowRight";
    case 40:
      return "ArrowDown";
    case 46:
      return "Delete";
    case 120:
      return "F9";
    default:
      return key || "";
  }
}

function isEditableTarget(target) {
  if (!target || typeof target.closest !== "function") {
    return false;
  }
  return Boolean(target.closest("a,button,input,textarea,select,[contenteditable='true']"));
}

ensureDomReady();

if (screenEl && screenEl.addEventListener) {
  screenEl.addEventListener("pointerdown", () => {
    focusScreen();
  });

  screenEl.addEventListener("focus", () => {
    terminal.focused = true;
    terminal.cursorVisible = true;
    render();
  });

  screenEl.addEventListener("blur", () => {
    terminal.focused = false;
    render();
  });

  screenEl.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const direction = event.deltaY > 0 ? -1 : 1;
      scrollView(direction);
    },
    { passive: false },
  );
}

if (viewToggleEl && viewToggleEl.addEventListener) {
  viewToggleEl.addEventListener("click", () => {
    toggleExpandedView();
    focusScreen();
  });
  updateViewToggleLabel();
}

if (aiGenerateEl && aiGenerateEl.addEventListener) {
  aiGenerateEl.addEventListener("click", async () => {
    await openAiProgramPrompt();
  });
  updateAiButtonState();
}

window.addEventListener("resize", () => {
  resizeCanvas();
  render();
});

window.addEventListener("paste", (event) => {
  if (!canTypeNow()) {
    return;
  }
  event.preventDefault();
  const text = (event.clipboardData?.getData("text") || "").replace(/\r\n?/g, "\n");
  insertTextAtCursor(text.split("\n")[0]);
});

window.addEventListener("pointerdown", (event) => {
  if (isEditableTarget(event.target)) {
    return;
  }
  const pickedProgramLine = pickProgramLineFromPointer(event);
  if (!pickedProgramLine && terminal.programEditLineNumber != null) {
    clearProgramEditCursor();
    setInputLine("");
  }
  focusScreen();
});

window.addEventListener("beforeunload", () => {
  persistSessionNow();
});

window.addEventListener("keydown", (event) => {
  const key = normalizeKey(event);

  if (key === "F9") {
    event.preventDefault();
    toggleExpandedView();
    focusScreen();
    return;
  }

  if (key === "Escape" && machine.running) {
    machine.stopRequested = true;
    event.preventDefault();
    return;
  }

  if ((event.ctrlKey || event.metaKey) && key.toUpperCase() === "C" && machine.running) {
    machine.stopRequested = true;
    event.preventDefault();
    return;
  }

  if (machine.running && !machine.waitInput && key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    machine.keyQueue.push(key);
    event.preventDefault();
    return;
  }

  if (!canTypeNow()) {
    return;
  }

  const shouldHandle =
    key === "Enter" ||
    key === "Backspace" ||
    key === "Delete" ||
    key === "ArrowLeft" ||
    key === "ArrowRight" ||
    key === "ArrowUp" ||
    key === "ArrowDown" ||
    key === "Home" ||
    key === "End" ||
    key === "Tab" ||
    key === "PageUp" ||
    key === "PageDown" ||
    (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey);

  if (!shouldHandle) {
    return;
  }

  event.preventDefault();
  focusScreen();

  switch (key) {
    case "Enter":
      submitInput({ shiftPrefill: event.shiftKey });
      return;
    case "Backspace":
      if (terminal.cursorPos > 0) {
        terminal.input =
          terminal.input.slice(0, terminal.cursorPos - 1) + terminal.input.slice(terminal.cursorPos);
        terminal.cursorPos -= 1;
        alignInputViewport();
        scheduleSessionPersist();
        render();
      }
      return;
    case "Delete":
      if (terminal.cursorPos < terminal.input.length) {
        terminal.input =
          terminal.input.slice(0, terminal.cursorPos) + terminal.input.slice(terminal.cursorPos + 1);
        alignInputViewport();
        scheduleSessionPersist();
        render();
      }
      return;
    case "ArrowLeft":
      terminal.cursorPos = Math.max(0, terminal.cursorPos - 1);
      alignInputViewport();
      render();
      return;
    case "ArrowRight":
      terminal.cursorPos = Math.min(terminal.input.length, terminal.cursorPos + 1);
      alignInputViewport();
      render();
      return;
    case "ArrowUp":
      if (event.altKey || event.ctrlKey || event.metaKey) {
        scrollView(1);
      } else {
        navigateProgramLine(-1);
      }
      return;
    case "ArrowDown":
      if (event.altKey || event.ctrlKey || event.metaKey) {
        scrollView(-1);
      } else {
        navigateProgramLine(1);
      }
      return;
    case "PageUp":
      scrollView(8);
      return;
    case "PageDown":
      scrollView(-8);
      return;
    case "Home":
      terminal.cursorPos = 0;
      alignInputViewport();
      render();
      return;
    case "End":
      terminal.cursorPos = terminal.input.length;
      alignInputViewport();
      render();
      return;
    case "Tab":
      insertTextAtCursor("  ");
      return;
    default:
      insertTextAtCursor(key);
  }
});

async function submitInput(options = {}) {
  const line = terminal.input;
  const fromProgramEdit = terminal.programEditLineNumber != null;
  commitInputLine();

  if (machine.waitInput) {
    const resolver = machine.waitInput;
    machine.waitInput = null;
    resolver(line);
    return;
  }

  await handleInput(line, { ...options, fromProgramEdit });
}

async function handleInput(rawInput, options = {}) {
  const line = rawInput.replace(/\r/g, "");
  const match = line.match(/^\s*(\d+)\s*(.*)$/);

  if (match) {
    const lineNumber = Number(match[1]);
    const content = match[2].trim();

    if (!content) {
      machine.program.delete(lineNumber);
    } else {
      machine.program.set(lineNumber, content);
    }

    machine.programVersion += 1;
    machine.continuation = null;
    machine.programmingMode = true;
    clearProgramEditCursor();
    scheduleSessionPersist();

    if (options.shiftPrefill) {
      clearProgramEditCursor();
      prefillProgramLine(lineNumber + 10);
    }
    return;
  }

  const trimmed = line.trim();
  const upper = trimmed.toUpperCase();

  if (machine.programmingMode && trimmed && !isProgramModeCommand(upper)) {
    screenWriteLine("?LINE NUMBER EXPECTED");
    return;
  }

  clearProgramEditCursor();
  await executeImmediate(trimmed);
}

function isProgramModeCommand(commandUpper) {
  return (
    commandUpper === "RUN" ||
    /^RUN\s+\d+$/i.test(commandUpper) ||
    commandUpper === "LIST" ||
    commandUpper.startsWith("LIST ") ||
    commandUpper === "NEW" ||
    commandUpper === "TESTPACK" ||
    commandUpper === "HELP" ||
    commandUpper === "CLS" ||
    commandUpper === "CLSG" ||
    commandUpper.startsWith("GRAPHIC") ||
    commandUpper.startsWith("SCNCLR") ||
    commandUpper.startsWith("COLOR") ||
    commandUpper.startsWith("PLOT") ||
    commandUpper.startsWith("LINE") ||
    commandUpper.startsWith("RECT") ||
    commandUpper.startsWith("CIRCLE") ||
    commandUpper.startsWith("DRAW") ||
    commandUpper.startsWith("BOX") ||
    commandUpper.startsWith("PAINT") ||
    commandUpper === "CONT" ||
    commandUpper.startsWith("LOAD") ||
    commandUpper.startsWith("SAVE") ||
    commandUpper.startsWith("VERIFY") ||
    commandUpper.startsWith("OPEN") ||
    commandUpper.startsWith("CLOSE") ||
    commandUpper.startsWith("CMD") ||
    commandUpper.startsWith("SYS")
  );
}

function prefillProgramLine(lineNumber) {
  const value = `${Math.max(0, Math.trunc(lineNumber))} `;
  terminal.input = value;
  terminal.cursorPos = value.length;
  terminal.viewOffset = 0;
  render();
}

async function executeImmediate(command) {
  if (!command) {
    screenWriteLine("READY.");
    return;
  }

  const upper = command.toUpperCase();

  try {
    if (upper === "RUN" || /^RUN\s+\d+$/i.test(upper)) {
      machine.programmingMode = false;
      const startLine = parseRunStartLine(command);
      await runProgram({ startLine });
      return;
    }

    if (upper === "CONT") {
      await continueProgram();
      return;
    }

    if (upper.startsWith("LIST")) {
      listProgram(command);
      screenWriteLine("READY.");
      return;
    }

    if (upper === "NEW") {
      machine.program.clear();
      machine.programVersion += 1;
      machine.continuation = null;
      machine.programmingMode = true;
      screenWriteLine("READY.");
      return;
    }

    if (upper === "TESTPACK") {
      installTestPack();
      screenWriteLine("READY.");
      return;
    }

    if (upper === "CLS") {
      clearText();
      screenWriteLine("READY.");
      return;
    }

    if (upper === "CLSG") {
      clearGraphics();
      screenWriteLine("READY.");
      return;
    }

    if (upper === "HELP") {
      printHelp();
      screenWriteLine("READY.");
      return;
    }

    if (upper.startsWith("SAVE")) {
      executeSave(command);
      screenWriteLine("READY.");
      return;
    }

    if (upper.startsWith("LOAD")) {
      executeLoad(command);
      screenWriteLine("READY.");
      return;
    }

    if (upper.startsWith("VERIFY")) {
      executeVerify(command);
      screenWriteLine("READY.");
      return;
    }

    if (upper.startsWith("OPEN")) {
      executeOpen(command, null);
      screenWriteLine("READY.");
      return;
    }

    if (upper.startsWith("CLOSE")) {
      executeClose(command, null);
      screenWriteLine("READY.");
      return;
    }

    if (upper.startsWith("CMD")) {
      executeCmd(command, null);
      screenWriteLine("READY.");
      return;
    }

    if (upper.startsWith("SYS")) {
      executeSys(command, null);
      screenWriteLine("READY.");
      return;
    }

    const state = createExecutionState([]);
    await executeStatement(command, state, null);
    screenWriteLine("READY.");
  } catch (error) {
    screenWriteLine(`?${toBasicMessage(error)}`);
    screenWriteLine("READY.");
  }
}

function printHelp() {
  screenWriteLine("COMMANDS: LIST RUN NEW CONT SAVE LOAD VERIFY");
  screenWriteLine("TOOLS: TESTPACK (INSTALL DEMO PROGRAMS)");
  screenWriteLine("I/O: OPEN CLOSE CMD SYS PRINT# INPUT# GET#");
  screenWriteLine("BASIC: IF THEN ELSE FOR NEXT ON GOTO GOSUB");
  screenWriteLine("DATA: DATA READ RESTORE DIM DEF FN CLR");
  screenWriteLine("GRAPHICS: GRAPHIC SCNCLR COLOR DRAW BOX CIRCLE PAINT");
  screenWriteLine("LEGACY GFX: PLOT LINE RECT CIRCLE ... FILL CLSG");
  screenWriteLine("EDIT: ARROW UP/DOWN PROGRAM LINES | CLICK LIST LINE TO EDIT");
  screenWriteLine("SCROLL: ALT+ARROW OR PAGEUP/PAGEDOWN");
  screenWriteLine("TIP: SHIFT+ENTER = NEXT LINE PREFILL (+10)");
  screenWriteLine("AI: USE FOOTER AI BUTTON (API KEY REQUIRED)");
  screenWriteLine("README: CLICK README LINK BELOW");
}

function parseRunStartLine(command) {
  const match = command.trim().match(/^RUN(?:\s+(\d+))?$/i);
  if (!match) {
    throw new BasicError("SYNTAX ERROR");
  }
  return match[1] ? Number(match[1]) : null;
}

async function continueProgram() {
  const cont = machine.continuation;
  if (!cont || cont.programVersion !== machine.programVersion) {
    throw new BasicError("CAN'T CONTINUE ERROR");
  }
  machine.programmingMode = false;
  machine.continuation = null;
  await runProgram({ resumeState: cont.state, resumePc: cont.pc });
}

function listProgram(command) {
  const sorted = getSortedProgramLines();
  const rangeText = command.replace(/^LIST/i, "").trim();

  let start = -Infinity;
  let end = Infinity;

  if (rangeText) {
    const match = rangeText.match(/^(\d+)?\s*(?:-\s*(\d+)?)?$/);
    if (!match) {
      throw new BasicError("SYNTAX ERROR");
    }
    if (match[1]) start = Number(match[1]);
    if (match[2]) end = Number(match[2]);
    if (!match[2] && rangeText.includes("-") && match[1]) {
      end = Infinity;
    }
  }

  for (const [lineNumber, text] of sorted) {
    if (lineNumber >= start && lineNumber <= end) {
      screenWriteLine(`${lineNumber} ${text}`);
    }
  }
}

function getSortedProgramLines() {
  return Array.from(machine.program.entries()).sort((a, b) => a[0] - b[0]);
}

function splitStatements(lineText) {
  const parts = [];
  let current = "";
  let inString = false;

  for (let i = 0; i < lineText.length; i += 1) {
    const ch = lineText[i];
    if (ch === '"') {
      inString = !inString;
      current += ch;
      continue;
    }
    if (ch === ":" && !inString) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }

  if (current.trim() || parts.length) {
    parts.push(current.trim());
  }

  return parts.filter(Boolean);
}

function buildInstructions(lines) {
  const instructions = [];
  for (const [lineNumber, text] of lines) {
    const stmts = splitStatements(text);
    for (const stmt of stmts) {
      instructions.push({ lineNumber, stmt });
    }
  }
  return instructions;
}

function buildLineIndex(instructions) {
  const index = new Map();
  instructions.forEach((inst, idx) => {
    if (!index.has(inst.lineNumber)) {
      index.set(inst.lineNumber, idx);
    }
  });
  return index;
}

function collectDataItems(instructions) {
  const items = [];
  instructions.forEach((inst) => {
    const up = inst.stmt.trim().toUpperCase();
    if (up.startsWith("DATA")) {
      const body = inst.stmt.trim().slice(4).trim();
      parseDataItems(body).forEach((value) => {
        items.push({ value, lineNumber: inst.lineNumber });
      });
    }
  });
  return items;
}

function createExecutionState(instructions) {
  return {
    instructions,
    indexByLine: buildLineIndex(instructions),
    vars: new Map(),
    arrays: new Map(),
    userFns: new Map(),
    forStack: [],
    gosubStack: [],
    currentPc: 0,
    nextPc: 0,
    currentLineNumber: null,
    cmdChannel: machine.cmdChannel,
    dataItems: collectDataItems(instructions),
    dataPtr: 0,
  };
}

async function runProgram(options = {}) {
  if (machine.running) {
    throw new BasicError("ALREADY RUNNING");
  }

  let state = options.resumeState || null;
  if (!state) {
    const lines = getSortedProgramLines();
    const instructions = buildInstructions(lines);
    state = createExecutionState(instructions);
    if (options.startLine != null) {
      const line = Math.trunc(Number(options.startLine));
      if (!state.indexByLine.has(line)) {
        throw new BasicError("UNDEF'D STATEMENT ERROR");
      }
      state.currentPc = state.indexByLine.get(line);
    }
  } else {
    state.currentPc = options.resumePc ?? state.currentPc;
  }

  machine.running = true;
  machine.stopRequested = false;
  machine.waitInput = null;

  try {
    for (; state.currentPc < state.instructions.length; ) {
      const inst = state.instructions[state.currentPc];
      state.currentLineNumber = inst.lineNumber;

      if (machine.stopRequested) {
        throw new ProgramPause(inst.lineNumber, state.currentPc);
      }

      state.nextPc = state.currentPc + 1;
      await executeStatement(inst.stmt, state, inst.lineNumber);
      state.currentPc = state.nextPc;
      await microYield();
    }

    machine.continuation = null;
    screenWriteLine("READY.");
  } catch (error) {
    if (error instanceof ProgramPause) {
      machine.continuation = {
        state,
        pc: error.continuationPc,
        lineNumber: error.lineNumber,
        programVersion: machine.programVersion,
      };
      screenWriteLine(`BREAK IN ${error.lineNumber}`);
      screenWriteLine("READY.");
    } else {
      machine.continuation = null;
      const lineInfo = state.currentLineNumber != null ? ` IN ${state.currentLineNumber}` : "";
      screenWriteLine(`?${toBasicMessage(error)}${lineInfo}`);
      screenWriteLine("READY.");
    }
  } finally {
    machine.running = false;
    machine.stopRequested = false;
    machine.waitInput = null;
  }
}

function microYield() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function executeStatement(statement, state, lineNumber) {
  const stmt = statement.trim();
  if (!stmt) {
    return;
  }

  if (stmt.startsWith("?")) {
    executePrint(stmt.slice(1), state, null);
    return;
  }

  const upper = stmt.toUpperCase();

  if (upper.startsWith("REM")) {
    return;
  }

  if (upper.startsWith("DATA")) {
    return;
  }

  if (upper === "END") {
    state.nextPc = Number.MAX_SAFE_INTEGER;
    return;
  }

  if (upper === "STOP") {
    throw new ProgramPause(lineNumber ?? state.currentLineNumber ?? 0, state.nextPc);
  }

  if (upper === "CLS") {
    clearText();
    return;
  }

  if (upper === "CLSG") {
    clearGraphics();
    return;
  }

  if (upper === "CLR") {
    executeClr(state);
    return;
  }

  if (upper.startsWith("COLOR")) {
    executeColor(stmt, state);
    return;
  }

  if (upper.startsWith("GRAPHIC")) {
    executeGraphic(stmt, state);
    return;
  }

  if (upper.startsWith("SCNCLR")) {
    executeScnclr(stmt, state);
    return;
  }

  if (upper.startsWith("PRINT#")) {
    executePrintHash(stmt, state);
    return;
  }

  if (upper.startsWith("PRINT")) {
    executePrint(stmt.slice(5), state, null);
    return;
  }

  if (upper.startsWith("INPUT#")) {
    executeInputHash(stmt, state);
    return;
  }

  if (upper.startsWith("INPUT")) {
    await executeInput(stmt.slice(5), state);
    return;
  }

  if (upper.startsWith("GET#")) {
    executeGetHash(stmt, state);
    return;
  }

  if (upper.startsWith("GET")) {
    executeGet(stmt.slice(3), state);
    return;
  }

  if (upper.startsWith("READ")) {
    executeRead(stmt.slice(4), state);
    return;
  }

  if (upper.startsWith("RESTORE")) {
    executeRestore(stmt.slice(7), state);
    return;
  }

  if (upper.startsWith("DIM")) {
    executeDim(stmt.slice(3), state);
    return;
  }

  if (upper.startsWith("DEF FN")) {
    executeDefFn(stmt, state);
    return;
  }

  if (upper.startsWith("IF")) {
    await executeIf(stmt, state);
    return;
  }

  if (upper.startsWith("ON")) {
    executeOn(stmt, state);
    return;
  }

  if (upper.startsWith("FOR")) {
    executeFor(stmt, state);
    return;
  }

  if (upper.startsWith("NEXT")) {
    executeNext(stmt, state);
    return;
  }

  if (upper.startsWith("GOTO")) {
    gotoLine(evalExpression(stmt.slice(4).trim(), state), state);
    return;
  }

  if (upper.startsWith("GOSUB")) {
    state.gosubStack.push(state.nextPc);
    gotoLine(evalExpression(stmt.slice(5).trim(), state), state);
    return;
  }

  if (upper === "RETURN") {
    if (!state.gosubStack.length) {
      throw new BasicError("RETURN WITHOUT GOSUB");
    }
    state.nextPc = state.gosubStack.pop();
    return;
  }

  if (upper.startsWith("POKE")) {
    executePoke(stmt.slice(4), state);
    return;
  }

  if (upper.startsWith("WAIT")) {
    await executeWait(stmt.slice(4), state);
    return;
  }

  if (upper.startsWith("PLOT")) {
    executePlot(stmt, state);
    return;
  }

  if (upper.startsWith("LINE")) {
    executeLine(stmt, state);
    return;
  }

  if (upper.startsWith("RECT")) {
    executeRect(stmt, state);
    return;
  }

  if (upper.startsWith("CIRCLE")) {
    executeCircle(stmt, state);
    return;
  }

  if (upper.startsWith("DRAW")) {
    executeDraw(stmt, state);
    return;
  }

  if (upper.startsWith("BOX")) {
    executeBox(stmt, state);
    return;
  }

  if (upper.startsWith("PAINT")) {
    executePaint(stmt, state);
    return;
  }

  if (upper.startsWith("OPEN")) {
    executeOpen(stmt, state);
    return;
  }

  if (upper.startsWith("CLOSE")) {
    executeClose(stmt, state);
    return;
  }

  if (upper.startsWith("CMD")) {
    executeCmd(stmt, state);
    return;
  }

  if (upper.startsWith("SYS")) {
    executeSys(stmt, state);
    return;
  }

  if (executeAssignment(stmt, state)) {
    return;
  }

  throw new BasicError("SYNTAX ERROR");
}

function executeClr(state) {
  state.vars.clear();
  state.arrays.clear();
  state.userFns.clear();
  state.forStack = [];
  state.gosubStack = [];
  state.dataPtr = 0;
}

function executePrintHash(stmt, state) {
  const body = stmt.slice(6).trim();
  const firstComma = findTopLevelComma(body);
  if (firstComma < 0) {
    throw new BasicError("SYNTAX ERROR");
  }

  const channelExpr = body.slice(0, firstComma).trim();
  const channel = Math.trunc(Number(evalExpression(channelExpr, state)));
  const remainder = body.slice(firstComma + 1);
  executePrint(remainder, state, channel);
}

function executePrint(rawBody, state, forcedChannel) {
  const body = rawBody.trim();
  if (!body) {
    emitOutput("", state, forcedChannel, true);
    return;
  }

  const chunks = splitPrintArguments(body);
  let output = "";
  let trailingSemicolon = false;

  for (const chunk of chunks) {
    if (chunk.type === "expr") {
      output += formatValue(evalExpression(chunk.value, state));
      trailingSemicolon = false;
    } else if (chunk.type === "semicolon") {
      trailingSemicolon = true;
    } else if (chunk.type === "comma") {
      output += " ";
      trailingSemicolon = false;
    }
  }

  emitOutput(output, state, forcedChannel, !trailingSemicolon);
}

function splitPrintArguments(source) {
  const parts = [];
  let current = "";
  let inString = false;
  let depth = 0;

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '"') {
      inString = !inString;
      current += ch;
      continue;
    }

    if (!inString) {
      if (ch === "(") depth += 1;
      if (ch === ")") depth = Math.max(0, depth - 1);
      if ((ch === ";" || ch === ",") && depth === 0) {
        if (current.trim()) {
          parts.push({ type: "expr", value: current.trim() });
        }
        parts.push({ type: ch === ";" ? "semicolon" : "comma" });
        current = "";
        continue;
      }
    }

    current += ch;
  }

  if (current.trim()) {
    parts.push({ type: "expr", value: current.trim() });
  }

  return parts;
}

function emitOutput(text, state, forcedChannel, newline) {
  const channel = forcedChannel != null ? forcedChannel : state?.cmdChannel;

  if (channel != null) {
    const chan = machine.channels.get(channel);
    if (!chan) {
      throw new BasicError("FILE NOT OPEN ERROR");
    }
    chan.buffer += text;
    if (newline) {
      chan.buffer += "\n";
    }
    return;
  }

  if (text) {
    screenWrite(text);
  }
  if (newline) {
    screenWrite("\n");
  }
}

async function executeInput(rawBody, state) {
  const body = rawBody.trim();
  if (!body) {
    throw new BasicError("SYNTAX ERROR");
  }

  let prompt = "? ";
  let varsText = body;
  const pm = body.match(/^"([^"]*)"\s*;\s*(.+)$/);
  if (pm) {
    prompt = `${pm[1]}? `;
    varsText = pm[2].trim();
  }

  const targets = parseTargetList(varsText);
  if (!targets.length) {
    throw new BasicError("SYNTAX ERROR");
  }

  screenWrite(prompt);
  focusScreen();

  const line = await new Promise((resolve) => {
    machine.waitInput = resolve;
  });

  const values = splitTopLevel(line, ",").map((v) => v.trim());
  for (let i = 0; i < targets.length; i += 1) {
    const target = parseAssignTarget(targets[i], state);
    const raw = values[i] ?? "";
    const parsed = convertInputValue(raw, target.name.endsWith("$"));
    setTargetValue(state, target, parsed);
  }
}

function executeInputHash(stmt, state) {
  const body = stmt.slice(6).trim();
  const firstComma = findTopLevelComma(body);
  if (firstComma < 0) {
    throw new BasicError("SYNTAX ERROR");
  }

  const channelExpr = body.slice(0, firstComma).trim();
  const channel = Math.trunc(Number(evalExpression(channelExpr, state)));
  const chan = machine.channels.get(channel);
  if (!chan) {
    throw new BasicError("FILE NOT OPEN ERROR");
  }

  const varsText = body.slice(firstComma + 1).trim();
  const targets = parseTargetList(varsText);
  const record = readChannelRecord(chan);
  const fields = splitTopLevel(record, ",").map((v) => v.trim());

  targets.forEach((targetExpr, idx) => {
    const target = parseAssignTarget(targetExpr, state);
    const raw = fields[idx] ?? "";
    setTargetValue(state, target, convertInputValue(raw, target.name.endsWith("$")));
  });
}

function executeGet(rawBody, state) {
  const targets = parseTargetList(rawBody.trim());
  if (!targets.length) {
    throw new BasicError("SYNTAX ERROR");
  }

  targets.forEach((targetExpr) => {
    const target = parseAssignTarget(targetExpr, state);
    const ch = machine.keyQueue.length ? machine.keyQueue.shift() : "";
    if (target.name.endsWith("$")) {
      setTargetValue(state, target, ch);
    } else {
      setTargetValue(state, target, ch ? ch.charCodeAt(0) : 0);
    }
  });
}

function executeGetHash(stmt, state) {
  const body = stmt.slice(4).trim();
  const firstComma = findTopLevelComma(body);
  if (firstComma < 0) {
    throw new BasicError("SYNTAX ERROR");
  }

  const channelExpr = body.slice(0, firstComma).trim();
  const channel = Math.trunc(Number(evalExpression(channelExpr, state)));
  const chan = machine.channels.get(channel);
  if (!chan) {
    throw new BasicError("FILE NOT OPEN ERROR");
  }

  const targets = parseTargetList(body.slice(firstComma + 1).trim());
  targets.forEach((targetExpr) => {
    const target = parseAssignTarget(targetExpr, state);
    const char = readChannelChar(chan);
    if (target.name.endsWith("$")) {
      setTargetValue(state, target, char);
    } else {
      setTargetValue(state, target, char ? char.charCodeAt(0) : 0);
    }
  });
}

function readChannelRecord(chan) {
  if (chan.inputPos >= chan.buffer.length) {
    machine.status = 64;
    return "";
  }

  let start = chan.inputPos;
  let end = chan.buffer.indexOf("\n", start);
  if (end < 0) {
    end = chan.buffer.length;
  }
  chan.inputPos = end + 1;
  machine.status = chan.inputPos >= chan.buffer.length ? 64 : 0;
  return chan.buffer.slice(start, end);
}

function readChannelChar(chan) {
  if (chan.inputPos >= chan.buffer.length) {
    machine.status = 64;
    return "";
  }
  const char = chan.buffer[chan.inputPos];
  chan.inputPos += 1;
  machine.status = chan.inputPos >= chan.buffer.length ? 64 : 0;
  return char;
}

function convertInputValue(raw, isStringTarget) {
  if (isStringTarget) {
    return stripQuoted(raw);
  }

  const n = Number(raw);
  if (Number.isNaN(n)) {
    throw new BasicError("REDO FROM START");
  }
  return n;
}

function parseTargetList(text) {
  return splitTopLevel(text, ",").map((s) => s.trim()).filter(Boolean);
}

function executeRead(rawBody, state) {
  const targets = parseTargetList(rawBody.trim());
  if (!targets.length) {
    throw new BasicError("SYNTAX ERROR");
  }

  targets.forEach((targetExpr) => {
    if (state.dataPtr >= state.dataItems.length) {
      throw new BasicError("OUT OF DATA ERROR");
    }

    const target = parseAssignTarget(targetExpr, state);
    const item = state.dataItems[state.dataPtr++].value;
    if (target.name.endsWith("$")) {
      setTargetValue(state, target, String(item));
    } else {
      const n = Number(item);
      if (Number.isNaN(n)) {
        throw new BasicError("TYPE MISMATCH ERROR");
      }
      setTargetValue(state, target, n);
    }
  });
}

function executeRestore(rawBody, state) {
  const body = rawBody.trim();
  if (!body) {
    state.dataPtr = 0;
    return;
  }

  const line = Math.trunc(Number(evalExpression(body, state)));
  const idx = state.dataItems.findIndex((item) => item.lineNumber >= line);
  state.dataPtr = idx >= 0 ? idx : state.dataItems.length;
}

function executeDim(rawBody, state) {
  const body = rawBody.trim();
  if (!body) {
    throw new BasicError("SYNTAX ERROR");
  }

  const decls = splitTopLevel(body, ",").map((d) => d.trim()).filter(Boolean);
  const rebuilt = rebuildDimDeclarations(decls);

  rebuilt.forEach((decl) => {
    const match = decl.match(/^([A-Za-z][A-Za-z0-9$]*)\s*\((.*)\)$/);
    if (!match) {
      throw new BasicError("SYNTAX ERROR");
    }

    const name = match[1].toUpperCase();
    const dims = splitTopLevel(match[2], ",").map((expr) => {
      const value = Math.trunc(Number(evalExpression(expr, state)));
      if (value < 0) {
        throw new BasicError("BAD SUBSCRIPT ERROR");
      }
      return value;
    });

    if (state.arrays.has(name)) {
      throw new BasicError("REDIM'D ARRAY ERROR");
    }

    state.arrays.set(name, {
      dims,
      values: new Map(),
      isString: name.endsWith("$"),
    });
  });
}

function rebuildDimDeclarations(parts) {
  const out = [];
  let current = "";
  let depth = 0;

  for (const part of parts) {
    if (current) {
      current += `,${part}`;
    } else {
      current = part;
    }

    for (const ch of part) {
      if (ch === "(") depth += 1;
      if (ch === ")") depth = Math.max(0, depth - 1);
    }

    if (depth === 0) {
      out.push(current);
      current = "";
    }
  }

  if (current) {
    out.push(current);
  }

  return out;
}

function executeDefFn(stmt, state) {
  const match = stmt.match(/^DEF\s+FN([A-Za-z][A-Za-z0-9]*)\s*\(\s*([A-Za-z][A-Za-z0-9$]*)\s*\)\s*=\s*(.+)$/i);
  if (!match) {
    throw new BasicError("SYNTAX ERROR");
  }

  const fnName = `FN${match[1].toUpperCase()}`;
  const param = match[2].toUpperCase();
  const expr = match[3].trim();
  state.userFns.set(fnName, { param, expr });
}

async function executeIf(stmt, state) {
  const parsed = parseIfStatement(stmt);
  const condition = evalExpression(parsed.condition, state);
  const branch = truthy(condition) ? parsed.thenPart : parsed.elsePart;

  if (!branch) {
    return;
  }

  if (/^\d+$/.test(branch.trim())) {
    gotoLine(Number(branch.trim()), state);
    return;
  }

  const statements = splitStatements(branch);
  for (const branchStmt of statements) {
    await executeStatement(branchStmt, state, state.currentLineNumber);
  }
}

function parseIfStatement(stmt) {
  const text = stmt.trim();
  const thenPos = findKeywordTopLevel(text, "THEN");
  if (thenPos < 0) {
    throw new BasicError("IF WITHOUT THEN");
  }

  const condition = text.slice(2, thenPos).trim();
  const right = text.slice(thenPos + 4).trim();
  const elsePos = findKeywordTopLevel(right, "ELSE");

  if (elsePos < 0) {
    return {
      condition,
      thenPart: right,
      elsePart: "",
    };
  }

  return {
    condition,
    thenPart: right.slice(0, elsePos).trim(),
    elsePart: right.slice(elsePos + 4).trim(),
  };
}

function executeOn(stmt, state) {
  const match = stmt.match(/^ON\s+(.+?)\s+(GOTO|GOSUB)\s+(.+)$/i);
  if (!match) {
    throw new BasicError("SYNTAX ERROR");
  }

  const index = Math.trunc(Number(evalExpression(match[1], state)));
  const mode = match[2].toUpperCase();
  const targets = splitTopLevel(match[3], ",").map((t) => t.trim()).filter(Boolean);

  if (index < 1 || index > targets.length) {
    return;
  }

  const targetLine = Math.trunc(Number(evalExpression(targets[index - 1], state)));
  if (mode === "GOSUB") {
    state.gosubStack.push(state.nextPc);
  }
  gotoLine(targetLine, state);
}

function executeFor(stmt, state) {
  const match = stmt.match(/^FOR\s+([A-Za-z][A-Za-z0-9]*)\s*=\s*(.+?)\s+TO\s+(.+?)(?:\s+STEP\s+(.+))?$/i);
  if (!match) {
    throw new BasicError("FOR SYNTAX ERROR");
  }

  const variable = match[1].toUpperCase();
  const start = Number(evalExpression(match[2], state));
  const end = Number(evalExpression(match[3], state));
  const step = match[4] == null ? 1 : Number(evalExpression(match[4], state));

  state.vars.set(variable, start);
  state.forStack.push({
    variable,
    end,
    step,
    loopStartPc: state.nextPc,
  });
}

function executeNext(stmt, state) {
  const body = stmt.slice(4).trim();
  const vars = body ? splitTopLevel(body, ",").map((v) => v.trim().toUpperCase()).filter(Boolean) : [null];

  vars.forEach((name) => executeSingleNext(name, state));
}

function executeSingleNext(name, state) {
  let frameIndex = -1;

  for (let i = state.forStack.length - 1; i >= 0; i -= 1) {
    if (!name || state.forStack[i].variable === name) {
      frameIndex = i;
      break;
    }
  }

  if (frameIndex < 0) {
    throw new BasicError("NEXT WITHOUT FOR");
  }

  const frame = state.forStack[frameIndex];
  const value = Number(state.vars.get(frame.variable) || 0) + frame.step;
  state.vars.set(frame.variable, value);

  if (shouldLoop(value, frame.end, frame.step)) {
    state.nextPc = frame.loopStartPc;
  } else {
    state.forStack.splice(frameIndex, 1);
  }
}

function shouldLoop(value, end, step) {
  return step >= 0 ? value <= end : value >= end;
}

function gotoLine(lineNumber, state) {
  const line = Math.trunc(Number(lineNumber));
  if (!state.indexByLine.has(line)) {
    throw new BasicError("UNDEF'D STATEMENT ERROR");
  }
  state.nextPc = state.indexByLine.get(line);
}

function executePoke(rawBody, state) {
  const args = splitTopLevel(rawBody.trim(), ",");
  if (args.length < 2) {
    throw new BasicError("SYNTAX ERROR");
  }

  const addr = normalizeAddress(evalExpression(args[0], state));
  const value = normalizeByte(evalExpression(args[1], state));
  machine.memory[addr] = value;
}

async function executeWait(rawBody, state) {
  const args = splitTopLevel(rawBody.trim(), ",");
  if (args.length < 2) {
    throw new BasicError("SYNTAX ERROR");
  }

  const addr = normalizeAddress(evalExpression(args[0], state));
  const mask = normalizeByte(evalExpression(args[1], state));
  const value = args[2] != null ? normalizeByte(evalExpression(args[2], state)) : 0;

  while (true) {
    if (machine.stopRequested) {
      throw new ProgramPause(state.currentLineNumber ?? 0, state.currentPc);
    }

    const peek = machine.memory[addr];
    if (((peek ^ value) & mask) !== 0) {
      break;
    }

    await microYield();
  }
}

function parseLeadingSource(args, state, maxSource, minArgsWithoutSource) {
  if (!Array.isArray(args) || args.length <= minArgsWithoutSource) {
    return { source: null, offset: 0 };
  }

  const first = String(args[0] ?? "").trim();
  if (!first) {
    return { source: null, offset: 0 };
  }

  try {
    const source = Math.trunc(Number(evalExpression(first, state)));
    if (Number.isNaN(source) || source < 0 || source > maxSource) {
      return { source: null, offset: 0 };
    }
    return { source, offset: 1 };
  } catch (error) {
    return { source: null, offset: 0 };
  }
}

function evalRequiredArg(args, index, state, errorMessage = "SYNTAX ERROR") {
  const expr = args[index];
  if (expr == null || expr === "") {
    throw new BasicError(errorMessage);
  }
  return evalExpression(expr, state);
}

function evalOptionalArg(args, index, state, fallback) {
  const expr = args[index];
  if (expr == null || expr === "") {
    return fallback;
  }
  return evalExpression(expr, state);
}

function executeGraphic(stmt, state) {
  const body = stmt.slice(7).trim();
  if (!body) {
    throw new BasicError("SYNTAX ERROR");
  }

  if (/^CLR$/i.test(body)) {
    machine.gfx.mode = 0;
    machine.gfx.splitRow = 20;
    applyGraphicModePresentation();
    clearGraphics();
    return;
  }

  const args = parseArgsLoose(body);
  if (!args.length || !args[0] || args.length > 3) {
    throw new BasicError("SYNTAX ERROR");
  }

  const mode = Math.trunc(Number(evalExpression(args[0], state)));
  if (Number.isNaN(mode) || mode < 0 || mode > 5) {
    throw new BasicError("ILLEGAL QUANTITY ERROR");
  }

  let clearFlag = 1;
  if (args[1] != null && args[1] !== "") {
    clearFlag = Math.trunc(Number(evalExpression(args[1], state)));
    if (clearFlag !== 0 && clearFlag !== 1) {
      throw new BasicError("ILLEGAL QUANTITY ERROR");
    }
  }

  let splitRow = machine.gfx.splitRow;
  if (args[2] != null && args[2] !== "") {
    splitRow = normalizeSplitRow(evalExpression(args[2], state));
  } else if (mode === 2 || mode === 4) {
    splitRow = splitRow == null ? 20 : splitRow;
  }

  machine.gfx.mode = mode;
  machine.gfx.splitRow = splitRow;
  applyGraphicModePresentation();
  if (clearFlag === 1) {
    clearGraphics(mode, splitRow);
  }
  scheduleSessionPersist();
}

function executeScnclr(stmt, state) {
  const body = stmt.slice(6).trim();
  let mode = machine.gfx.mode;
  if (body) {
    mode = Math.trunc(Number(evalExpression(body, state)));
    if (Number.isNaN(mode) || mode < 0 || mode > 5) {
      throw new BasicError("ILLEGAL QUANTITY ERROR");
    }
  }

  if (mode === 0 || mode === 5) {
    clearText();
  } else {
    clearGraphics(mode, machine.gfx.splitRow);
  }
}

function executeColor(stmt, state) {
  const body = stmt.slice(5).trim();
  if (!body) {
    throw new BasicError("SYNTAX ERROR");
  }

  const args = parseArgsLoose(body);
  if (args.length === 1) {
    const color = clampColor(evalExpression(args[0], state));
    setTextColor(color);
    return;
  }

  if (args.length !== 2) {
    throw new BasicError("SYNTAX ERROR");
  }

  const source = Math.trunc(Number(evalExpression(args[0], state)));
  if (Number.isNaN(source) || source < 0 || source > 6) {
    throw new BasicError("ILLEGAL QUANTITY ERROR");
  }

  const color = toPaletteColorIndex(evalExpression(args[1], state));
  machine.gfx.colorSources[source] = color;

  if (source === 1 || source === 5) {
    setTextColor(color);
  }

  if (source === 0 || source === 4 || source === 6) {
    applyGraphicModePresentation();
    if (source === 0 || source === 6) {
      clearGraphics();
    }
  }
  scheduleSessionPersist();
}

function executePlot(stmt, state) {
  const args = parseArgs(stmt.slice(4));
  if (args.length < 2) {
    throw new BasicError("PLOT ARGUMENT ERROR");
  }

  const x = evalExpression(args[0], state);
  const y = evalExpression(args[1], state);
  const color = args[2] != null ? clampColor(evalExpression(args[2], state)) : machine.textColor;
  drawPixel(x, y, color);
  setGraphicsCursor(x, y);
}

function executeLine(stmt, state) {
  const args = parseArgs(stmt.slice(4));
  if (args.length < 4) {
    throw new BasicError("LINE ARGUMENT ERROR");
  }

  const x1 = evalExpression(args[0], state);
  const y1 = evalExpression(args[1], state);
  const x2 = evalExpression(args[2], state);
  const y2 = evalExpression(args[3], state);
  const color = args[4] != null ? clampColor(evalExpression(args[4], state)) : machine.textColor;
  drawLine(x1, y1, x2, y2, color);
  setGraphicsCursor(x2, y2);
}

function executeRect(stmt, state) {
  const body = stmt.slice(4).trim();
  const fill = /\bFILL\b/i.test(body);
  const stripped = body.replace(/\bFILL\b/gi, "").trim();
  const args = parseArgs(stripped);
  if (args.length < 4) {
    throw new BasicError("RECT ARGUMENT ERROR");
  }

  const x = evalExpression(args[0], state);
  const y = evalExpression(args[1], state);
  const w = evalExpression(args[2], state);
  const h = evalExpression(args[3], state);
  const color = args[4] != null ? clampColor(evalExpression(args[4], state)) : machine.textColor;
  drawRect(x, y, w, h, color, fill);
  setGraphicsCursor(x + w, y + h);
}

function executeCircle(stmt, state) {
  const body = stmt.slice(6).trim();
  const fill = /\bFILL\b/i.test(body);
  const stripped = body.replace(/\bFILL\b/gi, "").trim();
  const args = parseArgsLoose(stripped);
  if (args.length < 3) {
    throw new BasicError("CIRCLE ARGUMENT ERROR");
  }

  const lead = parseLeadingSource(args, state, 3, 3);
  const source = lead.offset ? lead.source : 1;
  const offset = lead.offset;

  if (offset === 0 && args.length <= 4) {
    const x = evalRequiredArg(args, 0, state, "CIRCLE ARGUMENT ERROR");
    const y = evalRequiredArg(args, 1, state, "CIRCLE ARGUMENT ERROR");
    const r = evalRequiredArg(args, 2, state, "CIRCLE ARGUMENT ERROR");
    const color = args[3] != null && args[3] !== ""
      ? clampColor(evalExpression(args[3], state))
      : machine.textColor;
    drawCircle(x, y, r, color, fill);
    setGraphicsCursor(x + r, y);
    return;
  }

  const x = evalRequiredArg(args, offset + 0, state, "CIRCLE ARGUMENT ERROR");
  const y = evalRequiredArg(args, offset + 1, state, "CIRCLE ARGUMENT ERROR");
  const xr = evalRequiredArg(args, offset + 2, state, "CIRCLE ARGUMENT ERROR");
  const yr = evalOptionalArg(args, offset + 3, state, xr);
  const sa = evalOptionalArg(args, offset + 4, state, 0);
  const ea = evalOptionalArg(args, offset + 5, state, 360);
  const angle = evalOptionalArg(args, offset + 6, state, 0);
  const inc = evalOptionalArg(args, offset + 7, state, 2);
  const color = getColorFromSource(source, 3);

  drawEllipseSegment(x, y, xr, yr, color, sa, ea, angle, inc, fill);
  setGraphicsCursor(x + xr, y);
}

function executeDraw(stmt, state) {
  const body = stmt.slice(4).trim();
  if (!body) {
    throw new BasicError("DRAW ARGUMENT ERROR");
  }

  const segments = splitByKeywordTopLevel(body, "TO").map((part) => part.trim()).filter(Boolean);
  if (!segments.length) {
    throw new BasicError("DRAW ARGUMENT ERROR");
  }

  const firstArgs = parseArgsLoose(segments[0]);
  const lead = parseLeadingSource(firstArgs, state, 3, 2);
  const source = lead.offset ? lead.source : 1;
  const color = getColorFromSource(source, 3);
  const offset = lead.offset;

  if (firstArgs.length - offset !== 2) {
    throw new BasicError("DRAW ARGUMENT ERROR");
  }

  let x = evalRequiredArg(firstArgs, offset + 0, state, "DRAW ARGUMENT ERROR");
  let y = evalRequiredArg(firstArgs, offset + 1, state, "DRAW ARGUMENT ERROR");

  if (segments.length === 1) {
    drawPixel(x, y, color);
    setGraphicsCursor(x, y);
    return;
  }

  for (let i = 1; i < segments.length; i += 1) {
    const args = parseArgsLoose(segments[i]);
    if (args.length !== 2) {
      throw new BasicError("DRAW ARGUMENT ERROR");
    }
    const nx = evalRequiredArg(args, 0, state, "DRAW ARGUMENT ERROR");
    const ny = evalRequiredArg(args, 1, state, "DRAW ARGUMENT ERROR");
    drawLine(x, y, nx, ny, color);
    x = nx;
    y = ny;
  }

  setGraphicsCursor(x, y);
}

function executeBox(stmt, state) {
  const args = parseArgsLoose(stmt.slice(3).trim());
  if (args.length < 2) {
    throw new BasicError("BOX ARGUMENT ERROR");
  }

  const lead = parseLeadingSource(args, state, 3, 2);
  const source = lead.offset ? lead.source : 1;
  const offset = lead.offset;
  if (args.length - offset < 2) {
    throw new BasicError("BOX ARGUMENT ERROR");
  }

  const x1 = evalRequiredArg(args, offset + 0, state, "BOX ARGUMENT ERROR");
  const y1 = evalRequiredArg(args, offset + 1, state, "BOX ARGUMENT ERROR");
  const x2 = evalOptionalArg(args, offset + 2, state, machine.gfx.cursorX);
  const y2 = evalOptionalArg(args, offset + 3, state, machine.gfx.cursorY);
  const angle = evalOptionalArg(args, offset + 4, state, 0);
  const paint = evalOptionalArg(args, offset + 5, state, 0);
  const fill = Number(paint) !== 0;
  const color = getColorFromSource(source, 3);

  drawRotatedRect(x1, y1, x2, y2, color, angle, fill);
  setGraphicsCursor(x2, y2);
}

function executePaint(stmt, state) {
  const args = parseArgsLoose(stmt.slice(5).trim());
  if (args.length < 2) {
    throw new BasicError("PAINT ARGUMENT ERROR");
  }

  const lead = parseLeadingSource(args, state, 3, 2);
  const source = lead.offset ? lead.source : 1;
  const offset = lead.offset;
  if (args.length - offset < 2) {
    throw new BasicError("PAINT ARGUMENT ERROR");
  }

  const x = Math.trunc(Number(evalRequiredArg(args, offset + 0, state, "PAINT ARGUMENT ERROR")));
  const y = Math.trunc(Number(evalRequiredArg(args, offset + 1, state, "PAINT ARGUMENT ERROR")));
  const mode = Math.trunc(Number(evalOptionalArg(args, offset + 2, state, 0)));
  if (mode !== 0 && mode !== 1) {
    throw new BasicError("ILLEGAL QUANTITY ERROR");
  }

  const color = getColorFromSource(source, 3);
  floodFill(x, y, color, mode);
  setGraphicsCursor(x, y);
}

function executeOpen(stmt, state) {
  const body = stmt.slice(4).trim();
  const args = splitTopLevel(body, ",").map((p) => p.trim());
  if (args.length < 2) {
    throw new BasicError("SYNTAX ERROR");
  }

  const channel = Math.trunc(Number(evalExpression(args[0], state || createExecutionState([]))));
  const device = Math.trunc(Number(evalExpression(args[1], state || createExecutionState([]))));
  const secondary = args[2] != null ? Math.trunc(Number(evalExpression(args[2], state || createExecutionState([])))) : 0;
  const command = args[3] != null ? stripQuoted(args[3]) : "";

  machine.channels.set(channel, {
    device,
    secondary,
    command,
    buffer: "",
    inputPos: 0,
  });
  machine.status = 0;
}

function executeClose(stmt, state) {
  const body = stmt.slice(5).trim();
  if (!body) {
    throw new BasicError("SYNTAX ERROR");
  }
  const channel = Math.trunc(Number(evalExpression(body, state || createExecutionState([]))));
  machine.channels.delete(channel);
  if (machine.cmdChannel === channel) {
    machine.cmdChannel = null;
  }
  if (state && state.cmdChannel === channel) {
    state.cmdChannel = null;
  }
  machine.status = 0;
}

function executeCmd(stmt, state) {
  const body = stmt.slice(3).trim();
  if (!body) {
    machine.cmdChannel = null;
    if (state) state.cmdChannel = null;
    return;
  }

  const channel = Math.trunc(Number(evalExpression(body, state || createExecutionState([]))));
  if (!machine.channels.has(channel)) {
    throw new BasicError("FILE NOT OPEN ERROR");
  }

  machine.cmdChannel = channel;
  if (state) {
    state.cmdChannel = channel;
  }
}

function executeSys(stmt, state) {
  const body = stmt.slice(3).trim();
  if (!body) {
    throw new BasicError("SYNTAX ERROR");
  }

  const args = splitTopLevel(body, ",");
  const pc = normalizeAddress(evalExpression(args[0], state || createExecutionState([])));
  const a = args[1] != null ? normalizeByte(evalExpression(args[1], state || createExecutionState([]))) : machine.cpu.a;
  const x = args[2] != null ? normalizeByte(evalExpression(args[2], state || createExecutionState([]))) : machine.cpu.x;
  const y = args[3] != null ? normalizeByte(evalExpression(args[3], state || createExecutionState([]))) : machine.cpu.y;

  machine.cpu = { pc, a, x, y };
  machine.status = 0;
}

function executeAssignment(stmt, state) {
  const text = stmt.replace(/^LET\s+/i, "");
  const eqPos = findTopLevelEquals(text);
  if (eqPos < 0) {
    return false;
  }

  const left = text.slice(0, eqPos).trim();
  const right = text.slice(eqPos + 1).trim();
  if (!left || !right) {
    throw new BasicError("SYNTAX ERROR");
  }

  const target = parseAssignTarget(left, state);
  const value = evalExpression(right, state);
  setTargetValue(state, target, value);
  return true;
}

function parseAssignTarget(expr, state) {
  const text = expr.trim();
  const match = text.match(/^([A-Za-z][A-Za-z0-9$]*)(?:\((.*)\))?$/);
  if (!match) {
    throw new BasicError("SYNTAX ERROR");
  }

  const name = match[1].toUpperCase();
  let indices = null;
  if (match[2] != null) {
    indices = splitTopLevel(match[2], ",").map((idxExpr) => Math.trunc(Number(evalExpression(idxExpr, state))));
  }

  return { name, indices };
}

function setTargetValue(state, target, value) {
  const { name, indices } = target;

  if (name === "TI") {
    setTiValue(Number(value));
    return;
  }

  if (name === "TI$") {
    setTiString(String(value));
    return;
  }

  if (name === "ST") {
    machine.status = normalizeByte(value);
    return;
  }

  if (indices && indices.length) {
    setArrayValue(state, name, indices, value);
    return;
  }

  if (name.endsWith("$")) {
    state.vars.set(name, String(value));
  } else {
    state.vars.set(name, Number(value));
  }
}

function setArrayValue(state, name, indices, value) {
  const arr = ensureArray(state, name, indices.length, true);
  const key = arrayIndexKey(arr, indices);
  const stored = arr.isString ? String(value) : Number(value);
  arr.values.set(key, stored);
}

function getArrayValue(state, name, indices) {
  const arr = ensureArray(state, name, indices.length, false);
  const key = arrayIndexKey(arr, indices);
  if (!arr.values.has(key)) {
    return arr.isString ? "" : 0;
  }
  return arr.values.get(key);
}

function ensureArray(state, name, dimensions, forWrite) {
  let arr = state.arrays.get(name);
  if (!arr) {
    const dims = new Array(Math.max(1, dimensions)).fill(DEFAULT_ARRAY_BOUND);
    arr = {
      dims,
      values: new Map(),
      isString: name.endsWith("$"),
    };
    state.arrays.set(name, arr);
  }

  if (arr.dims.length !== dimensions) {
    throw new BasicError("BAD SUBSCRIPT ERROR");
  }

  if (forWrite && arr.isString !== name.endsWith("$")) {
    throw new BasicError("TYPE MISMATCH ERROR");
  }

  return arr;
}

function arrayIndexKey(arr, indices) {
  if (indices.length !== arr.dims.length) {
    throw new BasicError("BAD SUBSCRIPT ERROR");
  }

  const ints = indices.map((value, idx) => {
    const v = Math.trunc(Number(value));
    if (Number.isNaN(v) || v < 0 || v > arr.dims[idx]) {
      throw new BasicError("BAD SUBSCRIPT ERROR");
    }
    return v;
  });

  return ints.join(",");
}

function evalExpression(source, state) {
  const tokens = tokenize(source);
  const parser = new ExpressionParser(tokens, state);
  return parser.parse();
}

function tokenize(source) {
  const tokens = [];
  let i = 0;

  while (i < source.length) {
    const ch = source[i];

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    if (ch === '"') {
      let j = i + 1;
      let value = "";
      while (j < source.length && source[j] !== '"') {
        value += source[j];
        j += 1;
      }
      if (j >= source.length) {
        throw new BasicError("SYNTAX ERROR");
      }
      tokens.push({ type: "string", value });
      i = j + 1;
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < source.length && /[0-9.]/.test(source[j])) {
        j += 1;
      }
      const n = Number(source.slice(i, j));
      if (Number.isNaN(n)) {
        throw new BasicError("SYNTAX ERROR");
      }
      tokens.push({ type: "number", value: n });
      i = j;
      continue;
    }

    if (/[A-Za-z]/.test(ch)) {
      let j = i;
      while (j < source.length && /[A-Za-z0-9$]/.test(source[j])) {
        j += 1;
      }
      tokens.push({ type: "ident", value: source.slice(i, j).toUpperCase() });
      i = j;
      continue;
    }

    const two = source.slice(i, i + 2);
    if (["<=", ">=", "<>"].includes(two)) {
      tokens.push({ type: "op", value: two });
      i += 2;
      continue;
    }

    if ("+-*/^()=<>,".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i += 1;
      continue;
    }

    throw new BasicError("SYNTAX ERROR");
  }

  tokens.push({ type: "eof", value: "EOF" });
  return tokens;
}

class ExpressionParser {
  constructor(tokens, state) {
    this.tokens = tokens;
    this.state = state;
    this.pos = 0;
  }

  parse() {
    const value = this.parseOr();
    this.expect("eof");
    return value;
  }

  parseOr() {
    let left = this.parseAnd();
    while (this.matchIdent("OR")) {
      const right = this.parseAnd();
      left = toInt(left) | toInt(right);
    }
    return left;
  }

  parseAnd() {
    let left = this.parseNot();
    while (this.matchIdent("AND")) {
      const right = this.parseNot();
      left = toInt(left) & toInt(right);
    }
    return left;
  }

  parseNot() {
    if (this.matchIdent("NOT")) {
      return ~toInt(this.parseNot());
    }
    return this.parseComparison();
  }

  parseComparison() {
    let left = this.parseAddSub();
    while (this.matchOp("=", "<>", "<", ">", "<=", ">=")) {
      const op = this.prev().value;
      const right = this.parseAddSub();
      left = compareValues(left, right, op) ? -1 : 0;
    }
    return left;
  }

  parseAddSub() {
    let left = this.parseMulDiv();
    while (this.matchOp("+", "-")) {
      const op = this.prev().value;
      const right = this.parseMulDiv();
      if (op === "+") {
        if (typeof left === "string" || typeof right === "string") {
          left = `${left}${right}`;
        } else {
          left = Number(left) + Number(right);
        }
      } else {
        left = Number(left) - Number(right);
      }
    }
    return left;
  }

  parseMulDiv() {
    let left = this.parsePower();
    while (this.matchOp("*", "/")) {
      const op = this.prev().value;
      const right = this.parsePower();
      if (op === "*") {
        left = Number(left) * Number(right);
      } else {
        if (Number(right) === 0) {
          throw new BasicError("DIVISION BY ZERO ERROR");
        }
        left = Number(left) / Number(right);
      }
    }
    return left;
  }

  parsePower() {
    let left = this.parseUnary();
    while (this.matchOp("^")) {
      const right = this.parseUnary();
      left = Number(left) ** Number(right);
    }
    return left;
  }

  parseUnary() {
    if (this.matchOp("-")) {
      return -Number(this.parseUnary());
    }
    if (this.matchOp("+")) {
      return Number(this.parseUnary());
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    if (this.match("number")) {
      return this.prev().value;
    }

    if (this.match("string")) {
      return this.prev().value;
    }

    if (this.match("ident")) {
      const ident = this.prev().value;

      if (this.matchOp("(")) {
        const args = [];
        if (!this.checkOp(")")) {
          do {
            args.push(this.parseOr());
          } while (this.matchOp(","));
        }
        this.consumeOp(")");

        if (isBuiltinFunction(ident)) {
          return callBuiltinFunction(ident, args, this.state);
        }

        if (ident.startsWith("FN")) {
          return callUserFunction(ident, args, this.state);
        }

        return getArrayValue(this.state, ident, args);
      }

      return getIdentifierValue(ident, this.state);
    }

    if (this.matchOp("(")) {
      const value = this.parseOr();
      this.consumeOp(")");
      return value;
    }

    throw new BasicError("SYNTAX ERROR");
  }

  match(type) {
    if (this.peek().type === type) {
      this.pos += 1;
      return true;
    }
    return false;
  }

  expect(type) {
    if (!this.match(type)) {
      throw new BasicError("SYNTAX ERROR");
    }
  }

  matchOp(...ops) {
    const token = this.peek();
    if (token.type === "op" && ops.includes(token.value)) {
      this.pos += 1;
      return true;
    }
    return false;
  }

  matchIdent(name) {
    const token = this.peek();
    if (token.type === "ident" && token.value === name) {
      this.pos += 1;
      return true;
    }
    return false;
  }

  consumeOp(op) {
    if (!this.matchOp(op)) {
      throw new BasicError("SYNTAX ERROR");
    }
  }

  checkOp(op) {
    const token = this.peek();
    return token.type === "op" && token.value === op;
  }

  peek() {
    return this.tokens[this.pos];
  }

  prev() {
    return this.tokens[this.pos - 1];
  }
}

function getIdentifierValue(ident, state) {
  if (ident === "TI") {
    return getTiValue();
  }
  if (ident === "TI$") {
    return getTiString();
  }
  if (ident === "ST") {
    return machine.status;
  }
  return state.vars.get(ident) ?? (ident.endsWith("$") ? "" : 0);
}

function isBuiltinFunction(name) {
  return BUILTIN_FUNCTIONS.has(name);
}

const BUILTIN_FUNCTIONS = new Set([
  "SGN",
  "INT",
  "ABS",
  "USR",
  "FRE",
  "POS",
  "SQR",
  "RND",
  "LOG",
  "EXP",
  "COS",
  "SIN",
  "TAN",
  "ATN",
  "PEEK",
  "LEN",
  "VAL",
  "ASC",
  "STR$",
  "CHR$",
  "LEFT$",
  "RIGHT$",
  "MID$",
]);

function callBuiltinFunction(name, args, state) {
  switch (name) {
    case "SGN": {
      const x = Number(args[0] ?? 0);
      if (x === 0) return 0;
      return x > 0 ? 1 : -1;
    }
    case "INT":
      return Math.floor(Number(args[0] ?? 0));
    case "ABS":
      return Math.abs(Number(args[0] ?? 0));
    case "USR":
      return Number(args[0] ?? 0);
    case "FRE":
      return estimateFreeMemory(state);
    case "POS":
      return getCursorColumn();
    case "SQR":
      return Math.sqrt(Number(args[0] ?? 0));
    case "RND":
      return basicRnd(Number(args[0] ?? 1));
    case "LOG":
      return Math.log(Number(args[0] ?? 1));
    case "EXP":
      return Math.exp(Number(args[0] ?? 0));
    case "COS":
      return Math.cos(Number(args[0] ?? 0));
    case "SIN":
      return Math.sin(Number(args[0] ?? 0));
    case "TAN":
      return Math.tan(Number(args[0] ?? 0));
    case "ATN":
      return Math.atan(Number(args[0] ?? 0));
    case "PEEK":
      return machine.memory[normalizeAddress(args[0] ?? 0)];
    case "LEN":
      return String(args[0] ?? "").length;
    case "VAL": {
      const n = Number(String(args[0] ?? "").trim());
      return Number.isNaN(n) ? 0 : n;
    }
    case "ASC": {
      const s = String(args[0] ?? "");
      if (!s.length) {
        throw new BasicError("ILLEGAL QUANTITY ERROR");
      }
      return s.charCodeAt(0);
    }
    case "STR$": {
      const n = Number(args[0] ?? 0);
      return n >= 0 ? ` ${n}` : `${n}`;
    }
    case "CHR$":
      return String.fromCharCode(normalizeByte(args[0] ?? 0));
    case "LEFT$": {
      const s = String(args[0] ?? "");
      const n = Math.max(0, Math.trunc(Number(args[1] ?? 0)));
      return s.slice(0, n);
    }
    case "RIGHT$": {
      const s = String(args[0] ?? "");
      const n = Math.max(0, Math.trunc(Number(args[1] ?? 0)));
      return n === 0 ? "" : s.slice(-n);
    }
    case "MID$": {
      const s = String(args[0] ?? "");
      const start = Math.max(1, Math.trunc(Number(args[1] ?? 1))) - 1;
      if (args[2] == null) {
        return s.slice(start);
      }
      const len = Math.max(0, Math.trunc(Number(args[2])));
      return s.slice(start, start + len);
    }
    default:
      throw new BasicError("FUNCTION ERROR");
  }
}

function callUserFunction(name, args, state) {
  const fn = state.userFns.get(name);
  if (!fn) {
    throw new BasicError("UNDEF'D FUNCTION ERROR");
  }

  const had = state.vars.has(fn.param);
  const old = state.vars.get(fn.param);
  state.vars.set(fn.param, args[0] ?? 0);

  try {
    return evalExpression(fn.expr, state);
  } finally {
    if (had) {
      state.vars.set(fn.param, old);
    } else {
      state.vars.delete(fn.param);
    }
  }
}

function basicRnd(arg) {
  if (arg < 0) {
    machine.rndSeed = Math.abs(Math.trunc(arg)) || 1;
  }

  if (arg === 0) {
    return machine.lastRnd;
  }

  if (machine.rndSeed != null) {
    machine.rndSeed = (machine.rndSeed * 1103515245 + 12345) & 0x7fffffff;
    machine.lastRnd = machine.rndSeed / 0x80000000;
  } else {
    machine.lastRnd = Math.random();
  }

  return machine.lastRnd;
}

function estimateFreeMemory(state) {
  const lines = getSortedProgramLines();
  const programBytes = lines.reduce((sum, [line, text]) => sum + String(line).length + text.length + 3, 0);
  const varBytes = state.vars.size * 8 + state.arrays.size * 32;
  return Math.max(0, 38911 - programBytes - varBytes);
}

function getCursorColumn() {
  const wrapped = wrapForC64(`${terminal.text}${terminal.input}`);
  const last = wrapped.length ? wrapped[wrapped.length - 1] : "";
  return last.length;
}

function getTiValue() {
  const elapsed = Math.floor(((Date.now() - machine.tiRefMs) * 60) / 1000);
  return machine.tiRefJiffies + elapsed;
}

function setTiValue(value) {
  machine.tiRefJiffies = Math.max(0, Math.trunc(Number(value) || 0));
  machine.tiRefMs = Date.now();
}

function getTiString() {
  const totalSeconds = Math.floor(getTiValue() / 60) % 86400;
  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${hh}${mm}${ss}`;
}

function setTiString(text) {
  const t = String(text).replace(/[^0-9]/g, "");
  if (t.length !== 6) {
    throw new BasicError("ILLEGAL QUANTITY ERROR");
  }
  const hh = Number(t.slice(0, 2));
  const mm = Number(t.slice(2, 4));
  const ss = Number(t.slice(4, 6));
  if (hh > 23 || mm > 59 || ss > 59) {
    throw new BasicError("ILLEGAL QUANTITY ERROR");
  }
  setTiValue((hh * 3600 + mm * 60 + ss) * 60);
}

function sanitizeProgramLines(lines) {
  if (!Array.isArray(lines)) {
    return [];
  }

  const temp = new Map();
  lines.forEach((entry) => {
    if (!Array.isArray(entry) || entry.length < 2) {
      return;
    }
    const lineNumber = Math.max(0, Math.trunc(Number(entry[0]) || 0));
    const text = String(entry[1] ?? "");
    if (!text.trim()) {
      temp.delete(lineNumber);
    } else {
      temp.set(lineNumber, text);
    }
  });

  return Array.from(temp.entries()).sort((a, b) => a[0] - b[0]);
}

function loadProgramIntoMachine(lines, options = {}) {
  const cleanLines = sanitizeProgramLines(lines);
  machine.program.clear();
  cleanLines.forEach(([lineNumber, text]) => {
    machine.program.set(Number(lineNumber), String(text));
  });

  machine.programVersion += 1;
  machine.continuation = null;
  machine.programmingMode = options.programmingMode == null ? true : Boolean(options.programmingMode);
  clearProgramEditCursor();
  resetInputLine();
  scheduleSessionPersist();
  return cleanLines;
}

function saveProgramSnapshot(name, lines, options = {}) {
  const normalizedName = normalizeProgramName(name);
  const cleanLines = sanitizeProgramLines(lines);
  const key = `${STORAGE_PREFIX}${normalizedName}`;
  const data = {
    name: normalizedName,
    version: 1,
    savedAt: new Date().toISOString(),
    device: options.device ?? DEFAULT_DEVICE,
    source: options.source || "user",
    lines: cleanLines,
  };

  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem(STORAGE_LAST, normalizedName);
  return normalizedName;
}

function installTestPack() {
  const installed = [];

  TEST_PACK_PROGRAMS.forEach((program) => {
    const savedName = saveProgramSnapshot(program.name, program.lines, {
      device: DEFAULT_DEVICE,
      source: "testpack",
    });
    installed.push({
      name: savedName,
      description: String(program.description || "").replace(/"/g, "'"),
    });
  });

  const indexLines = [
    [10, "REM TESTPACK INDEX - AUTO GENERATED"],
    [20, 'PRINT "TESTPACK PROGRAMS:"'],
  ];

  let lineNo = 30;
  installed.forEach((item) => {
    indexLines.push([lineNo, `PRINT "${item.name} - ${item.description}"`]);
    lineNo += 10;
  });
  indexLines.push([lineNo, 'PRINT "LOAD \\"TP01-BASIC\\",8"']);
  lineNo += 10;
  indexLines.push([lineNo, "END"]);

  const indexName = saveProgramSnapshot(TESTPACK_INDEX_NAME, indexLines, {
    device: DEFAULT_DEVICE,
    source: "testpack",
  });

  screenWriteLine(`TESTPACK INSTALLED: ${installed.length + 1} PROGRAMS`);
  screenWriteLine(`TIP: LOAD "${indexName}",8`);
  screenWriteLine('TIP: LOAD "TP01-BASIC",8');
}

function executeSave(command) {
  const args = parseFileCommand(command, "SAVE");
  const name = saveProgramSnapshot(args.name, getSortedProgramLines(), {
    device: args.device ?? DEFAULT_DEVICE,
    source: "user",
  });
  screenWriteLine(`SAVED "${name}"`);
}

function executeLoad(command) {
  const args = parseFileCommand(command, "LOAD");
  let name = args.name;

  if (name === "*") {
    name = localStorage.getItem(STORAGE_LAST) || "";
  }

  if (!name) {
    throw new BasicError("FILE NOT FOUND ERROR");
  }

  const normalized = normalizeProgramName(name);
  const key = `${STORAGE_PREFIX}${normalized}`;
  const raw = localStorage.getItem(key);
  if (!raw) {
    throw new BasicError("FILE NOT FOUND ERROR");
  }

  const parsed = JSON.parse(raw);
  const lines = Array.isArray(parsed.lines) ? parsed.lines : [];
  loadProgramIntoMachine(lines, { programmingMode: true });
  localStorage.setItem(STORAGE_LAST, normalized);

  screenWriteLine(`LOADED "${normalized}"`);
}

function executeVerify(command) {
  const args = parseFileCommand(command, "VERIFY");
  let name = args.name;

  if (name === "*") {
    name = localStorage.getItem(STORAGE_LAST) || "";
  }

  if (!name) {
    throw new BasicError("FILE NOT FOUND ERROR");
  }

  const normalized = normalizeProgramName(name);
  const key = `${STORAGE_PREFIX}${normalized}`;
  const raw = localStorage.getItem(key);
  if (!raw) {
    throw new BasicError("FILE NOT FOUND ERROR");
  }

  const parsed = JSON.parse(raw);
  const current = JSON.stringify(getSortedProgramLines());
  const saved = JSON.stringify(Array.isArray(parsed.lines) ? parsed.lines : []);

  if (current === saved) {
    screenWriteLine("VERIFY OK");
  } else {
    throw new BasicError("VERIFY ERROR");
  }
}

function parseFileCommand(command, keyword) {
  const body = command.trim().slice(keyword.length).trim();
  const quoted = body.match(/^"([^"]*)"\s*(.*)$/);
  if (!quoted) {
    throw new BasicError("SYNTAX ERROR");
  }

  const name = quoted[1].trim();
  const rest = quoted[2].trim();
  let device = null;
  let mode = null;

  if (rest) {
    const list = splitTopLevel(rest.replace(/^,/, ""), ",").map((v) => v.trim());
    if (list[0]) {
      device = Number(list[0]);
    }
    if (list[1]) {
      mode = Number(list[1]);
    }
  }

  return { name, device, mode };
}

function normalizeProgramName(name) {
  const cleaned = String(name || "").trim().toUpperCase();
  if (!cleaned) {
    throw new BasicError("SYNTAX ERROR");
  }
  return cleaned;
}

function parseDataItems(text) {
  const parts = splitTopLevel(text, ",");
  return parts.map((part) => {
    const trimmed = part.trim();
    if (!trimmed) {
      return "";
    }
    if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
      return trimmed.slice(1, -1);
    }
    const n = Number(trimmed);
    if (!Number.isNaN(n)) {
      return n;
    }
    return trimmed;
  });
}

function parseArgs(text) {
  return splitTopLevel(text, ",").map((v) => v.trim()).filter(Boolean);
}

function parseArgsLoose(text) {
  return splitTopLevel(text, ",").map((v) => v.trim());
}

function splitByKeywordTopLevel(text, keyword) {
  const out = [];
  const up = text.toUpperCase();
  const token = keyword.toUpperCase();
  let inString = false;
  let depth = 0;
  let start = 0;

  for (let i = 0; i <= text.length - token.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) {
      continue;
    }

    if (ch === "(") {
      depth += 1;
      continue;
    }
    if (ch === ")") {
      depth = Math.max(0, depth - 1);
      continue;
    }

    if (depth === 0 && up.slice(i, i + token.length) === token) {
      const prev = i > 0 ? up[i - 1] : " ";
      const next = i + token.length < up.length ? up[i + token.length] : " ";
      if (!/[A-Z0-9$]/.test(prev) && !/[A-Z0-9$]/.test(next)) {
        out.push(text.slice(start, i));
        start = i + token.length;
        i += token.length - 1;
      }
    }
  }

  out.push(text.slice(start));
  return out;
}

function splitTopLevel(text, delimiter) {
  const parts = [];
  let current = "";
  let inString = false;
  let depth = 0;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (ch === '"') {
      inString = !inString;
      current += ch;
      continue;
    }

    if (!inString) {
      if (ch === "(") depth += 1;
      if (ch === ")") depth = Math.max(0, depth - 1);
      if (ch === delimiter && depth === 0) {
        parts.push(current);
        current = "";
        continue;
      }
    }

    current += ch;
  }

  parts.push(current);
  return parts;
}

function findKeywordTopLevel(text, keyword) {
  const up = text.toUpperCase();
  let inString = false;
  let depth = 0;

  for (let i = 0; i <= up.length - keyword.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      inString = !inString;
    }
    if (inString) continue;

    if (ch === "(") depth += 1;
    if (ch === ")") depth = Math.max(0, depth - 1);

    if (depth === 0 && up.slice(i, i + keyword.length) === keyword) {
      const prev = i > 0 ? up[i - 1] : " ";
      const next = i + keyword.length < up.length ? up[i + keyword.length] : " ";
      if (!/[A-Z0-9$]/.test(prev) && !/[A-Z0-9$]/.test(next)) {
        return i;
      }
    }
  }

  return -1;
}

function findTopLevelEquals(text) {
  let inString = false;
  let depth = 0;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === "(") depth += 1;
      if (ch === ")") depth = Math.max(0, depth - 1);
      if (depth === 0 && ch === "=") {
        return i;
      }
    }
  }

  return -1;
}

function findTopLevelComma(text) {
  let inString = false;
  let depth = 0;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === "(") depth += 1;
      if (ch === ")") depth = Math.max(0, depth - 1);
      if (depth === 0 && ch === ",") {
        return i;
      }
    }
  }

  return -1;
}

function normalizeByte(value) {
  const n = Math.trunc(Number(value) || 0);
  return ((n % 256) + 256) % 256;
}

function normalizeAddress(value) {
  const n = Math.trunc(Number(value) || 0);
  return ((n % 65536) + 65536) % 65536;
}

function stripQuoted(value) {
  const trimmed = String(value).trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function toInt(value) {
  return Math.trunc(Number(value) || 0);
}

function compareValues(left, right, op) {
  if (typeof left === "string" || typeof right === "string") {
    const a = String(left);
    const b = String(right);
    switch (op) {
      case "=":
        return a === b;
      case "<>":
        return a !== b;
      case "<":
        return a < b;
      case ">":
        return a > b;
      case "<=":
        return a <= b;
      case ">=":
        return a >= b;
      default:
        return false;
    }
  }

  const a = Number(left);
  const b = Number(right);
  switch (op) {
    case "=":
      return a === b;
    case "<>":
      return a !== b;
    case "<":
      return a < b;
    case ">":
      return a > b;
    case "<=":
      return a <= b;
    case ">=":
      return a >= b;
    default:
      return false;
  }
}

function formatValue(value) {
  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return ` ${value}`;
    }
    return ` ${String(Number(value.toFixed(6)))}`;
  }
  return String(value);
}

function truthy(value) {
  if (typeof value === "string") {
    return value.length > 0;
  }
  return Number(value) !== 0;
}

function toBasicMessage(error) {
  if (!error) {
    return "ERROR";
  }
  if (error instanceof BasicError || error instanceof ProgramPause) {
    return error.message;
  }
  if (typeof error.message === "string" && error.message) {
    return error.message;
  }
  return "ERROR";
}

function showFatalInitError(error) {
  const message = error?.message ? String(error.message) : "UNKNOWN ERROR";
  const fallback = `FATAL INIT ERROR: ${message}`;
  if (screenTextEl) {
    screenTextEl.textContent = fallback;
  } else if (document?.body) {
    document.body.textContent = fallback;
  }
}

try {
  setTextColor(machine.textColor);
  boot();
} catch (error) {
  console.error(error);
  showFatalInitError(error);
}
