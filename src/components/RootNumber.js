import React from "react";

const RootNumber = ({ rootNr }) => {
  if (!rootNr) return null;

  // Convert to string and split into characters
  const chars = String(rootNr).split("");

  return (
    <div style={{ fontWeight: 900 }}>
      {chars.map((ch, i) => {
        const isLetter = /[A-Za-z]/.test(ch);

        return (
          <span
            key={i}
            style={{
              color: isLetter ? "#ff9d00" : "white", // Blue letter, white numbers
              textShadow: isLetter
                ? "0px 0px 12px rgba(0, 0, 0, 0.75)"
                : "1px 12px 15px rgba(55, 115, 47, 0.97)",
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

export default RootNumber;
