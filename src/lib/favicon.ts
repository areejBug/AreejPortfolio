import { drawIcon } from "./pixel";

/** Renders the "term" pixel icon to a canvas and installs it as the favicon. No image files. */
export function setFavicon() {
  const cv = document.createElement("canvas");
  cv.width = 32;
  cv.height = 32;
  drawIcon(cv, "term");
  const url = cv.toDataURL("image/png");

  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = "image/png";
  link.href = url;
}
