// frontend/src/components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="mt-auto py-3">
      <div className="container">
        <div className="glass p-3 d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="text-white small">
            created on 2025 by SOS Webcrafters team, 25mxians.
          </div>
          <div className="text-muted-soft small mt-2 mt-md-0">
            <span className="me-3">Privacy</span>
            <span className="me-3">Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
