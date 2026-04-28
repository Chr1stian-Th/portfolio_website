import { useState, useEffect, useRef, useCallback } from "react";
import { accents } from "../../styles/theme.js";

// ─── constants ────────────────────────────────────────────────────────────────

const DIFF = {
  beginner:     { rows: 9,  cols: 9,  mines: 10, label: "Beginner" },
  intermediate: { rows: 16, cols: 16, mines: 40, label: "Intermediate" },
  expert:       { rows: 16, cols: 30, mines: 99, label: "Expert" },
};

const CELL_PX = { beginner: 34, intermediate: 28, expert: 22 };

const NUM_COLOR = {
  light: ["", "#0000dd", "#1a7a00", "#dd0000", "#000099", "#880000", "#007777", "#111111", "#777777"],
  dark:  ["", "#6ea8fe", "#75d472", "#ff7f7f", "#93caff", "#ffb07a", "#6ee7e7", "#e0e0e0", "#aaaaaa"],
};

// ─── grid helpers ─────────────────────────────────────────────────────────────

function makeGrid(rows, cols) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false, revealed: false, flagged: false, question: false,
      count: 0, exploded: false,
    }))
  );
}

function getNeighbors(rows, cols, r, c) {
  const res = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) res.push([nr, nc]);
    }
  return res;
}

function withMines(grid, rows, cols, totalMines, safeR, safeC) {
  const g = grid.map(row => row.map(cell => ({ ...cell })));
  let placed = 0;
  while (placed < totalMines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!g[r][c].mine && !(Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1)) {
      g[r][c].mine = true;
      placed++;
    }
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (!g[r][c].mine)
        g[r][c].count = getNeighbors(rows, cols, r, c).filter(([nr, nc]) => g[nr][nc].mine).length;
  return g;
}

function floodReveal(grid, rows, cols, r, c) {
  const g = grid.map(row => row.map(cell => ({ ...cell })));
  const stack = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop();
    const cell = g[cr][cc];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.count === 0 && !cell.mine)
      getNeighbors(rows, cols, cr, cc).forEach(([nr, nc]) => {
        if (!g[nr][nc].revealed) stack.push([nr, nc]);
      });
  }
  return g;
}

function revealAllMines(grid, triggerR, triggerC) {
  return grid.map((row, r) =>
    row.map((cell, c) => {
      if (cell.mine) return { ...cell, revealed: true, exploded: r === triggerR && c === triggerC };
      return cell;
    })
  );
}

function isWon(grid) {
  return grid.every(row => row.every(cell => cell.mine ? !cell.revealed : cell.revealed));
}

// ─── sub-components ───────────────────────────────────────────────────────────

function SegmentDisplay({ value }) {
  const clamped = Math.max(-99, Math.min(999, value));
  const text = clamped < 0
    ? "-" + String(Math.abs(clamped)).padStart(2, "0")
    : String(clamped).padStart(3, "0");

  return (
    <div style={{
      background: "#0a0a0a",
      color: "#ff2200",
      fontFamily: "'Courier New', monospace",
      fontSize: "1.5rem",
      fontWeight: "bold",
      padding: "2px 8px",
      minWidth: "3.6rem",
      textAlign: "right",
      letterSpacing: "0.05em",
      boxShadow: "inset 2px 2px 4px #000, inset -1px -1px 2px #333",
      textShadow: "0 0 8px #ff220066",
      userSelect: "none",
    }}>
      {text}
    </div>
  );
}

function Cell({ cell, size, colors, numColors, status, onLeft, onRight, onMiddle }) {
  const revealed = cell.revealed;

  const handleMouseDown = (e) => {
    if (e.button === 1) {
      e.preventDefault();
      onMiddle(e);
    }
  };

  // Determine content
  let content = null;
  let bgColor;
  let borderStyle;

  if (revealed) {
    bgColor = cell.exploded ? "#cc1111" : colors.cellRevealed;
    borderStyle = {
      borderTop: `1px solid ${colors.borderDark}`,
      borderLeft: `1px solid ${colors.borderDark}`,
      borderBottom: `1px solid ${colors.borderLight}`,
      borderRight: `1px solid ${colors.borderLight}`,
    };

    if (cell.mine) {
      content = <span style={{ fontSize: size * 0.62, lineHeight: 1 }}>💣</span>;
    } else if (cell.count > 0) {
      content = (
        <span style={{
          color: numColors[cell.count],
          fontWeight: "900",
          fontSize: size * 0.58,
          fontFamily: "var(--font-mono)",
          lineHeight: 1,
          userSelect: "none",
        }}>
          {cell.count}
        </span>
      );
    }

    // Wrong flag indicator
    if (status === "lost" && !cell.mine && !revealed) {
      bgColor = colors.cellUnrevealed;
    }
  } else {
    bgColor = colors.cellUnrevealed;
    borderStyle = {
      borderTop: `2px solid ${colors.borderLight}`,
      borderLeft: `2px solid ${colors.borderLight}`,
      borderBottom: `2px solid ${colors.borderDark}`,
      borderRight: `2px solid ${colors.borderDark}`,
    };

    if (status === "lost" && cell.flagged && !cell.mine) {
      content = <span style={{ fontSize: size * 0.62, lineHeight: 1 }}>❌</span>;
    } else if (cell.flagged) {
      content = <span style={{ fontSize: size * 0.62, lineHeight: 1 }}>🚩</span>;
    } else if (cell.question) {
      content = (
        <span style={{
          color: colors.questionColor,
          fontWeight: "bold",
          fontSize: size * 0.62,
          fontFamily: "var(--font-mono)",
          lineHeight: 1,
          userSelect: "none",
        }}>?</span>
      );
    }
  }

  return (
    <div
      onClick={onLeft}
      onContextMenu={onRight}
      onMouseDown={handleMouseDown}
      onAuxClick={(e) => { if (e.button === 1) { e.preventDefault(); onMiddle(e); } }}
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: bgColor,
        ...borderStyle,
        cursor: (revealed || status === "won" || status === "lost") ? "default" : "pointer",
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    >
      {content}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

function MinesweeperPage({ lang, theme, accent }) {
  const dark = theme === "dark";
  const accentColor = accents[accent]?.[dark ? "dark" : "light"] ?? (dark ? "#3b5278" : "#909090");

  const colors = {
    pageBg:         'var(--bg)',
    panelBg:        'var(--code-bg)',
    headerBg:       'var(--hover)',
    borderLight:    'var(--bg)',
    borderDark:     'var(--border)',
    cellUnrevealed: 'var(--hover-strong)',
    cellRevealed:   'var(--sidebar-bg)',
    text:           'var(--fg)',
    diffBtn:        'var(--hover)',
    diffBtnActive:  accentColor,
    questionColor:  accentColor,
    winBg:          dark ? "#14532d" : "#86efac",
    loseBg:         dark ? "#7f1d1d" : "#fca5a5",
    winBorder:      dark ? "#166534" : "#16a34a",
    loseBorder:     dark ? "#991b1b" : "#dc2626",
  };

  const [diff, setDiff] = useState("beginner");
  const [grid, setGrid] = useState(() => makeGrid(9, 9));
  const [status, setStatus] = useState("idle"); // idle | playing | won | lost
  const [flagCount, setFlagCount] = useState(0);
  const [time, setTime] = useState(0);

  const timerRef = useRef(null);
  const { rows, cols, mines } = DIFF[diff];
  const cellPx = CELL_PX[diff];
  const numColors = NUM_COLOR[dark ? "dark" : "light"];

  // Timer
  useEffect(() => {
    if (status === "playing") {
      timerRef.current = setInterval(() => setTime(t => Math.min(t + 1, 999)), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  // New game
  const newGame = useCallback((d) => {
    const key = d || diff;
    const { rows, cols } = DIFF[key];
    setGrid(makeGrid(rows, cols));
    setStatus("idle");
    setFlagCount(0);
    setTime(0);
  }, [diff]);

  const changeDiff = (d) => {
    setDiff(d);
    const { rows, cols } = DIFF[d];
    setGrid(makeGrid(rows, cols));
    setStatus("idle");
    setFlagCount(0);
    setTime(0);
  };

  // Left click — reveal
  const handleLeft = useCallback((r, c) => {
    if (status === "won" || status === "lost") return;
    const cell = grid[r][c];
    if (cell.revealed || cell.flagged || cell.question) return;

    let g = grid;

    if (status === "idle") {
      // First click: place mines safely, start timer
      g = withMines(grid, rows, cols, mines, r, c);
      setStatus("playing");
    }

    if (g[r][c].mine) {
      const blown = revealAllMines(g, r, c);
      setGrid(blown);
      setStatus("lost");
      return;
    }

    const next = floodReveal(g, rows, cols, r, c);
    setGrid(next);
    if (isWon(next)) setStatus("won");
  }, [grid, status, rows, cols, mines]);

  // Right click — flag / question / clear
  const handleRight = useCallback((e, r, c) => {
    e.preventDefault();
    if (status === "won" || status === "lost" || status === "idle") return;
    const cell = grid[r][c];
    if (cell.revealed) return;

    const next = grid.map(row => row.map(cell => ({ ...cell })));
    const target = next[r][c];

    if (!target.flagged && !target.question) {
      target.flagged = true;
      setFlagCount(f => f + 1);
    } else if (target.flagged) {
      target.flagged = false;
      target.question = true;
      setFlagCount(f => f - 1);
    } else {
      target.question = false;
    }

    setGrid(next);
  }, [grid, status]);

  // Middle click — chord: reveal neighbors if flagged count matches number
  const handleMiddle = useCallback((e, r, c) => {
    e.preventDefault();
    if (status !== "playing") return;
    const cell = grid[r][c];
    if (!cell.revealed || cell.count === 0) return;

    const ns = getNeighbors(rows, cols, r, c);
    const flagged = ns.filter(([nr, nc]) => grid[nr][nc].flagged).length;
    if (flagged !== cell.count) return;

    let g = grid.map(row => row.map(cell => ({ ...cell })));
    let hitMine = false;
    let hitR = -1, hitC = -1;

    for (const [nr, nc] of ns) {
      const n = g[nr][nc];
      if (!n.revealed && !n.flagged) {
        if (n.mine) {
          hitMine = true;
          hitR = nr; hitC = nc;
        } else {
          g = floodReveal(g, rows, cols, nr, nc);
        }
      }
    }

    if (hitMine) {
      g = revealAllMines(g, hitR, hitC);
      setGrid(g);
      setStatus("lost");
    } else {
      setGrid(g);
      if (isWon(g)) setStatus("won");
    }
  }, [grid, status, rows, cols]);

  const face = status === "won" ? "😎" : status === "lost" ? "😵" : "🙂";
  const minesLeft = mines - flagCount;

  // Panel border helpers
  const panelBorder = {
    borderTop:    `3px solid ${colors.borderLight}`,
    borderLeft:   `3px solid ${colors.borderLight}`,
    borderBottom: `3px solid ${colors.borderDark}`,
    borderRight:  `3px solid ${colors.borderDark}`,
  };
  const insetBorder = {
    borderTop:    `2px solid ${colors.borderDark}`,
    borderLeft:   `2px solid ${colors.borderDark}`,
    borderBottom: `2px solid ${colors.borderLight}`,
    borderRight:  `2px solid ${colors.borderLight}`,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.pageBg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "2rem",
        paddingBottom: "3rem",
        fontFamily: "var(--font-mono)",
        color: colors.text,
        transition: "background 0.2s",
      }}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Title */}
      <h1 style={{
        fontSize: "1.4rem",
        fontWeight: "bold",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        marginBottom: "1.2rem",
        userSelect: "none",
      }}>
        💣 Minesweeper
      </h1>

      {/* Difficulty selector */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "1rem" }}>
        {Object.entries(DIFF).map(([key, val]) => (
          <button
            key={key}
            onClick={() => changeDiff(key)}
            style={{
              padding: "4px 14px",
              background: diff === key ? colors.diffBtnActive : colors.diffBtn,
              color: colors.text,
              fontFamily: "var(--font-mono)",
              fontSize: "0.78rem",
              fontWeight: diff === key ? "bold" : "normal",
              cursor: "pointer",
              userSelect: "none",
              ...(diff === key ? insetBorder : {
                borderTop:    `2px solid ${colors.borderLight}`,
                borderLeft:   `2px solid ${colors.borderLight}`,
                borderBottom: `2px solid ${colors.borderDark}`,
                borderRight:  `2px solid ${colors.borderDark}`,
              }),
            }}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Main panel */}
      <div style={{
        background: colors.panelBg,
        padding: "8px",
        boxShadow: dark ? "6px 6px 20px #000a" : "4px 4px 12px #0005",
        ...panelBorder,
      }}>

        {/* Header bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 8px",
          marginBottom: "8px",
          background: colors.headerBg,
          ...insetBorder,
          gap: "8px",
        }}>
          <SegmentDisplay value={minesLeft} />

          <button
            onClick={() => newGame()}
            title="New Game"
            style={{
              fontSize: "1.3rem",
              background: colors.diffBtn,
              fontFamily: "inherit",
              cursor: "pointer",
              padding: "2px 8px",
              lineHeight: 1.2,
              userSelect: "none",
              borderTop:    `2px solid ${colors.borderLight}`,
              borderLeft:   `2px solid ${colors.borderLight}`,
              borderBottom: `2px solid ${colors.borderDark}`,
              borderRight:  `2px solid ${colors.borderDark}`,
            }}
            onMouseDown={e => {
              e.currentTarget.style.borderTop    = `2px solid ${colors.borderDark}`;
              e.currentTarget.style.borderLeft   = `2px solid ${colors.borderDark}`;
              e.currentTarget.style.borderBottom = `2px solid ${colors.borderLight}`;
              e.currentTarget.style.borderRight  = `2px solid ${colors.borderLight}`;
            }}
            onMouseUp={e => {
              e.currentTarget.style.borderTop    = `2px solid ${colors.borderLight}`;
              e.currentTarget.style.borderLeft   = `2px solid ${colors.borderLight}`;
              e.currentTarget.style.borderBottom = `2px solid ${colors.borderDark}`;
              e.currentTarget.style.borderRight  = `2px solid ${colors.borderDark}`;
            }}
          >
            {face}
          </button>

          <SegmentDisplay value={time} />
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, ${cellPx}px)`,
            ...insetBorder,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <Cell
                key={`${r}-${c}`}
                cell={cell}
                size={cellPx}
                colors={colors}
                numColors={numColors}
                status={status}
                onLeft={() => handleLeft(r, c)}
                onRight={(e) => handleRight(e, r, c)}
                onMiddle={(e) => handleMiddle(e, r, c)}
              />
            ))
          )}
        </div>
      </div>

      {/* Win / Loss banner */}
      {(status === "won" || status === "lost") && (
        <div style={{
          marginTop: "1.2rem",
          padding: "0.5rem 1.8rem",
          background: status === "won" ? colors.winBg : colors.loseBg,
          border: `2px solid ${status === "won" ? colors.winBorder : colors.loseBorder}`,
          fontWeight: "bold",
          fontSize: "0.95rem",
          letterSpacing: "0.05em",
          userSelect: "none",
        }}>
          {status === "won"
            ? `🎉 Cleared in ${time}s — click 🙂 to play again`
            : "💥 Kaboom! Click 🙂 to try again"}
        </div>
      )}

      {/* Controls hint */}
      <div style={{
        marginTop: "1rem",
        fontSize: "0.72rem",
        color: 'var(--fg-faint)',
        textAlign: "center",
        userSelect: "none",
        letterSpacing: "0.04em",
      }}>
        LMB reveal · RMB flag/? · MMB chord (auto-reveal when flags match)
      </div>
    </div>
  );
}

// ─── export ───────────────────────────────────────────────────────────────────

export default {
  id: "minesweeper",
  folder: "fun",
  order: 2,
  icon: "bomb",
  name: { en: "Minesweeper", de: "Minesweeper" },
  component: MinesweeperPage,
};