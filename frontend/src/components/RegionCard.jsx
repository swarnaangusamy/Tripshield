// frontend/src/components/RegionCard.jsx
import React from 'react';

export default function RegionCard({ item }) {
  // item: { region, incidents, score }
  const { region, incidents, score } = item || {};
  // placeholder image using initials (you can replace with real images)
  const initials = (region || 'Unknown').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();

  return (
    <div className="text-center" style={{ width: 150 }}>
      <div
        className="rounded-circle d-flex align-items-center justify-content-center mb-2"
        style={{
          width: 110,
          height: 110,
          overflow: 'hidden',
          border: '6px solid rgba(255,255,255,0.06)',
          background: 'linear-gradient(135deg, rgba(14,154,167,0.12), rgba(4,109,99,0.08))',
          boxShadow: '0 8px 24px rgba(4,109,99,0.06)'
        }}
      >
        <div style={{ fontSize: 28, color: '#fff' }}>{initials}</div>
      </div>

      <div className="text-white fw-semibold small">{region || 'Unknown'}</div>
      <div className="text-white-50 small">{score}/100</div>
      <div className="text-white-50 xsmall">{incidents} incidents</div>
    </div>
  );
}
