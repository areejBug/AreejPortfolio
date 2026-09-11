import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useStore } from "../../store";
import { CONTENT } from "../../content";
import {
  runCommand,
  ALL_CMDS,
  BOOT_BOX,
  type TermCtx,
  type LineKind,
} from "../../lib/commands";
import { sClick, sKey, sBoot, sAlert, playTone } from "../../lib/audio";
import { useIsMobile, usePrefersReducedMotion } from "../../lib/useMediaQuery";
import "../../styles/terminal.css";

const HELP_ARROW_COL = 12;

function HelpBlock({ cats }: { cats: [string, [string, string][]][] }) {
  return (
    <>
      {cats.map(([label, cmds]) => {
        const body = [
          label,
          "-".repeat(30),
          ...cmds.map(([cmd, desc]) => `  ${cmd.padEnd(HELP_ARROW_COL)}→ ${desc}`),
        ].join("\n");
        return (
          <pre className="help-block" key={label}>
            {body}
          </pre>
        );
      })}
    </>
  );
}

function HackLinks({ onRun }: { onRun: (cmd: string) => void }) {
  const items: [string, string][] = [["contact", "> contact — hire me?"]];
  return (
    <div className="help-grid" style={{ gridTemplateColumns: "1fr" }}>
      {items.map(([cmd, label]) => (
        <button key={cmd} type="button" className="hchip" onClick={() => onRun(cmd)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function NeofetchBlock({ logo, info }: { logo: string[]; info: string[] }) {
  return (
    <div className="neofetch">
      <pre>{logo.join("\n")}</pre>
      <div className="info">
        {info.map((l, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: l }} />
        ))}
      </div>
    </div>
  );
}

type Line = { id: string; node: ReactNode };

export function Terminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [awaitPlease, setAwaitPlease] = useState(false);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const startedAtRef = useRef(Date.now());
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();

  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const cycleTheme = useStore((s) => s.cycleTheme);
  const openDoc = useStore((s) => s.openDoc);
  const openWindow = useStore((s) => s.openWindow);
  const closeWindow = useStore((s) => s.closeWindow);

  function pushNode(node: ReactNode) {
    // A real UUID, not a counter — immune to dev-time hot-reload module resets
    // that a mutable module-scope counter could collide against.
    setLines((ls) => [...ls, { id: crypto.randomUUID(), node }]);
  }

  function print(text: string, kind: LineKind = "out") {
    pushNode(
      <div className={`line ${kind}`} dangerouslySetInnerHTML={{ __html: text }} />,
    );
  }

  function echo(raw: string) {
    pushNode(
      <div className="line">
        <span className="ps1">areej</span>
        <span className="ps2">@os</span>
        <span className="ps1">:~$</span> {raw}
      </div>,
    );
  }

  function clearLines() {
    setLines([]);
  }

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  // Boot sequence: prints the box one line at a time, matching the
  // prototype's staggered timing rather than a single instant dump.
  useEffect(() => {
    let i = 0;
    let timer = 0;
    function next() {
      if (i < BOOT_BOX.length) {
        print(BOOT_BOX[i], "box");
        i++;
        timer = window.setTimeout(next, 45);
      } else {
        print(`System loaded. ${CONTENT.projects.length} projects indexed.`, "ok");
        print("Type <b>help</b> to see available commands.", "out");
        print("");
        sBoot();
        if (!isMobile) inputRef.current?.focus();
      }
    }
    next();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onFocusRequest() {
      if (!isMobile) inputRef.current?.focus();
    }
    window.addEventListener("terminal-focus", onFocusRequest);
    return () => window.removeEventListener("terminal-focus", onFocusRequest);
  }, [isMobile]);

  function run(raw: string) {
    const val = (raw ?? "").trim();
    echo(val);
    setInput("");
    if (!val) return;

    historyRef.current.push(val);
    historyIdxRef.current = historyRef.current.length;

    const ctx: TermCtx = {
      print,
      printSpecial: (block) => {
        if (block.kind === "help") pushNode(<HelpBlock cats={block.cats} />);
        else if (block.kind === "neofetch")
          pushNode(<NeofetchBlock logo={block.logo} info={block.info} />);
        else pushNode(<HackLinks onRun={run} />);
      },
      clearLines,
      theme,
      setTheme,
      cycleTheme: () => {
        cycleTheme();
        return useStore.getState().theme;
      },
      openDoc,
      openProjectsExplorer: () => {
        openWindow("exp");
      },
      closeSecondaryWindows: () => {
        closeWindow("exp");
        closeWindow("app");
        closeWindow("doc");
      },
      startedAtMs: startedAtRef.current,
      awaitPlease,
      setAwaitPlease,
      playMusic: () =>
        [523, 659, 784, 1047, 784, 659].forEach((f, i) =>
          playTone(f, 0.22, i * 0.18, "triangle", 0.05),
        ),
      reducedMotion,
      playAlert: sAlert,
    };
    runCommand(val, ctx);
  }

  function complete() {
    const v = input.trim().toLowerCase();
    if (!v) return;
    const m = ALL_CMDS.filter((x) => x.startsWith(v));
    if (m.length === 1) {
      setInput(m[0]);
      sClick();
    } else if (m.length > 1) {
      let p = m[0];
      m.forEach((x) => {
        while (!x.startsWith(p)) p = p.slice(0, -1);
      });
      setInput(p);
      print(`  ${m.join("   ")}`, "info");
    }
    if (!isMobile) inputRef.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      run(input);
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIdxRef.current > 0) {
        historyIdxRef.current -= 1;
        setInput(historyRef.current[historyIdxRef.current] ?? "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdxRef.current < historyRef.current.length - 1) {
        historyIdxRef.current += 1;
        setInput(historyRef.current[historyIdxRef.current] ?? "");
      } else {
        historyIdxRef.current = historyRef.current.length;
        setInput("");
      }
    } else if (input.length % 2 === 0) {
      sKey();
    }
  }

  return (
    <div
      className="term-body"
      ref={bodyRef}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("button,a") && !isMobile)
          inputRef.current?.focus();
      }}
    >
      {lines.map((l) => (
        <Fragment key={l.id}>{l.node}</Fragment>
      ))}
      <div className="irow">
        <span className="ps1">areej</span>
        <span className="ps2">@os</span>
        <span className="ps1">:~$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          enterKeyHint="go"
          aria-label="Terminal input"
        />
        <button className="tab-btn" type="button" onClick={complete}>
          TAB
        </button>
      </div>
    </div>
  );
}
