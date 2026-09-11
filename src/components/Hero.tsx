import { useEffect, useRef, useState } from "react";
import { CONTENT } from "../content";
import { sKey } from "../lib/audio";

type HeroProps = {
  /** Skip the typewriter and render the tagline instantly (intro was skipped, or reduced motion). */
  instant: boolean;
  onDone: () => void;
};

export function Hero({ instant, onDone }: HeroProps) {
  const [typed, setTyped] = useState(instant ? CONTENT.heroTagline : "");
  const doneRef = useRef(onDone);
  const doneFiredRef = useRef(false);

  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    function finish() {
      if (doneFiredRef.current) return;
      doneFiredRef.current = true;
      doneRef.current();
    }

    if (instant) {
      const t = setTimeout(finish, 120);
      return () => clearTimeout(t);
    }
    let i = 0;
    let timer = 0;
    function type() {
      if (i < CONTENT.heroTagline.length) {
        i++;
        setTyped(CONTENT.heroTagline.slice(0, i));
        if (i % 2 === 0) sKey();
        timer = window.setTimeout(type, 38);
      } else {
        timer = window.setTimeout(finish, 420);
      }
    }
    type();
    return () => clearTimeout(timer);
  }, [instant]);

  return (
    <div className="hero show">
      <h1>Hi, I am {CONTENT.name.split(" ")[0]}</h1>
      <p className="hero-sub">
        {typed}
        <span className="cur" />
      </p>
    </div>
  );
}
