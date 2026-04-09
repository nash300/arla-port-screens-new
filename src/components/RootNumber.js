import React, { useEffect, useRef, useState } from "react";

const RootNumber = ({ rootNr }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [scale, setScale] = useState(1);

  const chars = rootNr ? String(rootNr).toUpperCase().split("") : [];

  useEffect(() => {
    let frame1, frame2, frame3;

    const measure = () => {
      const container = containerRef.current;
      const text = textRef.current;
      if (!container || !text) return;

      const cw = container.clientWidth;
      const ch = container.clientHeight;

      const tb = text.getBoundingClientRect();
      if (!tb.width || !tb.height) return;

      const s = Math.min(cw / tb.width, ch / tb.height, 1);
      setScale(s);
    };

    // Run measurement 3 times to ensure layout is stable
    frame1 = requestAnimationFrame(() => {
      measure();
      frame2 = requestAnimationFrame(() => {
        measure();
        frame3 = requestAnimationFrame(() => {
          measure();
        });
      });
    });

    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
      cancelAnimationFrame(frame3);
    };
  }, [rootNr]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        ref={textRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center",
          fontWeight: 900,
          whiteSpace: "nowrap",
          lineHeight: 1,
          fontSize: "200px", // large base size
          visibility: rootNr ? "visible" : "hidden",
        }}
      >
        {chars.map((ch, i) => {
          const isLetter = /[A-Z]/.test(ch);

          return (
            <span
              key={i}
              style={{
                color: isLetter ? "#edc476" : "white",
                textShadow: isLetter
                  ? "0px 0px 12px rgb(0, 0, 0)"
                  : "1px 12px 15px rgba(55, 115, 47, 0.97)",
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default RootNumber;
