import React from "react";
import "./ProgressBar.scss";

// Отображение названий stanowiska на числовые значения
const stanowiskoMap = {
  "Kandydat na Doradcę Energetycznego": 11,
  "Specjalista ds. podstaw OZE": 22,
  "Asystent Techniczny ds. Energetycznych": 33,
  "Koordynator ds. Klienta i Finansowania": 44,
  "Analityk ds. Etapowości Sprzedaży": 55,
  "Konsultant ds. Umawiania Spotkań": 66,
  "Doradca ds. Bezpośrednich Spotkań": 77,
  "Młodszy Doradca Energetyczny": 88,
  "Doradca Energetyczny": 100,
};

// Градиентные остановки
const gradientStops = [
  { percent: 0, color: "#f44336" }, // Red
  { percent: 15, color: "#f75f3b" }, // Orange-red
  { percent: 30, color: "#f9843d" }, // Orange
  { percent: 45, color: "#f9a825" }, // Yellow-orange
  { percent: 60, color: "#cddc39" }, // Lime
  { percent: 75, color: "#8bc34a" }, // Light green
  { percent: 100, color: "#4caf50" }, // Green
];

const getGradient = (progress) => {
  if (progress === 0)
    return "linear-gradient(to right, #e0e0e0 0%, #e0e0e0 100%)";

  let startColor = gradientStops[0].color;
  let endColor = gradientStops[0].color;
  let startPercent = 0;
  let endPercent = 0;

  for (let i = 0; i < gradientStops.length - 1; i++) {
    if (progress <= gradientStops[i + 1].percent) {
      startColor = gradientStops[i].color;
      endColor = gradientStops[i + 1].color;
      startPercent = gradientStops[i].percent;
      endPercent = gradientStops[i + 1].percent;
      break;
    }
  }

  const relativeProgress =
    (progress - startPercent) / (endPercent - startPercent);
  const interpolatedPercent = relativeProgress * 100;

  return `linear-gradient(to right, ${startColor} 0%, ${endColor} ${interpolatedPercent}%)`;
};

const ProgressBar = ({ stanowisko }) => {
  const numericValue = stanowiskoMap[stanowisko] || 0;
  const clampedValue = Math.min(100, Math.max(0, numericValue));

  return (
    <div className="progress-bar">
      <div
        className="progress-bar__fill"
        style={{
          width: `${clampedValue}%`,
          background: getGradient(clampedValue),
        }}
      />
    </div>
  );
};

export default ProgressBar;
