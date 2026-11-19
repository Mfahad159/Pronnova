"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

export interface NavItem {
  label: string;
  href: string;
}

interface GooeyNavProps {
  items: NavItem[];
  className?: string;
}

export function GooeyNav({ items, className }: GooeyNavProps) {
  const pathname = usePathname();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Derived state from pathname - no cascading effect
  const activeIndex = Math.max(
    0,
    items.findIndex((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    )
  );

  const targetIndex = hoverIndex !== null ? hoverIndex : activeIndex;

  useEffect(() => {
    const targetEl = itemRefs.current[targetIndex];
    const container = containerRef.current;
    if (targetEl && container) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      setIndicatorStyle({
        left: targetRect.left - containerRect.left,
        width: targetRect.width,
        opacity: 1,
      });
    }
  }, [targetIndex]);

  return (
    <>
      {/* SVG Gooey Filter Definition */}
      <svg className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
        <defs>
          <filter id="gooey-nav-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -6"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <nav
        aria-label="Primary navigation"
        className={cn("relative inline-flex items-center", className)}
      >
        <div
          ref={containerRef}
          className="relative flex items-center rounded-full bg-white/70 p-1.5 shadow-sm backdrop-blur-md border border-white/60"
          style={{ filter: "url(#gooey-nav-filter)" }}
        >
          {/* Animated Gooey Pill Indicator */}
          <div
            className="pointer-events-none absolute h-8 rounded-full bg-gradient-to-r from-cta-coral/90 to-brand-orange/90 transition-all duration-300 ease-out"
            style={{
              transform: `translateX(${indicatorStyle.left}px)`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
            }}
          />

          {/* Links */}
          {items.map((item, index) => {
            const isCurrent = targetIndex === index;
            return (
              <Link
                key={item.href}
                href={item.href}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
                className={cn(
                  "relative z-10 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-colors duration-200",
                  isCurrent ? "text-white" : "text-foreground/80 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
