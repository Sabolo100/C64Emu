const fs = require("fs");
const path = require("path");
const OPENAI_API_URL = "https://api.openai.com/v1/responses";

const ALLOWED_STATEMENT_SYNTAX = [
  'REM szoveg',
  'DATA ertek[,ertek...]',
  'END',
  'STOP',
  'CLR',
  'CLS',
  'CLSG',
  'COLOR szin',
  'COLOR source,color',
  'GRAPHIC mode[,c][,s] | GRAPHIC CLR',
  'SCNCLR [mode]',
  'PRINT expr[;|, ...] | ? expr',
  'PRINT# csatorna[,expr][;|, ...]',
  'INPUT ["prompt";]valtozo[,valtozo...]',
  'INPUT# csatorna,valtozo[,valtozo...]',
  'GET valtozo[,valtozo...]',
  'GET# csatorna,valtozo[,valtozo...]',
  'READ valtozo[,valtozo...]',
  'RESTORE [sorszam]',
  'DIM TOMB(m1[,m2...])',
  'DEF FNnev(param)=kifejezes',
  'IF feltetel THEN utasitas|sorszam [ELSE utasitas|sorszam]',
  'ON index GOTO s1[,s2...]',
  'ON index GOSUB s1[,s2...]',
  'FOR V=kezdo TO veg [STEP lepes]',
  'NEXT [V[,V2...]]',
  'GOTO sorszam',
  'GOSUB sorszam',
  'RETURN',
  'POKE cim,ertek',
  'WAIT cim,maszk[,ertek]',
  'PLOT x,y[,szin]',
  'LINE x1,y1,x2,y2[,szin]',
  'RECT x,y,szel,mag[,szin] [FILL]',
  'CIRCLE x,y,r[,szin] [FILL]',
  'CIRCLE [source],x,y,xr[,yr][,sa][,ea][,angle][,inc]',
  'DRAW [source],x1,y1 [TO x2,y2] ...',
  'BOX [source],x1,y1[,x2,y2][,angle][,paint]',
  'PAINT [source],x,y[,mode]',
  'OPEN csatorna,eszkoz[,masodlagos][,"parancs"]',
  'CLOSE csatorna',
  'CMD [csatorna]',
  'SYS cim[,A][,X][,Y]',
  'LET valtozo = kifejezes',
  'valtozo = kifejezes',
];

const ALLOWED_FUNCTIONS = [
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
  "TI",
  "TI$",
  "ST",
];

const IMMEDIATE_ONLY_COMMANDS = [
  "LIST [kezdo[-zaro]]",
  "RUN [sorszam]",
  "NEW",
  "CONT",
  'SAVE "nev"[,eszkoz]',
  'LOAD "nev"[,eszkoz][,mod]',
  'VERIFY "nev"[,eszkoz]',
  "HELP",
  "TESTPACK",
];

const EXACT_STATEMENTS = new Set([
  "END",
  "STOP",
  "CLS",
  "CLSG",
  "CLR",
  "RETURN",
]);

const PREFIX_STATEMENTS = [
  "REM",
  "DATA",
  "COLOR",
  "GRAPHIC",
  "SCNCLR",
  "PRINT#",
  "PRINT",
  "INPUT#",
  "INPUT",
  "GET#",
  "GET",
  "READ",
  "RESTORE",
  "DIM",
  "DEF FN",
  "IF",
  "ON",
  "FOR",
  "NEXT",
  "GOTO",
  "GOSUB",
  "RETURN",
  "POKE",
  "WAIT",
  "PLOT",
  "LINE",
  "RECT",
  "CIRCLE",
  "DRAW",
  "BOX",
  "PAINT",
  "OPEN",
  "CLOSE",
  "CMD",
  "SYS",
  "LET",
];

function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

function parseDotEnv(text) {
  const out = {};
  String(text || "")
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) return;
      let value = match[2] || "";
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      out[match[1]] = value;
    });
  return out;
}

function readLocalEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  try {
    if (fs.existsSync(envPath)) {
      const raw = fs.readFileSync(envPath, "utf8");
      return parseDotEnv(raw);
    }
  } catch (error) {
    return {};
  }

  return {};
}

function getRuntimeConfig() {
  const localFile = readLocalEnvFile();
  const apiKey = process.env.OPENAI_API_KEY || localFile.OPENAI_API_KEY || "";
  const model = process.env.OPENAI_MODEL || localFile.OPENAI_MODEL || "gpt-4.1-mini";
  const source = process.env.OPENAI_API_KEY ? "process.env" : localFile.OPENAI_API_KEY ? ".env.local" : "none";
  return { apiKey, model, source };
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch (error) {
      return {};
    }
  }
  return {};
}

function extractResponseText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  if (Array.isArray(payload?.output)) {
    const parts = [];
    payload.output.forEach((item) => {
      if (!Array.isArray(item?.content)) {
        return;
      }
      item.content.forEach((chunk) => {
        if (typeof chunk?.text === "string" && chunk.text.trim()) {
          parts.push(chunk.text.trim());
        }
      });
    });
    if (parts.length) {
      return parts.join("\n");
    }
  }

  return "";
}

function extractJson(text) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    // Continue to block extraction.
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const candidate = text.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch (error) {
      return null;
    }
  }

  return null;
}

function normalizeLines(rawLines) {
  if (!Array.isArray(rawLines)) {
    return [];
  }

  const lines = new Map();
  let autoLine = 10;

  rawLines.slice(0, 200).forEach((entry) => {
    let lineNumber = null;
    let text = "";

    if (Array.isArray(entry)) {
      lineNumber = Number(entry[0]);
      text = String(entry[1] ?? "");
    } else if (entry && typeof entry === "object") {
      lineNumber = Number(entry.lineNumber ?? entry.line ?? entry.no ?? NaN);
      text = String(entry.text ?? entry.code ?? "");
    } else if (typeof entry === "string") {
      const match = entry.match(/^\s*(\d+)\s+(.*)$/);
      if (match) {
        lineNumber = Number(match[1]);
        text = String(match[2] ?? "");
      } else {
        lineNumber = autoLine;
        text = entry;
      }
    }

    if (!Number.isFinite(lineNumber) || lineNumber <= 0) {
      lineNumber = autoLine;
    }
    lineNumber = Math.trunc(lineNumber);
    autoLine = Math.max(autoLine + 10, lineNumber + 10);

    const trimmed = String(text).trimEnd();
    if (!trimmed.trim()) {
      return;
    }
    lines.set(lineNumber, trimmed);
  });

  return Array.from(lines.entries()).sort((a, b) => a[0] - b[0]);
}

function normalizeTitle(value) {
  const text = String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .slice(0, 32);
  return text || "AI BASIC PROGRAM";
}

function splitStatementsC64(lineText) {
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

function isAssignmentStatement(stmt) {
  const text = stmt.trim();
  const maybeLet = text.replace(/^LET\s+/i, "").trim();
  const eqPos = findTopLevelEquals(maybeLet);
  if (eqPos < 0) {
    return false;
  }

  const left = maybeLet.slice(0, eqPos).trim();
  return /^[A-Za-z][A-Za-z0-9$]*(?:\s*\(.*\))?$/.test(left);
}

function isAllowedStatement(stmt) {
  const trimmed = stmt.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("?")) return true;
  if (isAssignmentStatement(trimmed)) return true;

  const upper = trimmed.toUpperCase();
  if (EXACT_STATEMENTS.has(upper)) {
    return true;
  }
  return PREFIX_STATEMENTS.some((prefix) => matchesStatementPrefix(upper, prefix));
}

function matchesStatementPrefix(statementUpper, prefixUpper) {
  if (!statementUpper.startsWith(prefixUpper)) {
    return false;
  }

  if (statementUpper.length === prefixUpper.length) {
    return true;
  }

  // Commands ending with space or # already mark an unambiguous keyword boundary.
  const tail = prefixUpper[prefixUpper.length - 1];
  if (tail === " " || tail === "#") {
    return true;
  }

  const next = statementUpper[prefixUpper.length];
  return !/[A-Z0-9$]/.test(next);
}

function validateGeneratedProgram(lines) {
  const errors = [];
  lines.forEach(([lineNumber, lineText]) => {
    const statements = splitStatementsC64(String(lineText || ""));
    statements.forEach((stmt) => {
      if (!isAllowedStatement(stmt)) {
        errors.push(`LINE ${lineNumber}: ${stmt}`);
      }
    });
  });

  return {
    ok: errors.length === 0,
    errors,
  };
}

module.exports = async (req, res) => {
  const config = getRuntimeConfig();

  if (req.method === "GET") {
    return sendJson(res, 200, {
      enabled: Boolean(config.apiKey),
      model: config.apiKey ? config.model : "",
      source: config.source,
    });
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "METHOD NOT ALLOWED" });
  }

  if (!config.apiKey) {
    return sendJson(res, 503, { enabled: false, error: "AI DISABLED" });
  }

  const body = parseBody(req.body);
  const task = String(body?.task || "").trim();
  if (!task) {
    return sendJson(res, 400, { error: "TASK REQUIRED" });
  }

  const systemPrompt = [
    "You generate BASIC code for a specific line-numbered C64-style emulator.",
    "You MUST use ONLY the supported statements listed below.",
    "",
    "SUPPORTED STATEMENTS:",
    ...ALLOWED_STATEMENT_SYNTAX.map((s) => `- ${s}`),
    "",
    "IMMEDIATE-ONLY COMMANDS (do NOT place these inside generated program lines):",
    ...IMMEDIATE_ONLY_COMMANDS.map((s) => `- ${s}`),
    "",
    `SUPPORTED FUNCTIONS/IDENTIFIERS: ${ALLOWED_FUNCTIONS.join(", ")}`,
    "OPERATORS: + - * / ^ AND OR NOT = <> < > <= >=",
    "",
    "Return ONLY valid JSON with this exact shape:",
    '{"title":"SHORT NAME","lines":[[10,"..."],[20,"..."]]}',
    "Rules:",
    "- line numbers must be positive, ascending and unique",
    "- no markdown, no explanation, no extra keys",
    "- keep program runnable and concise",
    "- do not emit unsupported commands",
  ].join("\n");

  const requestPayload = {
    model: config.model,
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Feladat: ${task}` },
    ],
    max_output_tokens: 1400,
    temperature: 0.3,
  };

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    const payload = await response.json();
    if (!response.ok) {
      const apiMessage = payload?.error?.message ? String(payload.error.message).toUpperCase() : "OPENAI REQUEST FAILED";
      return sendJson(res, response.status, { error: apiMessage });
    }

    const text = extractResponseText(payload);
    const parsed = extractJson(text);
    const lines = normalizeLines(parsed?.lines);
    if (!lines.length) {
      return sendJson(res, 502, { error: "AI RESPONSE HAS NO PROGRAM LINES" });
    }

    const validation = validateGeneratedProgram(lines);
    if (!validation.ok) {
      return sendJson(res, 502, {
        error: "AI USED UNSUPPORTED STATEMENT",
        details: validation.errors.slice(0, 8),
      });
    }

    return sendJson(res, 200, {
      enabled: true,
      model: config.model,
      title: normalizeTitle(parsed?.title || task),
      lines,
    });
  } catch (error) {
    return sendJson(res, 500, { error: "AI BACKEND ERROR" });
  }
};
