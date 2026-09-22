// src/components/Dashboard/MonitoringChart.jsx
import React from 'react';

const DonutSegment = ({ percent, color, startAngle = 0 }) => {
  const radius = 40;
  const angle = (percent / 100) * 2 * Math.PI;
  const endAngle = startAngle + angle;
  const startX = 50 + radius * Math.sin(startAngle);
  const startY = 50 - radius * Math.cos(startAngle);
  const endX = 50 + radius * Math.sin(endAngle);
  const endY = 50 - radius * Math.cos(endAngle);
  const largeArc = angle > Math.PI ? 1 : 0;
  const d = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
  return <path d={d} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />;
};

export default function MonitoringChart({ releaseCount, reviewCount, totalDocs }) {
  const submit = totalDocs > 0 ? (releaseCount / totalDocs) * 100 : 0;
  const returnSubmit = totalDocs > 0 ? (reviewCount / totalDocs) * 100 : 0;
  const others = Math.max(0, 100 - submit - returnSubmit);

  // Urutan segmen: Submit (biru), Return Submit (merah), Others (abu)
  const segments = [
    { value: submit, color: '#3b82f6' },   // blue-500
    { value: returnSubmit, color: '#ef4444' }, // red-500
    { value: others, color: '#cbd5e1' },    // slate-300
  ];

  let cumulativeAngle = 0;
  const arcs = segments.map((seg) => {
    const start = cumulativeAngle;
    const end = start + (seg.value / 100) * 2 * Math.PI;
    cumulativeAngle = end;
    return { ...seg, startAngle: start, endAngle: end };
  });

  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        {/* Background circle (optional) */}
        <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" className="dark:stroke-slate-700" />
        {arcs.map((seg, idx) => (
          <DonutSegment
            key={idx}
            percent={seg.value}
            color={seg.color}
            startAngle={seg.startAngle}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-slate-700 dark:text-white">{totalDocs}</span>
      </div>
    </div>
  );
}