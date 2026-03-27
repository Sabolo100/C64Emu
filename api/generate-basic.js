const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const OPENAI_API_URL = "https://api.openai.com/v1/responses";

function sendJson(res, status, payload) {
  res.status(status).json(payload);
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

module.exports = async (req, res) => {
  if (req.method === "GET") {
    return sendJson(res, 200, {
      enabled: Boolean(OPENAI_API_KEY),
      model: OPENAI_API_KEY ? OPENAI_MODEL : "",
    });
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "METHOD NOT ALLOWED" });
  }

  if (!OPENAI_API_KEY) {
    return sendJson(res, 503, { enabled: false, error: "AI DISABLED" });
  }

  const body = parseBody(req.body);
  const task = String(body?.task || "").trim();
  if (!task) {
    return sendJson(res, 400, { error: "TASK REQUIRED" });
  }

  const systemPrompt = [
    "You generate Commodore 64 BASIC V2 compatible code for a line-numbered editor.",
    "Return ONLY valid JSON with this shape:",
    '{"title":"SHORT NAME","lines":[[10,"..."],[20,"..."]]}',
    "Rules:",
    "- line numbers must be ascending and unique",
    "- use runnable BASIC in this emulator",
    "- no markdown, no explanation, no extra keys",
    "- keep program reasonably short",
  ].join("\n");

  const requestPayload = {
    model: OPENAI_MODEL,
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
        Authorization: `Bearer ${OPENAI_API_KEY}`,
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

    return sendJson(res, 200, {
      enabled: true,
      model: OPENAI_MODEL,
      title: normalizeTitle(parsed?.title || task),
      lines,
    });
  } catch (error) {
    return sendJson(res, 500, { error: "AI BACKEND ERROR" });
  }
};
