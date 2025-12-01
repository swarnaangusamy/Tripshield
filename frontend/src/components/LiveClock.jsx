// frontend/src/components/LiveClock.jsx
import React, { useEffect, useState } from "react";

function formatDateTime(date) {
  // Example format: Mon, Dec 01 2025 — 14:22:05
  const dayName = date.toLocaleDateString(undefined, { weekday: "short" });
  const monthName = date.toLocaleDateString(undefined, { month: "short" });
  const dayNum = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  const time = date.toLocaleTimeString();
  return `${dayName}, ${monthName} ${dayNum} ${year} — ${time}`;
}

export default function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="text-white small glass-soft px-3 py-1 rounded d-none d-md-inline-block">
      <span className="me-2" aria-hidden>🕒</span>
      <span style={{ whiteSpace: "nowrap" }}>{formatDateTime(now)}</span>
    </div>
  );
}
