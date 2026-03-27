import React, { useEffect, useState } from "react";
import supabase from "../Utilities/supabase";
import "bootstrap/dist/css/bootstrap.min.css";
import RootNumber from "../components/RootNumber";

export default function TorgetDisplay() {
  const [lanes, setLanes] = useState(Array(11).fill(""));
  const [message, setMessage] = useState("");

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
        className="bg-dark text-white d-flex align-items-center justify-content-center text-center"
        style={{ height: "15vh" }}
      >
        <div className="d-flex align-items-center justify-content-center gap-3">
          <img
            src="/arla-logo.png"
            alt="Logo"
            className="img-fluid"
            style={{ maxWidth: "120px" }}
          />
          <h1
            className="m-0 fw-bolder"
            style={{ fontSize: "calc(8vh + 2vw)", whiteSpace: "nowrap" }}
          >
            TORGET
          </h1>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-grow-1 d-flex flex-column ">
        {/* LANES SECTION */}
        <div className="p-2" style={{ height: "40%", overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(11, minmax(0, 1fr))",
              gap: "0.25rem",
              height: "100%",
            }}
          >
            {lanes.map((value, i) => (
              <div key={i} style={{ width: "100%", height: "100%" }}>
                <div
                  className="card shadow-sm border-top-0"
                  style={{ width: "100%", height: "100%" }}
                >
                  {/* Lane number */}
                  <div
                    style={{
                      fontSize: "clamp(1.2rem, 2vw, 2.5rem)",
                      textShadow: "0 0 6px rgba(12, 12, 12, 0.6)",
                    }}
                  >
                    <h1 className="card-header bg-dark text-light fw-bolder text-center">
                      {i + 1}
                    </h1>
                  </div>

                  {/* Lane content */}
                  <div
                    className="card-body d-flex justify-content-center align-items-center bg-light"
                    style={{
                      overflow: "hidden",
                      padding: "0.1rem",
                      borderTop: "1px solid #ffffff",
                    }}
                  >
                    {value && value.trim() !== "" ? (
                      <div
                        style={{
                          background:
                            "linear-gradient(145deg, #20f80383, rgb(28, 123, 50))",
                          boxShadow: "inset 1px 1px 10px rgb(0, 0, 0)",
                          borderRadius: "5px",
                          padding: "0.5rem 1rem",
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <RootNumber rootNr={value} />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MESSAGE SECTION */}
        <div
          className={
            message.trim()
              ? "d-flex justify-content-center align-items-center p-5 bg-warning"
              : "d-flex justify-content-center align-items-center p-5 bg-secondary text-white"
          }
          style={{ height: "60%", overflow: "hidden" }}
        >
          <div
            className="fw-bold text-center"
            style={{
              width: "100%",
              height: "100%",
              lineHeight: 1.1,
              overflow: "hidden",
              whiteSpace: "normal",
              padding: "0 1rem",
              fontSize: "clamp(1rem, 6vw, 8rem)",
            }}
          >
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}
