import gsap from 'gsap'

/** Force an element (and common masked children) fully visible. */
export function forceVisible(el: Element | null | undefined) {
  if (!el || !(el instanceof HTMLElement)) return
  gsap.set(el, {
    clearProps: 'opacity,visibility,transform,clipPath,y,x,yPercent,xPercent',
    opacity: 1,
    visibility: 'visible',
    y: 0,
    x: 0,
    yPercent: 0,
    xPercent: 0,
    clipPath: 'none',
  })
  el.querySelectorAll(
    '.rw-inner, .tm-inner, .titulo-linea-inner, .char, .sh-word, .img-parallax-inner',
  ).forEach((child) => {
    gsap.set(child, {
      clearProps: 'opacity,visibility,transform,clipPath,y,x,yPercent,xPercent',
      opacity: 1,
      visibility: 'visible',
      y: 0,
      yPercent: 0,
      clipPath: 'none',
    })
  })
}

/** If after 3s the element still looks hidden, force it visible. */
export function armVisibilitySafety(
  el: Element | null | undefined,
  ms = 3000,
): () => void {
  if (!el || !(el instanceof HTMLElement)) return () => {}
  const id = window.setTimeout(() => {
    const style = window.getComputedStyle(el)
    const opacity = Number.parseFloat(style.opacity)
    const hidden =
      style.visibility === 'hidden' ||
      opacity < 0.05 ||
      (style.clipPath &&
        style.clipPath !== 'none' &&
        /inset\(\s*0%?\s+0%?\s+100%/i.test(style.clipPath))
    if (hidden) forceVisible(el)
  }, ms)
  return () => window.clearTimeout(id)
}
