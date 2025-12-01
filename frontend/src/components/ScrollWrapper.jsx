// frontend/src/components/ScrollWrapper.jsx
// small helper: adds "in-view" class when element scrolls into view (no external lib required).
import React, { useEffect, useRef, useState } from "react";

export default function ScrollWrapper({ children, className = "", rootMargin = "0px 0px -120px 0px" }) {
  const ref = useRef();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setInView(true);
        });
      },
      { root: null, rootMargin, threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, rootMargin]);

  return (
    <div ref={ref} className={`${className} ${inView ? "in-view" : ""}`}>
      {children}
    </div>
  );
}
