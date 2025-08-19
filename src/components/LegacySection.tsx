import React, { useEffect, useRef } from 'react'
export default function LegacySection(){
  const ref = useRef<HTMLIFrameElement|null>(null)
  useEffect(()=>{ const id=setTimeout(()=>ref.current?.focus(),300); return ()=>clearTimeout(id) },[])
  return (
    <section className="legacy-wrap"><iframe ref={ref} title="Legacy" src="/legacy.html" className="legacy-iframe"/></section>
  )
}
