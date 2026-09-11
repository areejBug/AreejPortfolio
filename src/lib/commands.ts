import { CONTENT } from "../content";
import { THEMES, type ThemeName } from "../store";
import type { DocId } from "../store";

export type LineKind = "out" | "ok" | "err" | "info" | "box";

export type SpecialBlock =
  | { kind: "help"; cats: [string, [string, string][]][] }
  | { kind: "neofetch"; logo: string[]; info: string[] }
  | { kind: "hackmenu" };

export type TermCtx = {
  print: (text: string, kind?: LineKind) => void;
  printSpecial: (block: SpecialBlock) => void;
  clearLines: () => void;
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  cycleTheme: () => ThemeName;
  openDoc: (id: DocId) => void;
  openProjectsExplorer: () => void;
  closeSecondaryWindows: () => void;
  startedAtMs: number;
  awaitPlease: boolean;
  setAwaitPlease: (v: boolean) => void;
  playMusic: () => void;
  /** True when the visitor has prefers-reduced-motion set — scripted sequences skip their delays. */
  reducedMotion: boolean;
  playAlert: () => void;
};

/** Every command the tab-completer knows about — including the "exit()" red herring. */
export const ALL_CMDS = [
  "help",
  "about",
  "projects",
  "skills",
  "contact",
  "clear",
  "theme",
  "neofetch",
  "ascii",
  "music",
  "time",
  "exit",
  "sudo",
  "please",
  "coffee",
  "hello",
  "hi",
  "rm",
  "vim",
  "exit()",
  "42",
  "play",
  "hackmeportal",
];

export const HELP_CATS: [string, [string, string][]][] = [
  [
    "[ Me ]",
    [
      ["about", "who is areej nawaz?"],
      ["skills", "my tech stack"],
      ["contact", "ways to reach me"],
    ],
  ],
  ["[ Work ]", [["projects", "browse projects in Explorer"]]],
  [
    "[ System ]",
    [
      ["help", "this menu"],
      ["clear", "wipe the terminal"],
      ["theme", "switch OS theme"],
      ["neofetch", "system info"],
      ["hackmeportal", "try to hack me ;)"],
      ["exit", "log out (if you dare)"],
    ],
  ],
];

export const BOOT_BOX = [
  "╔══════════════════════════════════════════╗",
  "║  areej_OS                               ║",
  "║  \"where complex algorithmic theory        ║",
  "║   meets pixel execution\"                  ║",
  "╚══════════════════════════════════════════╝",
];

const ASCII_ART = [
  "   ___                     _ ",
  "  / _ \\                   (_)",
  " / /_\\ \\_ __ ___  ___ _ __ _ ",
  " |  _  | '__/ _ \\/ _ \\ '_ \\ |",
  " | | | | | |  __/  __/ | | | |",
  " \\_| |_/_|  \\___|\\___|_| |_|_|",
];

export function cmdAbout(ctx: TermCtx) {
  ctx.openDoc("about");
  ctx.print("Opened about.txt", "ok");
  ctx.print("");
}

export function cmdSkills(ctx: TermCtx) {
  ctx.openDoc("skills");
  ctx.print("Opened skills.txt", "ok");
  ctx.print("");
}

export function cmdContact(ctx: TermCtx) {
  ctx.openDoc("contact");
  ctx.print("Opened contact.txt", "ok");
  ctx.print("");
}

export function cmdProjects(ctx: TermCtx) {
  ctx.print(`PROJECTS (${CONTENT.projects.length})`, "info");
  CONTENT.projects.forEach((p) => {
    ctx.print(
      `&nbsp;&nbsp;<b>${p.id}</b>&nbsp;&nbsp;<span style="color:var(--ink-dim)">/${p.folder}</span>`,
    );
  });
  ctx.print("");
  ctx.print("Click a card on the desktop, or browse the Explorer.", "info");
  ctx.print("");
  ctx.openProjectsExplorer();
}

export function cmdTheme(ctx: TermCtx, arg: string) {
  if (!arg) {
    const t = ctx.cycleTheme();
    ctx.print(`theme → ${t}`, "ok");
    ctx.print(`Available: ${THEMES.join(", ")}`, "info");
  } else if ((THEMES as string[]).includes(arg)) {
    ctx.setTheme(arg as ThemeName);
    ctx.print(`theme → ${arg}`, "ok");
  } else {
    ctx.print(
      `theme: unknown '${escapeHtml(arg)}'. Available: ${THEMES.join(", ")}`,
      "err",
    );
  }
  ctx.print("");
}

export function cmdNeofetch(ctx: TermCtx) {
  const up = Math.max(1, Math.round((Date.now() - ctx.startedAtMs) / 1000));
  const logo = [
    "█████████",
    "██     ██",
    "██ ▄▄▄ ██",
    "██     ██",
    "██     ██",
    "█████████",
  ];
  const skillCount = CONTENT.skills.reduce((n, s) => n + s[1].length, 0);
  const info = [
    `<b>${CONTENT.name}</b>@areej_OS`,
    "-------------------",
    `role     : ${CONTENT.role}`,
    "os       : areej_OS v2.0 (pixel)",
    `theme    : ${ctx.theme}`,
    `projects : ${CONTENT.projects.length}`,
    `skills   : ${skillCount}`,
    `uptime   : ${up}s`,
    `contact  : ${CONTENT.links.email}`,
  ];
  ctx.printSpecial({ kind: "neofetch", logo, info });
  ctx.print("");
}

export function cmdAscii(ctx: TermCtx) {
  ASCII_ART.forEach((l) => ctx.print(escapeHtml(l), "box"));
  ctx.print("");
  ctx.print("Built by hand, pixel by pixel.", "info");
  ctx.print("");
}

export function cmdMusic(ctx: TermCtx) {
  ctx.print("♪ playing: compile-time lo-fi ...", "ok");
  ctx.playMusic();
  ctx.print("(that is the whole album)", "info");
  ctx.print("");
}

export function cmdHelp(ctx: TermCtx) {
  ctx.printSpecial({ kind: "help", cats: HELP_CATS });
  ctx.print("");
  ctx.print("Tip: <b>theme</b> takes an argument — try <b>theme midnight</b>.", "info");
  ctx.print("");
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Witty stand-ins for a flat "command not found" — never the same one twice in a row. */
const SASS_LINES: ((cmd: string) => string)[] = [
  (cmd) => `'${cmd}' is not a spell in my grimoire. Try help.`,
  (cmd) => `RuntimeError: '${cmd}' is undefined. Bold of you to assume otherwise.`,
  (cmd) => `404: '${cmd}' not found. Maybe it's in your other portfolio.`,
  (cmd) => `Syntax error near '${cmd}'. Did you mean help? I think you meant help.`,
  (cmd) => `I searched my entire stack. '${cmd}' was not found. Concerning.`,
  (cmd) => `'${cmd}' failed to compile. So did my patience.`,
  (cmd) => `I ran '${cmd}' through every interpreter I own. Nothing. Try help.`,
  (cmd) => `'${cmd}' is giving me an existential crisis. Try help instead.`,
];

let lastSassIdx = -1;
function sassyNotFound(cmd: string): string {
  let idx = Math.floor(Math.random() * SASS_LINES.length);
  while (idx === lastSassIdx) idx = Math.floor(Math.random() * SASS_LINES.length);
  lastSassIdx = idx;
  return SASS_LINES[idx](escapeHtml(cmd));
}

/** Runs a scripted, harmless "hack attempt" in ~7s. */
export function cmdHackmeportal(ctx: TermCtx) {
  const ua = navigator.userAgent.slice(0, 50);

  type HackStep = { delay: number; run: (c: TermCtx) => void };
  const steps: HackStep[] = [
    { delay: 0, run: (c) => c.print("initializing hack sequence...", "info") },
    { delay: 500, run: (c) => c.print("scanning ports 22, 80, 443, 8080...") },
    { delay: 700, run: (c) => c.print("bypassing firewall [########..] 78%") },
    { delay: 500, run: (c) => c.print("bypassing firewall [##########] 100%", "ok") },
    { delay: 500, run: (c) => c.print("decrypting areej_secrets.zip...") },
    {
      delay: 700,
      run: (c) => {
        c.print("!! ACCESS DENIED — REVERSE TRACE STARTED !!", "err");
        c.playAlert();
      },
    },
    { delay: 400, run: (c) => c.print("counter-hacking your machine...", "err") },
    {
      delay: 350,
      run: (c) => c.print("your ip .......... 127.0.0.1 (nice try, localhost)"),
    },
    {
      delay: 250,
      run: (c) => c.print(`your screen ...... ${screen.width}x${screen.height}`),
    },
    {
      delay: 250,
      run: (c) =>
        c.print(`your platform .... ${escapeHtml(navigator.platform || "unknown")}`),
    },
    {
      delay: 250,
      run: (c) => c.print(`your language .... ${escapeHtml(navigator.language)}`),
    },
    { delay: 250, run: (c) => c.print(`your browser ..... ${escapeHtml(ua)}...`) },
    { delay: 350, run: (c) => c.print("your vibe ........ impressed", "ok") },
    { delay: 250, run: (c) => c.print("") },
    {
      delay: 400,
      run: (c) => c.print("My secrets are compiled, not interpreted.", "info"),
    },
    {
      delay: 350,
      run: (c) => c.print("But you got this far, so you are clearly thorough.", "info"),
    },
    {
      delay: 350,
      run: (c) => c.print("That is exactly who I want reading this.", "info"),
    },
    { delay: 200, run: (c) => c.print("") },
    { delay: 300, run: (c) => c.printSpecial({ kind: "hackmenu" }) },
  ];

  let i = 0;
  function next() {
    if (i >= steps.length) return;
    const step = steps[i];
    i++;
    if (ctx.reducedMotion) {
      step.run(ctx);
      next();
    } else {
      setTimeout(() => {
        step.run(ctx);
        next();
      }, step.delay);
    }
  }
  next();
}

/** Parses and executes one line of terminal input against the given context. */
export function runCommand(rawInput: string, ctx: TermCtx) {
  const input = rawInput.trim();
  if (!input) return;

  if (ctx.awaitPlease) {
    if (input.toLowerCase() === "please" || input.toLowerCase() === "exit please") {
      ctx.setAwaitPlease(false);
      ctx.print("Thank you. Closing.", "ok");
      setTimeout(() => {
        ctx.closeSecondaryWindows();
        ctx.clearLines();
        ctx.print("Session closed. Refresh to boot again.", "info");
        ctx.print(
          `Or just email me: <a href="mailto:${CONTENT.links.email}">${CONTENT.links.email}</a>`,
          "ok",
        );
      }, 700);
      return;
    }
    ctx.print("Manners first. Type <b>please</b>.", "err");
    return;
  }

  const parts = input.split(/\s+/);
  const c = parts[0].toLowerCase();
  const arg = parts.slice(1).join(" ").toLowerCase();

  switch (c) {
    case "help":
      cmdHelp(ctx);
      break;
    case "about":
      cmdAbout(ctx);
      break;
    case "projects":
      cmdProjects(ctx);
      break;
    case "skills":
      cmdSkills(ctx);
      break;
    case "contact":
      cmdContact(ctx);
      break;
    case "clear":
      ctx.clearLines();
      break;
    case "theme":
      cmdTheme(ctx, arg);
      break;
    case "neofetch":
      cmdNeofetch(ctx);
      break;
    case "ascii":
      cmdAscii(ctx);
      break;
    case "time":
      ctx.print(new Date().toLocaleTimeString(), "out");
      ctx.print("");
      break;
    case "music":
    case "play":
      cmdMusic(ctx);
      break;
    case "hackmeportal":
      cmdHackmeportal(ctx);
      break;

    case "sudo":
      ctx.print(
        "areej is not in the sudoers file. This incident has been reported.",
        "err",
      );
      ctx.print("");
      break;
    case "rm":
      ctx.print("Nice try. This portfolio has version control.", "err");
      ctx.print("");
      break;
    case "vim":
      ctx.print(
        "You are already trapped in someone else's editor. :q! will not save you.",
        "info",
      );
      ctx.print("");
      break;
    case "coffee":
      ctx.print("brewing... — error 418: I'm a teapot", "info");
      ctx.print("");
      break;
    case "42":
      ctx.print("Correct. But you still have not read my projects.", "ok");
      ctx.print("");
      break;
    case "hello":
    case "hi":
      ctx.print(`Hi. I am ${CONTENT.name}. Try <b>projects</b>.`, "ok");
      ctx.print("");
      break;

    case "exit":
    case "quit":
    case "logout":
      ctx.print("Leaving already? You have not seen the projects.", "err");
      ctx.print("Say <b>please</b> and I will let you out.", "err");
      ctx.setAwaitPlease(true);
      break;

    default: {
      ctx.print(sassyNotFound(c), "err");
      const near = ALL_CMDS.find((x) => x.startsWith(c[0]));
      if (near) ctx.print(`Did you mean <b>${near}</b>?`, "info");
      ctx.print("");
    }
  }
}
