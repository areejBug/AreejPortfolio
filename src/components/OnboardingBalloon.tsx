import { useEffect, useState } from "react";
import { useStore } from "../store";

export function OnboardingBalloon() {
  const dismissed = useStore((s) => s.balloonDismissed);
  const dismissBalloon = useStore((s) => s.dismissBalloon);
  const [shown, setShown] = useState(false);

  // Small delay so the balloon appears once the icon/rail pop-in settles,
  // rather than competing with them.
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 500);
    return () => clearTimeout(t);
  }, []);

  if (dismissed || !shown) return null;

  return (
    <div className="onboard-balloon">
      <button
        className="onboard-balloon-close"
        type="button"
        aria-label="Dismiss tip"
        onClick={dismissBalloon}
      >
        ×
      </button>
      <b>New here?</b>
      <p>
        Click your way through the icons, or just start typing below — this OS is
        fluent in both.
      </p>
    </div>
  );
}
