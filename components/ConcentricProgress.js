
import React from 'react';

const ProgressCircle = ({ radius, stroke, progress, color, backgroundColor, animatePulse }) => {
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    React.createElement('g', null,
      React.createElement('circle', {
        className: backgroundColor,
        strokeWidth: stroke,
        stroke: "currentColor",
        fill: "transparent",
        r: normalizedRadius,
        cx: 125,
        cy: 125
      }),
      React.createElement('circle', {
        className: `${color} ${animatePulse ? 'animate-pulse' : ''}`,
        strokeWidth: stroke,
        strokeDasharray: circumference + ' ' + circumference,
        style: { strokeDashoffset, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' },
        stroke: "currentColor",
        fill: "transparent",
        r: normalizedRadius,
        cx: 125,
        cy: 125,
        strokeLinecap: "round"
      })
    )
  );
};

const ConcentricProgress = ({ summary, calorieGoal, macroGoals, caloriesBurned }) => {
  const proteinProgress = macroGoals.protein > 0 ? (summary.protein / macroGoals.protein) * 100 : 0;
  const carbsProgress = macroGoals.carbs > 0 ? (summary.carbs / macroGoals.carbs) * 100 : 0;
  const fatsProgress = macroGoals.fats > 0 ? (summary.fats / macroGoals.fats) * 100 : 0;

  const remainingCalories = Math.round(calorieGoal + caloriesBurned - summary.calories);

  return (
    React.createElement("div", { className: "bg-card dark:bg-dark-card rounded-2xl p-6 shadow-sm flex flex-col items-center" },
      React.createElement("div", { className: "relative w-[250px] h-[250px]" },
        React.createElement("svg", { className: "w-full h-full", viewBox: "0 0 250 250" },
          React.createElement(ProgressCircle, {
            radius: 110, stroke: 18,
            progress: proteinProgress,
            color: "text-protein",
            backgroundColor: "text-protein-light",
            animatePulse: proteinProgress >= 100
          }),
          React.createElement(ProgressCircle, { radius: 85, stroke: 18, progress: carbsProgress, color: "text-carbs", backgroundColor: "text-carbs-light" }),
          React.createElement(ProgressCircle, { radius: 60, stroke: 18, progress: fatsProgress, color: "text-fats", backgroundColor: "text-fats-light" })
        ),
        React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-center" },
          React.createElement("p", { className: "text-4xl font-extrabold text-primary" }, remainingCalories),
          React.createElement("p", { className: "text-sm text-text-light dark:text-dark-text-light" }, "Remaining")
        )
      ),
      React.createElement("div", { className: "flex justify-around w-full mt-6" },
        React.createElement("div", { className: "text-center" },
            React.createElement("p", { className: "font-bold text-lg text-protein" }, `${Math.round(summary.protein)}/${macroGoals.protein}g`),
            React.createElement("p", { className: "text-xs text-text-light dark:text-dark-text-light" }, "Protein")
        ),
        React.createElement("div", { className: "text-center" },
            React.createElement("p", { className: "font-bold text-lg text-carbs" }, `${Math.round(summary.carbs)}/${macroGoals.carbs}g`),
            React.createElement("p", { className: "text-xs text-text-light dark:text-dark-text-light" }, "Carbs")
        ),
        React.createElement("div", { className: "text-center" },
            React.createElement("p", { className: "font-bold text-lg text-fats" }, `${Math.round(summary.fats)}/${macroGoals.fats}g`),
            React.createElement("p", { className: "text-xs text-text-light dark:text-dark-text-light" }, "Fats")
        )
      )
    )
  );
};

export default ConcentricProgress;
