import gsap from 'gsap';

export const isReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Stagger entrance for question cards or list items
export const animateCardsEntrance = (containerSelector: string | HTMLElement, itemSelector: string = '.animate-card') => {
  if (isReducedMotion()) return;

  const ctx = gsap.context(() => {
    gsap.from(itemSelector, {
      opacity: 0,
      y: 20,
      duration: 0.45,
      stagger: 0.05,
      ease: 'power2.out',
      clearProps: 'all'
    });
  }, containerSelector);

  return () => ctx.revert();
};

// Animated number counter for scores
export const animateScoreCounter = (
  target: { val: number }, 
  endVal: number, 
  onUpdate: () => void, 
  duration: number = 1.0
) => {
  if (isReducedMotion()) {
    target.val = endVal;
    onUpdate();
    return;
  }

  return gsap.to(target, {
    val: endVal,
    duration,
    ease: 'power3.out',
    onUpdate,
    onComplete: () => {
      target.val = endVal;
      onUpdate();
    }
  });
};

// Subtle celebratory pulse
export const animateSuccessPulse = (element: HTMLElement | null) => {
  if (!element || isReducedMotion()) return;

  gsap.fromTo(element, 
    { scale: 0.94 }, 
    { scale: 1, duration: 0.4, ease: 'back.out(2)' }
  );
};
