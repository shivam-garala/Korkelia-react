import type { SVGProps } from "react";

import Home from "@/icons/home.svg";
import User from "@/icons/user.svg";
import Diamond from "@/icons/diamond.svg";
import Menu from "@/icons/menu.svg";
import Search from "@/icons/search.svg";
import Bell from "@/icons/bell.svg";
import Moon from "@/icons/moon.svg";
import Settings from "@/icons/settings.svg";
import Chart from "@/icons/chart.svg";
import Grid from "@/icons/grid.svg";
import Scissors from "@/icons/scissors.svg";
import Tag from "@/icons/tag.svg";
import Sparkle from "@/icons/sparkle.svg";

const icons = {
  home: Home,
  user: User,
  diamond: Diamond,
  menu: Menu,
  search: Search,
  bell: Bell,
  moon: Moon,
  settings: Settings,
  chart: Chart,
  grid: Grid,
  scissors: Scissors,
  tag: Tag,
  sparkle: Sparkle,
} as const;

export type IconName = keyof typeof icons;

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  "aria-label"?: string;
};

export function Icon({ name, "aria-label": ariaLabel, ...props }: IconProps) {
  const Svg = icons[name];

  return (
    <Svg
      focusable="false"
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      {...props}
    />
  );
}
