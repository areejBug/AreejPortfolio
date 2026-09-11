type ProjectTitleProps = {
  name: string;
  as?: "h3" | "div" | "span";
  className?: string;
};

/**
 * Every project name follows "Label: Subtitle". Splits on the first colon so
 * the label reads bold and large while the subtitle reads smaller and
 * softer — the same prominent/secondary text hierarchy used for the name vs.
 * tagline on the hero screens.
 */
export function ProjectTitle({ name, as: Tag = "div", className }: ProjectTitleProps) {
  const i = name.indexOf(":");
  if (i === -1) {
    return <Tag className={className}>{name}</Tag>;
  }
  return (
    <Tag className={className}>
      <span className="title-main">{name.slice(0, i + 1)}</span>
      <span className="title-sub">{name.slice(i + 1).trim()}</span>
    </Tag>
  );
}
