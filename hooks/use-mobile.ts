import * as React from "react"

// Below Tailwind `lg` the app sidebar becomes a slide-in drawer, so tablets get the full width
// for content (a fixed 16rem sidebar left too little room at 768px). Keep in sync with the
// `lg:` classes in components/ui/sidebar.tsx.
const MOBILE_BREAKPOINT = 1024
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

// useSyncExternalStore instead of setState-in-effect (react-hooks/set-state-in-effect lint rule).
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  )
}
