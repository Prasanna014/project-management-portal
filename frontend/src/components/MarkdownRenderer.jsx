import React from "react";
import { Box, Typography } from "@mui/material";

/* ─── Inline token parser ───────────────────────────────────────────────── */
function renderInline(text) {
  const tokens = [];
  let rest = text;

  while (rest.length > 0) {
    // Images: ![alt](url)
    let m = rest.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (m) { tokens.push({ t: "img", alt: m[1], url: m[2] }); rest = rest.slice(m[0].length); continue; }

    // Links: [text](url)
    m = rest.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (m) { tokens.push({ t: "link", text: m[1], url: m[2] }); rest = rest.slice(m[0].length); continue; }

    // Bold+italic: ***text***
    m = rest.match(/^\*\*\*([^*]+)\*\*\*/);
    if (m) { tokens.push({ t: "bi", text: m[1] }); rest = rest.slice(m[0].length); continue; }

    // Bold: **text**
    m = rest.match(/^\*\*([^*]+)\*\*/);
    if (m) { tokens.push({ t: "b", text: m[1] }); rest = rest.slice(m[0].length); continue; }

    // Italic: *text*
    m = rest.match(/^\*([^*]+)\*/);
    if (m) { tokens.push({ t: "i", text: m[1] }); rest = rest.slice(m[0].length); continue; }

    // Inline code: `code`
    m = rest.match(/^`([^`]+)`/);
    if (m) { tokens.push({ t: "code", text: m[1] }); rest = rest.slice(m[0].length); continue; }

    // Plain text — consume up to next special char
    const nextSpec = rest.search(/[!*`[]/);
    if (nextSpec <= 0) {
      tokens.push({ t: "text", text: rest[0] });
      rest = rest.slice(1);
    } else {
      tokens.push({ t: "text", text: rest.slice(0, nextSpec) });
      rest = rest.slice(nextSpec);
    }
  }

  return tokens.map((tok, idx) => {
    switch (tok.t) {
      case "b":    return <strong key={idx} style={{ fontWeight: 700 }}>{tok.text}</strong>;
      case "i":    return <em key={idx}>{tok.text}</em>;
      case "bi":   return <strong key={idx}><em>{tok.text}</em></strong>;
      case "code": return (
        <Box key={idx} component="code" sx={{
          bgcolor: "#f1f5f9", color: "#dc2626", px: "5px", py: "1px",
          borderRadius: "4px", fontFamily: "monospace", fontSize: "0.85em",
          border: "1px solid #e2e8f0",
        }}>{tok.text}</Box>
      );
      case "link": return (
        <Box key={idx} component="a" href={tok.url} target="_blank" rel="noopener noreferrer"
          sx={{ color: "#2563eb", textDecoration: "underline", cursor: "pointer", "&:hover": { color: "#1d4ed8" } }}>
          {tok.text}
        </Box>
      );
      case "img":  return (
        <Box key={idx} component="img" src={tok.url} alt={tok.alt}
          sx={{ maxWidth: "100%", borderRadius: "8px", my: 0.5, display: "block" }} />
      );
      default:     return tok.text;
    }
  });
}

/* ─── Block renderer ────────────────────────────────────────────────────── */
function renderBlock(line, key) {
  if (!line.trim()) return <Box key={key} sx={{ height: "6px" }} />;

  // ATX Headings
  if (line.startsWith("### ")) return (
    <Typography key={key} sx={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", mt: 1, mb: 0.25, lineHeight: 1.4 }}>
      {renderInline(line.slice(4))}
    </Typography>
  );
  if (line.startsWith("## ")) return (
    <Typography key={key} sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", mt: 1.25, mb: 0.25, lineHeight: 1.35 }}>
      {renderInline(line.slice(3))}
    </Typography>
  );
  if (line.startsWith("# ")) return (
    <Typography key={key} sx={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", mt: 1.5, mb: 0.5, lineHeight: 1.3 }}>
      {renderInline(line.slice(2))}
    </Typography>
  );

  // Horizontal rule
  if (/^---+$|^\*\*\*+$/.test(line.trim())) return (
    <Box key={key} sx={{ borderBottom: "1px solid #e2e8f0", my: 0.75 }} />
  );

  // Blockquote
  if (line.startsWith("> ")) return (
    <Box key={key} sx={{
      pl: 1.5, borderLeft: "3px solid #3b82f6", my: 0.25,
      bgcolor: "#eff6ff", borderRadius: "0 6px 6px 0", py: "4px 8px",
    }}>
      <Typography sx={{ fontSize: "0.9rem", color: "#1d4ed8", fontStyle: "italic", lineHeight: 1.6 }}>
        {renderInline(line.slice(2))}
      </Typography>
    </Box>
  );

  // Unordered list item
  if (/^[-*+] /.test(line)) return (
    <Box key={key} sx={{ display: "flex", gap: 0.75, alignItems: "flex-start", pl: 0.5 }}>
      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#3b82f6", mt: 0.9, flexShrink: 0 }} />
      <Typography sx={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.65 }}>
        {renderInline(line.slice(2))}
      </Typography>
    </Box>
  );

  // Numbered list item
  const numM = line.match(/^(\d+)\. /);
  if (numM) return (
    <Box key={key} sx={{ display: "flex", gap: 0.75, alignItems: "flex-start", pl: 0.5 }}>
      <Typography sx={{ fontSize: "0.8rem", color: "#3b82f6", fontWeight: 700, lineHeight: 1.65, minWidth: "1.4em", textAlign: "right", flexShrink: 0 }}>
        {numM[1]}.
      </Typography>
      <Typography sx={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.65 }}>
        {renderInline(line.slice(numM[0].length))}
      </Typography>
    </Box>
  );

  // Default paragraph
  return (
    <Typography key={key} component="p" sx={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.7, m: 0 }}>
      {renderInline(line)}
    </Typography>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function MarkdownRenderer({ text }) {
  if (!text || !text.trim()) {
    return (
      <Typography sx={{ fontSize: "0.9rem", color: "#94a3b8", fontStyle: "italic" }}>
        No description provided
      </Typography>
    );
  }

  // Split text on fenced code blocks (``` ... ```)
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
      {parts.map((part, pi) => {
        /* ── Fenced code block ── */
        if (part.startsWith("```") && part.endsWith("```")) {
          const inner = part.slice(3, -3);
          const nlIdx = inner.indexOf("\n");
          const possibleLang = nlIdx !== -1 ? inner.slice(0, nlIdx).trim() : "";
          const isLang = possibleLang.length > 0 && possibleLang.length <= 12 && /^[a-zA-Z0-9+#.-]+$/.test(possibleLang);
          const lang = isLang ? possibleLang : "";
          const code = (isLang ? inner.slice(lang.length + 1) : inner).replace(/^\n/, "");

          return (
            <Box key={pi} sx={{ my: 0.75 }}>
              {lang && (
                <Box sx={{
                  display: "inline-block", px: 1, py: "2px",
                  bgcolor: "#334155", color: "#94a3b8",
                  fontSize: "0.7rem", fontWeight: 700,
                  borderRadius: "6px 6px 0 0", fontFamily: "monospace",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  {lang}
                </Box>
              )}
              <Box sx={{
                bgcolor: "#1e293b", color: "#e2e8f0",
                p: lang ? "10px 14px 14px" : "14px",
                borderRadius: lang ? "0 8px 8px 8px" : "8px",
                fontFamily: "monospace", fontSize: "0.82rem",
                overflowX: "auto", whiteSpace: "pre", lineHeight: 1.65,
                border: "1px solid #334155",
              }}>
                {code}
              </Box>
            </Box>
          );
        }

        /* ── Regular text block ── */
        return (
          <React.Fragment key={pi}>
            {part.split("\n").map((line, li) => renderBlock(line, `${pi}-${li}`))}
          </React.Fragment>
        );
      })}
    </Box>
  );
}
