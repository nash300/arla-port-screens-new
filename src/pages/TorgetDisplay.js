import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import supabase from "../Utilities/supabase";
import "bootstrap/dist/css/bootstrap.min.css";
import RootNumber from "../components/RootNumber";

function FittedMessage({ text }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [fontSize, setFontSize] = useState(96);

  useLayoutEffect(() => {
    let frameId;

    const measure = () => {
      const container = containerRef.current;
      const textElement = textRef.current;
      if (!container || !textElement) return;

      const maxWidth = container.clientWidth;
      const maxHeight = container.clientHeight;
      if (!maxWidth || !maxHeight) return;

      let low = 28;
      let high = 150;
      let best = low;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        textElement.style.fontSize = `${mid}px`;

        const fits =
          textElement.scrollWidth <= maxWidth + 1 &&
          textElement.scrollHeight <= maxHeight + 1;

        if (fits) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      setFontSize(best);
    };

    frameId = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", measure);
    };
  }, [text]);

  return (
    <div ref={containerRef} className="torget-message-fit">
      <div
        ref={textRef}
        className="torget-message-text fw-bold text-center"
        style={{ fontSize }}
      >
        {text}
      </div>
    </div>
  );
}

export default function TorgetDisplay() {
  const [lanes, setLanes] = useState(Array(11).fill(""));
  const [message, setMessage] = useState("");
  const hasMessage = message.trim() !== "";

  // Fetch lanes + message
  const fetchTorgetData = async () => {
    try {
      // Fetch lanes
      const { data: laneData } = await supabase
        .from("torget")
        .select("*")
        .order("id", { ascending: true });

      if (laneData) {
        const laneValues = laneData.map((row) => row.rootNr || "");
        setLanes(laneValues);
      }

      // Fetch latest message
      const { data: msgData } = await supabase
        .from("torg_msg")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (msgData && msgData.length > 0) {
        const m = msgData[0];

        const createdAt = new Date(m.created_at);
        const expiresAt = new Date(
          createdAt.getTime() + m.duration_minutes * 60000,
        );
        const now = new Date();

        if (now < expiresAt) {
          setMessage(m.msg_text);
        } else {
          setMessage("");
        }
      } else {
        setMessage("");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTorgetData();
  }, []);

  // Auto-refresh message every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchTorgetData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Realtime updates for lanes + messages
  useEffect(() => {
    let reloadTimeout = null;

    const channel = supabase
      .channel("realtime-torget-display")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "torget" },
        () => {
          if (reloadTimeout) clearTimeout(reloadTimeout);
          reloadTimeout = setTimeout(() => {
            window.location.reload();
          }, 150);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "torg_msg" },
        () => {
          fetchTorgetData();
        },
      )
      .subscribe();

    return () => {
      if (reloadTimeout) clearTimeout(reloadTimeout);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="vh-100 d-flex flex-column overflow-hidden">
      {/* HEADER */}
      <div
        className="torget-display-header bg-dark text-white d-flex align-items-center justify-content-center text-center"
      >
        <div className="d-flex align-items-center justify-content-center gap-3">
          <img
            src="/arla-logo.png"
            alt="Logo"
            className="img-fluid"
          />
          <h1 className="m-0 fw-bolder">
            TORGET
          </h1>
        </div>
      </div>

      {/* MAIN AREA */}
      <div
        className={`torget-display-main flex-grow-1 ${
          hasMessage ? "has-message" : "no-message"
        }`}
      >
        {/* MESSAGE SECTION */}
        {hasMessage && (
          <div className="torget-message-alert d-flex justify-content-center align-items-center">
            <FittedMessage text={message} />
          </div>
        )}

        {/* LANES SECTION */}
        <div className="torget-lanes-section">
          <div className="torget-lanes-grid">
            {lanes.map((value, i) => (
              <div key={i} className="torget-lane-shell">
                <div className="torget-lane-card">
                  {/* Lane number */}
                  <h1 className="torget-lane-header">
                    {i + 1}
                  </h1>

                  {/* Lane content */}
                  <div className="torget-lane-body">
                    {value && value.trim() !== "" ? (
                      <div className="torget-route-box">
                        <RootNumber
                          rootNr={value}
                          baseFontSize={520}
                          fontFamily={'"Arial Narrow", "Segoe UI Condensed", Impact, sans-serif'}
                          horizontalScale={0.7}
                          verticalOffset="-7%"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .torget-display-header {
          flex: 0 0 clamp(84px, 12svh, 165px);
        }

        .torget-display-header img {
          width: clamp(76px, 7.2vw, 130px);
          max-height: 78%;
          object-fit: contain;
        }

        .torget-display-header h1 {
          font-size: clamp(4rem, 8.8svh, 8.8rem);
          line-height: 0.92;
          white-space: nowrap;
        }

        .torget-display-main {
          display: grid;
          overflow: hidden;
          padding: clamp(6px, 0.8vw, 16px);
          background:
            radial-gradient(circle at 18% 22%, rgba(103, 194, 116, 0.13), transparent 34%),
            radial-gradient(circle at 82% 72%, rgba(255, 193, 7, 0.13), transparent 32%),
            linear-gradient(90deg, rgba(255, 255, 255, 0.32) 1px, transparent 1px),
            linear-gradient(180deg, rgba(255, 255, 255, 0.32) 1px, transparent 1px),
            linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(232, 237, 240, 0.94)),
            #e8edf0;
          background-size:
            auto,
            auto,
            72px 72px,
            72px 72px,
            auto,
            auto;
          min-height: 0;
        }

        .torget-display-main.no-message {
          grid-template-rows: minmax(0, 16fr) minmax(0, 68fr) minmax(0, 16fr);
          align-items: stretch;
        }

        .torget-display-main.has-message {
          grid-template-rows: minmax(0, 44fr) minmax(0, 56fr);
          gap: clamp(6px, 1vh, 12px);
          align-items: stretch;
        }

        .torget-message-alert {
          background:
            linear-gradient(180deg, #ffd34f 0%, #ffc107 55%, #f0a900 100%);
          color: #111827;
          border: 3px solid #1f2328;
          border-radius: 6px;
          min-height: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          padding: clamp(12px, 1.6vw, 26px);
          box-shadow:
            inset 0 2px 0 rgba(255, 255, 255, 0.45),
            inset 0 -14px 24px rgba(95, 67, 0, 0.12),
            0 4px 14px rgba(17, 24, 39, 0.18);
          animation: torgetMessageBlink 3.8s ease-in-out infinite;
        }

        .torget-message-fit {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .torget-message-text {
          width: 100%;
          max-width: 100%;
          line-height: 1.04;
          overflow: hidden;
          overflow-wrap: anywhere;
          white-space: normal;
          letter-spacing: 0;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.25);
        }

        .torget-lanes-section {
          width: 100%;
          height: 100%;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .torget-display-main.no-message .torget-lanes-section {
          grid-row: 2;
        }

        .torget-display-main.has-message .torget-lanes-section {
          grid-row: 2;
        }

        .torget-lanes-grid {
          display: grid;
          grid-template-columns: repeat(11, minmax(0, 1fr));
          gap: 0;
          width: 100%;
          height: 100%;
          border: 3px solid #111827;
          border-radius: 6px;
          overflow: hidden;
          background: #111827;
          box-shadow:
            0 4px 14px rgba(17, 24, 39, 0.2),
            0 1px 0 rgba(255, 255, 255, 0.65);
        }

        .torget-lane-shell,
        .torget-lane-card {
          width: 100%;
          height: 100%;
          max-height: 100%;
          min-height: 0;
          min-width: 0;
          overflow: hidden;
        }

        .torget-lane-card {
          display: grid;
          grid-template-rows: minmax(0, 20fr) minmax(0, 80fr);
          border-radius: 0;
          border-left: 0;
          border-top: 0;
          border-bottom: 0;
          border-right: 2px solid #151a1f;
          overflow: hidden;
          background: #f5f7f9;
        }

        .torget-lane-shell:last-child .torget-lane-card {
          border-right: 0;
        }

        .torget-lane-header {
          font-size: clamp(2rem, 3vw, 3.8rem);
          font-family: "Arial Narrow", "Segoe UI Condensed", Impact, sans-serif;
          line-height: 1;
          color: #f8fafc;
          background:
            linear-gradient(180deg, #292f35 0%, #1f2328 70%, #171b20 100%);
          font-weight: 900;
          text-align: center;
          margin: 0;
          height: auto;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          text-shadow: 0 2px 5px rgba(0, 0, 0, 0.65);
          border-radius: 0;
          border-right: 1px solid rgba(255, 255, 255, 0.12);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0;
        }

        .torget-lane-body {
          position: relative;
          height: auto;
          min-height: 0;
          overflow: hidden;
          padding: 0;
          border-top: 2px solid #111827;
          background:
            radial-gradient(circle at 50% 24%, rgba(255, 255, 255, 0.92), transparent 34%),
            linear-gradient(180deg, #fbfdfe 0%, #f2f6f8 48%, #e3e9ee 100%) !important;
        }

        .torget-lane-body::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(90deg, rgba(255, 255, 255, 0.52), transparent 12%, transparent 88%, rgba(17, 24, 39, 0.08)),
            repeating-linear-gradient(
              135deg,
              rgba(17, 24, 39, 0.018) 0,
              rgba(17, 24, 39, 0.018) 1px,
              transparent 1px,
              transparent 14px
            );
          opacity: 0.8;
        }

        .torget-route-box {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0;
          padding: clamp(4px, 0.5vw, 10px);
          background:
            radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.42), transparent 28%),
            linear-gradient(180deg, #82ee80 0%, #30b64f 50%, #106b2d 100%);
          border: 0;
          box-shadow:
            inset 0 3px 10px rgba(255, 255, 255, 0.34),
            inset 0 -18px 26px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(10, 92, 34, 0.85),
            0 2px 8px rgba(17, 24, 39, 0.22);
        }

        @keyframes torgetMessageBlink {
          0%,
          100% {
            background:
              linear-gradient(180deg, #ffd34f 0%, #ffc107 55%, #f0a900 100%);
            color: #111827;
          }

          50% {
            background:
              linear-gradient(180deg, #3b4148 0%, #2f3338 100%);
            color: #ffe08a;
          }
        }
      `}</style>
    </div>
  );
}
