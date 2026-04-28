import React, { useState, useEffect, useRef, useCallback } from 'react';
import { accents } from '../../styles/theme.js';

// =====================================================================
//   nichtlustig CLI — interactive terminal page
// =====================================================================

const PROMPT_USER = 'christian';
const PROMPT_HOST = 'nichtlustig';
const PROMPT_PATH = '~';

const SKILLS = [
  {
    group: 'Languages',
    items: [
      { name: 'python',     color: '#3776ab' },
      { name: 'Java',       color: '#ed8b00' },
      { name: 'JavaScript', color: '#f0db4f' },
      { name: 'TypeScript', color: '#3178c6' },
      { name: 'C',          color: '#a8b9cc' },
      { name: 'C#',         color: '#9b4f96' },
    ],
  },
  {
    group: 'Tools & Systems',
    items: [
      { name: 'bash',       color: '#4eaa25' },
      { name: 'Linux',      color: '#fcc624' },
      { name: 'git',        color: '#f05032' },
      { name: 'docker',     color: '#2496ed' },
      { name: 'kubernetes', color: '#326ce5' },
    ],
  },
];

const FILES = ['list_skills.sh', 'snake.py', '42.txt', 'cv.pdf', 'contact.txt'];
const COMMAND_NAMES = [
  'help', 'ls', 'cat', 'python', 'open', 'clear',
  'history', 'neofetch', 'date', 'uptime', 'whoami', 'echo',
  './list_skills.sh',
];

// ─── helpers ─────────────────────────────────────────────────────────
const formatUptime = (ms) => {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const FONT_STACK = "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Menlo', 'Monaco', 'Consolas', ui-monospace, monospace";

// ─── Prompt component ────────────────────────────────────────────────
function Prompt({ palette }) {
  return (
    <span>
      <span style={{ color: palette.prompt_user }}>{PROMPT_USER}</span>
      <span style={{ color: palette.text }}>@</span>
      <span style={{ color: palette.prompt_host }}>{PROMPT_HOST}</span>
      <span style={{ color: palette.text }}>:</span>
      <span style={{ color: palette.prompt_path }}>{PROMPT_PATH}</span>
      <span style={{ color: palette.text }}>$ </span>
    </span>
  );
}

// ─── Snake game ──────────────────────────────────────────────────────
const GRID_W = 26;
const GRID_H = 14;
const TICK_MS = 120;
const INITIAL_SNAKE = [
  { x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 },
];

function SnakeGame({ palette, onExit }) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 16, y: 7 });
  const dirRef = useRef({ x: 1, y: 0 });
  const nextDirRef = useRef({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const gameOverRef = useRef(false);

  const reset = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood({ x: 16, y: 7 });
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    setScore(0);
    setGameOver(false);
    gameOverRef.current = false;
    setPaused(false);
  }, []);

  // Keyboard
  useEffect(() => {
    const handle = (e) => {
      const k = e.key;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(k)) e.preventDefault();
      if (k === 'Escape' || k === 'q' || k === 'Q') { onExit(score); return; }
      if (gameOverRef.current) {
        if (k === 'r' || k === 'R' || k === 'Enter') reset();
        return;
      }
      if (k === ' ') { setPaused(p => !p); return; }
      const d = dirRef.current;
      if ((k === 'ArrowUp'    || k === 'w' || k === 'W') && d.y === 0) nextDirRef.current = { x: 0, y: -1 };
      if ((k === 'ArrowDown'  || k === 's' || k === 'S') && d.y === 0) nextDirRef.current = { x: 0, y:  1 };
      if ((k === 'ArrowLeft'  || k === 'a' || k === 'A') && d.x === 0) nextDirRef.current = { x: -1, y: 0 };
      if ((k === 'ArrowRight' || k === 'd' || k === 'D') && d.x === 0) nextDirRef.current = { x:  1, y: 0 };
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [score, onExit, reset]);

  // Tick
  useEffect(() => {
    if (gameOver || paused) return;
    const id = setInterval(() => {
      dirRef.current = nextDirRef.current;
      setSnake(prev => {
        const head = prev[0];
        const nh = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };
        if (nh.x < 0 || nh.x >= GRID_W || nh.y < 0 || nh.y >= GRID_H ||
            prev.some(s => s.x === nh.x && s.y === nh.y)) {
          setGameOver(true);
          gameOverRef.current = true;
          setHighScore(h => Math.max(h, score));
          return prev;
        }
        const ate = nh.x === food.x && nh.y === food.y;
        const ns = [nh, ...prev];
        if (!ate) ns.pop();
        else {
          setScore(s => s + 1);
          let nf;
          do {
            nf = { x: Math.floor(Math.random() * GRID_W), y: Math.floor(Math.random() * GRID_H) };
          } while (ns.some(s => s.x === nf.x && s.y === nf.y));
          setFood(nf);
        }
        return ns;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [gameOver, paused, food, score]);

  // Render grid
  const rows = [];
  for (let y = 0; y < GRID_H; y++) {
    const row = [];
    for (let x = 0; x < GRID_W; x++) {
      let ch = '·', col = palette.dim;
      if (snake[0].x === x && snake[0].y === y)            { ch = '◉'; col = palette.snake_head; }
      else if (snake.some(s => s.x === x && s.y === y))    { ch = '●'; col = palette.snake; }
      else if (food.x === x && food.y === y)               { ch = '◆'; col = palette.food; }
      row.push(
        <span key={x} style={{ color: col, display: 'inline-block', width: '1.1ch', textAlign: 'center' }}>{ch}</span>
      );
    }
    rows.push(<div key={y} style={{ lineHeight: 1.05 }}>{row}</div>);
  }

  return (
    <div style={{ color: palette.text, fontFamily: FONT_STACK }}>
      <div style={{ marginBottom: 8, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <span><span style={{ color: palette.accent }}>SCORE</span> {String(score).padStart(2, '0')}</span>
        <span><span style={{ color: palette.accent }}>HIGH</span>  {String(highScore).padStart(2, '0')}</span>
        {paused && !gameOver && <span style={{ color: palette.warn }}>[PAUSED]</span>}
      </div>
      <div style={{
        padding: '10px 12px',
        border: `1px solid ${palette.border}`,
        background: palette.gameBg,
        display: 'inline-block',
        borderRadius: 2,
      }}>
        {rows}
      </div>
      {gameOver ? (
        <div style={{ marginTop: 10 }}>
          <span style={{ color: palette.error }}>** GAME OVER **</span>
          <span style={{ color: palette.muted }}>  press </span>
          <span style={{ color: palette.accent }}>R</span>
          <span style={{ color: palette.muted }}> to restart, </span>
          <span style={{ color: palette.accent }}>Q</span>
          <span style={{ color: palette.muted }}> or </span>
          <span style={{ color: palette.accent }}>ESC</span>
          <span style={{ color: palette.muted }}> to quit</span>
        </div>
      ) : (
        <div style={{ marginTop: 10, color: palette.muted }}>
          arrows / wasd to move &nbsp;·&nbsp; space to pause &nbsp;·&nbsp; q to quit
        </div>
      )}
    </div>
  );
}

// ─── Output renderers ────────────────────────────────────────────────
function SkillsOutput({ palette }) {
  return (
    <div style={{ color: palette.text }}>
      <pre style={{ color: palette.accent, margin: 0, lineHeight: 1.1, fontFamily: FONT_STACK }}>
{`╔═══════════════════════════════════════════════╗
║           christian's skill tree          ║
╚═══════════════════════════════════════════════╝`}
      </pre>
      <div style={{ marginTop: 12 }}>
        {SKILLS.map(group => (
          <div key={group.group} style={{ marginBottom: 14 }}>
            <div style={{ color: palette.accent, marginBottom: 6 }}>
              <span style={{ color: palette.muted }}>▸ </span>{group.group}
            </div>
            <div style={{ paddingLeft: 4, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '4px 16px' }}>
              {group.items.map(item => (
                <div key={item.name}>
                  <span style={{ color: item.color, marginRight: 8, textShadow: `0 0 8px ${item.color}55` }}>●</span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 4, color: palette.muted }}>
        {SKILLS.reduce((a, g) => a + g.items.length, 0)} skills loaded.
      </div>
    </div>
  );
}

function FortyTwo({ palette }) {
  return (
    <div style={{ color: palette.text, fontFamily: FONT_STACK }}>
      <pre style={{ margin: 0, color: palette.accent, lineHeight: 1.05 }}>
{` _  _  ____  
| || ||___ \ 
| || |_ __) |
|__   _/ __/ 
   |_||_____|`}
      </pre>
      <div style={{ marginTop: 14, color: palette.muted }}>
        "The Answer to the Ultimate Question of
        <br />
        &nbsp;Life, the Universe, and Everything."
      </div>
      <pre style={{ marginTop: 16, marginBottom: 0, color: palette.warn, lineHeight: 1.1 }}>
{`        ╔════════════════════╗
        ║    DON'T  PANIC    ║
        ╚════════════════════╝`}
      </pre>
      <div style={{ marginTop: 12, color: palette.muted, fontStyle: 'italic' }}>
        — The Hitchhiker's Guide to the Galaxy
      </div>
    </div>
  );
}

function Neofetch({ palette, uptime }) {
  const logo = `        .--.       
       |o_o |      
       |:_/ |      
      //   \\ \\     
     (|     | )    
    /'\\_   _/\`\\   
    \\___)=(___/   `;
  const langCount = SKILLS[0].items.length;
  const toolCount = SKILLS[1].items.length;
  const info = [
    ['', `${PROMPT_USER}@${PROMPT_HOST}`],
    ['', '─────────────────────'],
    ['OS',        'Web Terminal'],
    ['Host',      'nichtlustig.dev'],
    ['Kernel',    'React 18'],
    ['Shell',     'bash 5.x (emulated)'],
    ['Uptime',    uptime],
    ['Languages', `${langCount} (py, java, js, ts, c, c#)`],
    ['Tools',     `${toolCount} (bash, linux, git, docker, k8s)`],
    ['CPU',       'V8 / Browser Engine'],
    ['Memory',    '∞ ideas / coffee'],
  ];

  return (
    <div style={{ color: palette.text, display: 'flex', gap: 18, flexWrap: 'wrap', fontFamily: FONT_STACK }}>
      <pre style={{ margin: 0, color: palette.warn, lineHeight: 1.1 }}>{logo}</pre>
      <div style={{ minWidth: 220 }}>
        {info.map((row, i) => (
          <div key={i}>
            {row[0] === '' ? (
              <span style={{ color: i === 0 ? palette.accent : palette.muted }}>{row[1]}</span>
            ) : (
              <>
                <span style={{ color: palette.accent }}>{row[0]}:</span>{' '}
                <span>{row[1]}</span>
              </>
            )}
          </div>
        ))}
        <div style={{ marginTop: 10, display: 'flex', gap: 4 }}>
          {['#f85149','#e3b341','#7ee787','#79c0ff','#d2a8ff','#f778ba'].map(c => (
            <span key={c} style={{ background: c, width: 18, height: 10, display: 'inline-block', borderRadius: 1 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactInfo({ palette }) {
  const rows = [
    ['email',    'christianthimm@yahoo.de'],
    ['github',   'https://github.com/Chr1stian-Th'],
    ['linkedin', 'https://www.linkedin.com/in/christian-thimm-190397341/'],
    ['website',  'nichtlustig.dev'],
  ];
  return (
    <div style={{ color: palette.text, fontFamily: FONT_STACK }}>
      <pre style={{ margin: 0, color: palette.accent, lineHeight: 1.1 }}>
{`┌─────────────────────────────────────┐
│  contact                            │
└─────────────────────────────────────┘`}
      </pre>
      <div style={{ marginTop: 10 }}>
        {rows.map(([k, v]) => (
          <div key={k}>
            <span style={{ color: palette.accent, display: 'inline-block', width: 90 }}>{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HelpOutput({ palette }) {
  const cmds = [
    ['help',              'show this help message'],
    ['ls',                'list files in current directory'],
    ['cat <file>',        'display contents of a file'],
    ['python <script>',   'run a python script (try snake.py)'],
    ['open <file>',       'open a file (try cv.pdf)'],
    ['./list_skills.sh',  'list my skills'],
    ['neofetch',          'display system info'],
    ['date',              'current date and time'],
    ['uptime',            'session uptime'],
    ['history',           'show command history'],
    ['whoami',            'who am I?'],
    ['echo <text>',       'print text'],
    ['clear',             'clear the terminal'],
  ];
  return (
    <div style={{ color: palette.text }}>
      <div style={{ color: palette.accent, marginBottom: 6 }}>available commands:</div>
      {cmds.map(([c, d]) => (
        <div key={c}>
          <span style={{ color: palette.success, display: 'inline-block', width: 200 }}>  {c}</span>
          <span style={{ color: palette.muted }}>{d}</span>
        </div>
      ))}
      <div style={{ marginTop: 10, color: palette.muted }}>
        tip: <span style={{ color: palette.accent }}>tab</span> completes filenames, <span style={{ color: palette.accent }}>↑/↓</span> walks history.
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────
function CliPage({ lang, theme, accent }) {
  const isDark = theme !== 'light';
  const accentColor = accents[accent]?.[isDark ? 'dark' : 'light'] ?? (isDark ? '#79c0ff' : '#0969da');

  const palette = isDark ? {
    bg:           '#0d1117',
    surface:      '#0d1117',
    chrome:       '#161b22',
    text:         '#c9d1d9',
    muted:        '#7d8590',
    dim:          '#30363d',
    border:       '#30363d',
    prompt_user:  '#7ee787',
    prompt_host:  '#79c0ff',
    prompt_path:  '#d2a8ff',
    accent:       accentColor,
    error:        '#f85149',
    warn:         '#e3b341',
    success:      '#7ee787',
    snake:        '#7ee787',
    snake_head:   '#56d364',
    food:         '#f85149',
    gameBg:       '#010409',
  } : {
    bg:           '#fafbfc',
    surface:      '#ffffff',
    chrome:       '#f0f3f6',
    text:         '#1f2328',
    muted:        '#6e7781',
    dim:          '#d1d9e0',
    border:       '#d1d9e0',
    prompt_user:  '#1a7f37',
    prompt_host:  '#0969da',
    prompt_path:  '#8250df',
    accent:       accentColor,
    error:        '#cf222e',
    warn:         '#9a6700',
    success:      '#1a7f37',
    snake:        '#1a7f37',
    snake_head:   '#116329',
    food:         '#cf222e',
    gameBg:       '#f6f8fa',
  };

  const [output, setOutput] = useState([]);
  const [input, setInput] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [bootDone, setBootDone] = useState(false);
  const [snakeActive, setSnakeActive] = useState(false);
  const [, tick] = useState(0); // forces uptime re-render

  const startTimeRef = useRef(Date.now());
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const idRef = useRef(0);
  const newId = () => `e${++idRef.current}`;

  // Cursor blink + uptime tick
  useEffect(() => {
    const c = setInterval(() => setCursorVisible(v => !v), 530);
    const u = setInterval(() => tick(t => t + 1), 1000);
    return () => { clearInterval(c); clearInterval(u); };
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [output, input, snakeActive]);

  const append = useCallback((node) => {
    setOutput(o => [...o, { id: newId(), node }]);
  }, []);

  const appendCommand = useCallback((cmdText) => {
    append(
      <div>
        <Prompt palette={palette} />
        <span style={{ color: palette.text }}>{cmdText}</span>
      </div>
    );
  }, [append, palette]);

  const execute = useCallback((raw) => {
    const cmd = raw.trim();
    appendCommand(raw);
    if (cmd.length === 0) return;
    setCmdHistory(h => [...h, cmd]);
    setHistoryIdx(-1);

    const [head, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(' ');

    const unknown = () => append(
      <div style={{ color: palette.error }}>
        <span style={{ color: palette.error }}>{head}</span>
        <span style={{ color: palette.muted }}>: command not found. type </span>
        <span style={{ color: palette.accent }}>help</span>
        <span style={{ color: palette.muted }}> for available commands.</span>
      </div>
    );

    switch (head) {
      case 'help':
        append(<HelpOutput palette={palette} />);
        break;

      case 'ls': {
        const longFlag = rest.includes('-l') || rest.includes('-la') || rest.includes('-al');
        if (longFlag) {
          append(
            <div>
              <div style={{ color: palette.muted }}>total {FILES.length}</div>
              {FILES.map(f => {
                const isExec = f.endsWith('.sh') || f.endsWith('.py');
                const isPdf  = f.endsWith('.pdf');
                const color = isExec ? palette.success : isPdf ? palette.error : palette.accent;
                const perms = isExec ? '-rwxr-xr-x' : '-rw-r--r--';
                return (
                  <div key={f}>
                    <span style={{ color: palette.muted }}>{perms} 1 christian staff</span>{' '}
                    <span style={{ color }}>{f}</span>
                  </div>
                );
              })}
            </div>
          );
        } else {
          append(
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {FILES.map(f => {
                const isExec = f.endsWith('.sh') || f.endsWith('.py');
                const isPdf  = f.endsWith('.pdf');
                const color = isExec ? palette.success : isPdf ? palette.error : palette.accent;
                return <span key={f} style={{ color }}>{f}</span>;
              })}
            </div>
          );
        }
        break;
      }

      case 'cat': {
        if (!arg) {
          append(<div style={{ color: palette.error }}>cat: missing file operand</div>);
          break;
        }
        const f = arg.trim();
        if (!FILES.includes(f)) {
          append(<div style={{ color: palette.error }}>cat: {f}: No such file or directory</div>);
          break;
        }
        if (f === '42.txt')        append(<FortyTwo palette={palette} />);
        else if (f === 'contact.txt') append(<ContactInfo palette={palette} />);
        else if (f === 'snake.py') append(<div style={{ color: palette.muted }}>// run it: <span style={{ color: palette.accent }}>python snake.py</span></div>);
        else if (f === 'list_skills.sh') append(<div style={{ color: palette.muted }}>// run it: <span style={{ color: palette.accent }}>./list_skills.sh</span></div>);
        else if (f === 'cv.pdf')   append(<div style={{ color: palette.error }}>cat: cv.pdf: binary file. try <span style={{ color: palette.accent }}>open cv.pdf</span></div>);
        break;
      }

      case 'python':
      case 'python3': {
        if (arg.trim() === 'snake.py') {
          setSnakeActive(true);
        } else if (!arg) {
          append(<div style={{ color: palette.muted }}>usage: python &lt;script.py&gt;</div>);
        } else {
          append(<div style={{ color: palette.error }}>python: can't open file '{arg}': [Errno 2] No such file or directory</div>);
        }
        break;
      }

      case 'open': {
        if (arg.trim() === 'cv.pdf') {
          append(<div style={{ color: palette.muted }}>opening <span style={{ color: palette.accent }}>cv.pdf</span> ...</div>);
          if (typeof window !== 'undefined') window.open('/cv.pdf', '_blank', 'noopener');
        } else if (!arg) {
          append(<div style={{ color: palette.muted }}>usage: open &lt;file&gt;</div>);
        } else {
          append(<div style={{ color: palette.error }}>open: {arg}: file not found</div>);
        }
        break;
      }

      case './list_skills.sh':
        append(<SkillsOutput palette={palette} />);
        break;

      case 'neofetch':
        append(<Neofetch palette={palette} uptime={formatUptime(Date.now() - startTimeRef.current)} />);
        break;

      case 'date':
        append(<div>{new Date().toString()}</div>);
        break;

      case 'uptime':
        append(<div>up {formatUptime(Date.now() - startTimeRef.current)}</div>);
        break;

      case 'whoami':
        append(<div>{PROMPT_USER}</div>);
        break;

      case 'echo':
        append(<div>{arg}</div>);
        break;

      case 'history':
        append(
          <div>
            {[...cmdHistory, cmd].map((c, i) => (
              <div key={i}>
                <span style={{ color: palette.muted, display: 'inline-block', width: 36, textAlign: 'right', marginRight: 8 }}>{i + 1}</span>
                <span>{c}</span>
              </div>
            ))}
          </div>
        );
        break;

      case 'clear':
        setOutput([]);
        break;

      case 'sudo':
        append(<div style={{ color: palette.muted }}>nice try.</div>);
        break;

      case 'exit':
      case 'logout':
        append(<div style={{ color: palette.muted }}>there is no escape.</div>);
        break;

      default:
        unknown();
    }
  }, [append, appendCommand, cmdHistory, palette]);

  // Boot animation: type ./list_skills.sh, then run
  useEffect(() => {
    const cmd = './list_skills.sh';
    let i = 0;
    const typer = setInterval(() => {
      i++;
      setInput(cmd.slice(0, i));
      if (i >= cmd.length) {
        clearInterval(typer);
        setTimeout(() => {
          setInput('');
          execute(cmd);
          setBootDone(true);
          if (inputRef.current) inputRef.current.focus();
        }, 450);
      }
    }, 65);
    return () => clearInterval(typer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tab completion
  const tabComplete = useCallback((current) => {
    const parts = current.split(/\s+/);
    const last = parts[parts.length - 1];
    let pool;
    if (parts.length === 1) {
      pool = COMMAND_NAMES;
    } else {
      pool = FILES;
    }
    const matches = pool.filter(p => p.startsWith(last));
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      setInput(parts.join(' '));
    } else if (matches.length > 1) {
      // Find common prefix
      let prefix = matches[0];
      for (const m of matches) {
        while (!m.startsWith(prefix)) prefix = prefix.slice(0, -1);
      }
      if (prefix.length > last.length) {
        parts[parts.length - 1] = prefix;
        setInput(parts.join(' '));
      }
      appendCommand(current);
      append(
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          {matches.map(m => <span key={m} style={{ color: palette.accent }}>{m}</span>)}
        </div>
      );
    }
  }, [append, appendCommand, palette]);

  const handleKeyDown = (e) => {
    if (!bootDone || snakeActive) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      execute(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const ni = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(ni);
      setInput(cmdHistory[ni]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const ni = historyIdx + 1;
      if (ni >= cmdHistory.length) {
        setHistoryIdx(-1);
        setInput('');
      } else {
        setHistoryIdx(ni);
        setInput(cmdHistory[ni]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      tabComplete(input);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault();
      setOutput([]);
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      appendCommand(input + '^C');
      setInput('');
    }
  };

  const exitSnake = useCallback((finalScore) => {
    setSnakeActive(false);
    append(
      <div style={{ color: palette.muted }}>
        snake.py exited &middot; final score: <span style={{ color: palette.accent }}>{finalScore}</span>
      </div>
    );
    setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
  }, [append, palette]);

  const focusInput = () => { if (inputRef.current && !snakeActive) inputRef.current.focus(); };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12" style={{ fontFamily: FONT_STACK }}>
      {/* terminal window */}
      <div
        onClick={focusInput}
        style={{
          background: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 24px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02) inset'
            : '0 12px 40px -16px rgba(31,35,40,0.18)',
        }}
      >
        {/* chrome */}
        <div style={{
          background: palette.chrome,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: `1px solid ${palette.border}`,
        }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
          <span style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            color: palette.muted,
            fontSize: 13,
            transform: 'translateX(-22px)',
          }}>
            {PROMPT_USER}@{PROMPT_HOST}: {PROMPT_PATH} — bash
          </span>
        </div>

        {/* scroll area */}
        <div
          ref={scrollRef}
          style={{
            position: 'relative',
            background: palette.bg,
            color: palette.text,
            padding: '16px 18px',
            height: '70vh',
            minHeight: 480,
            maxHeight: 720,
            overflowY: 'auto',
            overflowX: 'hidden',
            fontSize: 14,
            lineHeight: 1.55,
            cursor: 'text',
          }}
        >
          {/* boot banner */}
          <pre style={{ margin: 0, color: palette.accent, lineHeight: 1.1 }}>
{`╔═══════════════════════════════════════════════════════╗
║   nichtlustig CLI v1.0                                ║
║   type 'help' to see available commands               ║
╚═══════════════════════════════════════════════════════╝`}
          </pre>
          <div style={{ height: 12 }} />

          {/* output history */}
          {output.map(e => (
            <div key={e.id} style={{ marginBottom: 8 }}>{e.node}</div>
          ))}

          {/* snake takes over input area */}
          {snakeActive ? (
            <SnakeGame palette={palette} onExit={exitSnake} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Prompt palette={palette} />
              <span style={{ color: palette.text, whiteSpace: 'pre' }}>{input}</span>
              <span style={{
                display: 'inline-block',
                width: '0.6ch',
                height: '1.1em',
                background: cursorVisible ? palette.text : 'transparent',
                marginLeft: 1,
                verticalAlign: 'text-bottom',
                transition: 'background 80ms linear',
              }} />
            </div>
          )}

          {/* hidden real input — captures keystrokes */}
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => bootDone && !snakeActive && setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="terminal input"
            style={{
              position: 'absolute',
              left: -9999,
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* hint below */}
      <div style={{ marginTop: 10, color: palette.muted, fontSize: 12, fontFamily: FONT_STACK, textAlign: 'center' }}>
        click anywhere in the terminal to focus &middot; <span style={{ color: palette.accent }}>tab</span> completes &middot; <span style={{ color: palette.accent }}>↑/↓</span> walks history &middot; <span style={{ color: palette.accent }}>ctrl+l</span> clears
      </div>
    </div>
  );
}

export default {
  id: 'cli',
  folder: 'fun',
  order: 1,
  icon: 'terminal',
  iconColor: '#39ff14',
  name: { en: 'CLI', de: 'CLI' },
  hideExt: true,
  component: CliPage,
};