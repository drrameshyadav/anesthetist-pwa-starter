import React, { useEffect, useRef } from 'react'

/**
 * Generic container that loads /legacy.html in-place.
 * We keep it simple: full-height iframe that sits above the tab bar.
 * (If later we want to auto-scroll to a section, we can add postMessage hooks.)
 */
export default function LegacySection() {
  const ref = useRef<HTMLIFrameElement | null>(null)

  // Ensure iframe takes keyboard focus for better mobile scrolling.
  useEffect(() => {
    const id = setTimeout(() => ref.current?.focus(), 300)
    return () => clearTimeout(id)
  }, [])

  return (
    <section className="legacy-wrap">
      <iframe
        ref={ref}
        title="Legacy Toolkit"
        src="/legacy.html"
        className="legacy-iframe"
      />
    </section>
  )
}
