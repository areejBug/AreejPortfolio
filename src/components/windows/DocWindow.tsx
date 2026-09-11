import { useState } from "react";
import { useStore } from "../../store";
import { CONTENT } from "../../content";
import { PixelIcon } from "../PixelIcon";
import { PixelWord } from "../PixelWord";
import { PixelPortrait } from "../PixelPortrait";
import { PixelPhone } from "../PixelPhone";
import skillsFill from "../../assets/skills-fill.svg";
import "../../styles/doc.css";

// Pulled out of the main bio sentence into its own larger callout box below
// — tailored to CONTENT.aboutIntro[0]'s current wording specifically.
const CALLOUT_PHRASE = "a few segmentation faults along the way.";

function AboutDoc() {
  const mainBio = CONTENT.aboutIntro[0].replace(` ${CALLOUT_PHRASE}`, "");

  return (
    <div className="doc-body about-hero-wrap">
      <div className="about-hero">
        <PixelPortrait className="about-face" />
        <div className="about-title-wrap">
          <h3 className="sr-only">whoami</h3>
          <PixelWord
            text="whoami"
            cell={13}
            colorFor={(i) => (i < 3 ? "var(--portrait-purple)" : "var(--portrait-light)")}
            shadowFor={(i) =>
              i < 3 ? "color-mix(in srgb, var(--portrait-purple) 45%, white)" : null
            }
          />
        </div>
        <div className="about-bio">
          <p>{mainBio}</p>
        </div>
        <div className="about-callout">{CALLOUT_PHRASE}</div>
      </div>
    </div>
  );
}

const ALL_SKILLS = CONTENT.skills.flatMap(([, list]) => list);

function SkillsDoc() {
  const [idx, setIdx] = useState(0);

  return (
    <div className="doc-body skills-wrap">
      <img className="skills-fill" src={skillsFill} alt="" aria-hidden="true" />
      <div className="skills-blue-screen">
        <h3 className="sr-only">Areej knows {ALL_SKILLS[idx]}</h3>
        <svg className="skills-arch" viewBox="0 0 300 90" aria-hidden="true">
          <path id="skillsArc" d="M 12,78 Q 150,-6 288,78" fill="none" />
          <text className="skills-arch-text">
            <textPath href="#skillsArc" startOffset="52%" textAnchor="middle">
              areej knows
            </textPath>
          </text>
        </svg>
        <div className="skills-marquee" aria-hidden="true">
          <span
            key={idx}
            className="skills-slide"
            onAnimationEnd={() => setIdx((i) => (i + 1) % ALL_SKILLS.length)}
          >
            {ALL_SKILLS[idx]}
          </span>
        </div>
      </div>
    </div>
  );
}

function ContactDoc() {
  const { email, github, linkedin } = CONTENT.links;

  return (
    <div className="doc-body contact-wrap">
      <h3 className="contact-title">Ring me, maybe?</h3>
      <PixelPhone />
      <div className="contact-links">
        <a className="contact-link" href={`mailto:${email}`}>
          <PixelIcon kind="mail" size={16} />
          Email
        </a>
        <a
          className="contact-link"
          href={github}
          target="_blank"
          rel="noopener noreferrer"
        >
          <PixelIcon kind="term" size={16} />
          GitHub
        </a>
        <a
          className="contact-link"
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
        >
          <PixelIcon kind="globe" size={16} />
          LinkedIn
        </a>
      </div>
    </div>
  );
}

export function DocWindow() {
  const activeDoc = useStore((s) => s.activeDoc);

  if (activeDoc === "about") return <AboutDoc />;
  if (activeDoc === "skills") return <SkillsDoc />;
  if (activeDoc === "contact") return <ContactDoc />;
  return null;
}
