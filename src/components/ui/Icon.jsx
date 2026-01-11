"use client";

const ICONS = {
  search: {
    viewBox: "0 0 24 24",
    paths: [
      "M14.385 15.446a6.75 6.75 0 1 1 1.06-1.06l5.156 5.155a.75.75 0 1 1-1.06 1.06zm-7.926-1.562a5.25 5.25 0 1 1 7.43-.005l-.005.005l-.005.004a5.25 5.25 0 0 1-7.42-.004",
    ],
    fillRule: "evenodd",
    clipRule: "evenodd",
  },
  edit: {
    viewBox: "0 0 24 24",
    paths: [
      "M2 6.857A4.857 4.857 0 0 1 6.857 2H12a1 1 0 1 1 0 2H6.857A2.857 2.857 0 0 0 4 6.857v10.286A2.857 2.857 0 0 0 6.857 20h10.286A2.857 2.857 0 0 0 20 17.143V12a1 1 0 1 1 2 0v5.143A4.857 4.857 0 0 1 17.143 22H6.857A4.857 4.857 0 0 1 2 17.143z",
      "m15.137 13.219l-2.205 1.33l-1.033-1.713l2.205-1.33l.003-.002a1.2 1.2 0 0 0 .232-.182l5.01-5.036a3 3 0 0 0 .145-.157c.331-.386.821-1.15.228-1.746c-.501-.504-1.219-.028-1.684.381a6 6 0 0 0-.36.345l-.034.034l-4.94 4.965a1.2 1.2 0 0 0-.27.41l-.824 2.073a.2.2 0 0 0 .29.245l1.032 1.713c-1.805 1.088-3.96-.74-3.18-2.698l.825-2.072a3.2 3.2 0 0 1 .71-1.081l4.939-4.966l.029-.029c.147-.15.641-.656 1.24-1.02c.327-.197.849-.458 1.494-.508c.74-.059 1.53.174 2.15.797a2.9 2.9 0 0 1 .845 1.75a3.15 3.15 0 0 1-.23 1.517c-.29.717-.774 1.244-.987 1.457l-5.01 5.036q-.28.281-.62.487m4.453-7.126s-.004.003-.013.006z",
    ],
    fillRule: "evenodd",
    clipRule: "evenodd",
  },
  user: {
    viewBox: "0 0 24 24",
    paths: [
      "M12 12a4 4 0 1 0-4-4a4 4 0 0 0 4 4",
      "M4 20a8 8 0 0 1 16 0v1H4z",
    ],
  },
  chart: {
    viewBox: "0 0 24 24",
    paths: [
      "M5 20a1 1 0 0 1-1-1V5a1 1 0 1 1 2 0v13h13a1 1 0 1 1 0 2z",
      "M7 9h2v7H7z",
      "M11 6h2v10h-2z",
      "M15 11h2v5h-2z",
    ],
  },
  bank: {
    viewBox: "0 0 24 24",
    paths: [
      "M3 10h18v2H3z",
      "M5 12h2v7H5z",
      "M9 12h2v7H9z",
      "M13 12h2v7h-2z",
      "M17 12h2v7h-2z",
      "M3 20h18v2H3z",
      "M12 3L3 8v1h18V8z",
    ],
  },
  box: {
    viewBox: "0 0 24 24",
    paths: [
      "M12 2L3 7v10l9 5l9-5V7z",
    ],
  },
  grid: {
    viewBox: "0 0 24 24",
    paths: [
      "M4 4h7v7H4z",
      "M13 4h7v7h-7z",
      "M4 13h7v7H4z",
      "M13 13h7v7h-7z",
    ],
  },
  receipt: {
    viewBox: "0 0 24 24",
    paths: [
      "M6 2h12a2 2 0 0 1 2 2v18l-3-2l-3 2l-3-2l-3 2l-3-2V4a2 2 0 0 1 2-2z",
      "M8 7h8v2H8z",
      "M8 11h8v2H8z",
      "M8 15h5v2H8z",
    ],
  },
  bag: {
    viewBox: "0 0 24 24",
    paths: [
      "M6 7h12l-1 13H7z",
      "M9 6h6v2H9z",
    ],
  },
  folder: {
    viewBox: "0 0 24 24",
    paths: [
      "M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    ],
  },
  map: {
    viewBox: "0 0 24 24",
    paths: [
      "M3 6l5-2l8 2l5-2v14l-5 2l-8-2l-5 2z",
    ],
  },
  play: {
    viewBox: "0 0 24 24",
    paths: [
      "M8 5v14l11-7z",
    ],
  },
  cart: {
    viewBox: "0 0 24 24",
    paths: [
      "M6 6h14l-2 8H8z",
      "M2 3h4v2H2z",
      "M9 20a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3z",
      "M17 20a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3z",
    ],
  },
  briefcase: {
    viewBox: "0 0 24 24",
    paths: [
      "M9 3h6a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v4H2V9a2 2 0 0 1 2-2h3V5a2 2 0 0 1 2-2z",
      "M9 5h6v2H9z",
      "M2 13h20v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z",
    ],
  },
  delete: {
    viewBox: "0 0 24 24",
    paths: [
      "M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zm-7 11q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17M7 6v13z",
    ],
  },
  refresh: {
    viewBox: "0 0 24 24",
    paths: [
      "M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7c2.76 0 5 2.24 5 5a5 5 0 1 1-9.9-1H5.02a7 7 0 1 0 12.63-4.65",
    ],
  },
  menu: {
    viewBox: "0 0 24 24",
    paths: [
      "M4 7.5A1.5 1.5 0 0 1 5.5 6h13a1.5 1.5 0 0 1 0 3h-13A1.5 1.5 0 0 1 4 7.5m0 5A1.5 1.5 0 0 1 5.5 11h13a1.5 1.5 0 0 1 0 3h-13A1.5 1.5 0 0 1 4 12.5m0 5A1.5 1.5 0 0 1 5.5 16h13a1.5 1.5 0 0 1 0 3h-13A1.5 1.5 0 0 1 4 17.5",
    ],
  },
  plus: {
    viewBox: "0 0 24 24",
    paths: ["M11 5h2v14h-2z", "M5 11h14v2H5z"],
  },
  chevronDown: {
    viewBox: "0 0 24 24",
    paths: [
      "M6.23 8.73a1 1 0 0 1 1.41 0L12 13.09l4.36-4.36a1 1 0 0 1 1.41 1.41l-5.07 5.07a1 1 0 0 1-1.41 0L6.23 10.14a1 1 0 0 1 0-1.41z",
    ],
  },
};

export default function Icon({ name, size = 16, className, title }) {
  const icon = ICONS[name];
  if (!icon) return null;
  return (
    <svg
      className={className}
      viewBox={icon.viewBox}
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
    >
      {title ? <title>{title}</title> : null}
      {icon.paths.map((path) => (
        <path
          key={path}
          d={path}
          fillRule={icon.fillRule}
          clipRule={icon.clipRule}
        />
      ))}
    </svg>
  );
}
