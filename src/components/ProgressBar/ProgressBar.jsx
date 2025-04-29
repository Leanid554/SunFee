import React from "react";
import "./ProgressBar.scss";

const ProgressBar = ({ value }) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  // Define the full gradient stops
  const gradientStops = [
    { percent: 0, color: "#f44336" }, // Red
    { percent: 15, color: "#f75f3b" }, // Orange-red
    { percent: 30, color: "#f9843d" }, // Orange
    { percent: 45, color: "#f9a825" }, // Yellow-orange
    { percent: 60, color: "#cddc39" }, // Lime
    { percent: 75, color: "#8bc34a" }, // Light green
    { percent: 100, color: "#4caf50" }, // Green
  ];

  // Calculate the gradient for the given progress
  const getGradient = (progress) => {
    if (progress === 0)
      return "linear-gradient(to right, #e0e0e0 0%, #e0e0e0 100%)";

    // Find the color at the progress point
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

    // Interpolate the color for the progress
    const relativeProgress =
      (progress - startPercent) / (endPercent - startPercent);
    const interpolatedPercent = relativeProgress * 100;

    // Create a gradient from the start color to the interpolated color
    return `linear-gradient(to right, ${startColor} 0%, ${endColor} ${interpolatedPercent}%)`;
  };

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
