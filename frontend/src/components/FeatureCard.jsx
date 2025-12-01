// frontend/src/components/FeatureCard.jsx
import React from "react";
import { motion } from "framer-motion";

export default function FeatureCard({ icon, title, text }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="ui-card glass p-3 h-100"
    >
      <div className="d-flex gap-3 align-items-start">
        <div style={{ width: 64, height: 64 }} className="rounded-3 d-flex align-items-center justify-content-center" aria-hidden>
          <div style={{
            width: 56, height: 56, borderRadius: 10, 
            background: 'linear-gradient(135deg, rgba(4,109,99,0.9), rgba(14,154,167,0.9))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(2,50,48,0.18)',
          }}>
            {icon}
          </div>
        </div>
        <div>
          <h5 className="mb-1 text-white">{title}</h5>
          <p className="text-muted-soft small mb-0">{text}</p>
        </div>
      </div>
    </motion.div>
  );
}
