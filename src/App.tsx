import { useState } from "react";
import { Wallpaper } from "./components/Wallpaper";
import { Splash } from "./components/Splash";
import { TransitionVideo } from "./components/TransitionVideo";
import { Hero } from "./components/Hero";
import { Desktop } from "./components/Desktop";
import { useIsMobile, usePrefersReducedMotion } from "./lib/useMediaQuery";
import "./styles/boot.css";
import "./styles/windows.css";

type BootState = "splash" | "intro" | "hero" | "desktop";

function App() {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();
  const skipBoot = isMobile || reducedMotion;

  const [boot, setBoot] = useState<BootState>(skipBoot ? "desktop" : "splash");
  const [heroInstant, setHeroInstant] = useState(false);

  return (
    <>
      <Wallpaper />
      {boot === "splash" && <Splash onEnter={() => setBoot("intro")} />}
      {boot === "intro" && (
        <div className="intro">
          <TransitionVideo
            mode="once"
            onEnded={(skipped) => {
              setHeroInstant(skipped);
              setBoot("hero");
            }}
          />
        </div>
      )}
      {boot === "hero" && (
        <Hero instant={heroInstant} onDone={() => setBoot("desktop")} />
      )}
      {boot === "desktop" && <Desktop />}
    </>
  );
}

export default App;
