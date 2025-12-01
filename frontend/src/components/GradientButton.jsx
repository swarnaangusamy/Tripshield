// frontend/src/components/GradientButton.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function GradientButton({
  to,
  children,
  onClick,
  className = "",
  type = "button",  // <—— IMPORTANT: default is button, but can be overridden
}) {
  const Btn = (
    <button
      type={type}
      onClick={onClick}
      className={`btn-gradient btn ${className}`}
    >
      {children}
    </button>
  );

  if (to) {
    return (
      <Link to={to} className="text-decoration-none">
        {Btn}
      </Link>
    );
  }

  return Btn;
}
