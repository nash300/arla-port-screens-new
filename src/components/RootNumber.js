import React from "react";

const RootNumber = ({ rootNr }) => {
  if (!rootNr) return null;

  // Convert to string and split into characters
  const chars = String(rootNr).split("");

  return (
    <div className="shiny-text" style={{ fontWeight: 900 }}>
      {chars.map((ch, i) => {
        const isLetter = /[A-Za-z]/.test(ch);

        return (
          <span
            key={i}
            style={{
              color: isLetter ? "#ff0505" : "white", // Blue letter, white numbers
              textShadow: isLetter
                ? "0px 0px 12px rgba(0, 0, 0, 0.8)"
                : "1px 12px 15px rgba(0,0,0,0.54)",
            }}
          >
            {ch}
          </span>
        );
      })}

      <style>
        {`
          .shiny-text {
            text-shadow:
              1px 12px 15px rgba(0, 0, 0, 0.54),
              0 0 0px rgba(255,255,255,0.6);
          }
        `}
      </style>
    </div>
  );
};

export default RootNumber;
