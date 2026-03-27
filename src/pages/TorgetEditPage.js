import React, { useEffect, useState } from "react";
import supabase from "../Utilities/supabase";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TorgetEditPage() {
  const [lanes, setLanes] = useState(Array(11).fill(""));
  const [original, setOriginal] = useState(Array(11).fill(""));

  // Message composer states
  const [msg, setMsg] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [msgExists, setMsgExists] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load existing lane values + message
  useEffect(() => {
    fetchTorgetData();
    fetchMessage();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchMessage, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTorgetData = async () => {
    const { data } = await supabase
      .from("torget")
      .select("*")
      .order("id", { ascending: true });

    if (!data) return;

    const laneValues = data.map((row) => row.rootNr || "");
    setLanes(laneValues);
    setOriginal(laneValues);
  };

const fetchMessage = async () => {
  const { data } = await supabase
    .from("torg_msg")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (!data || data.length === 0) {
    if (!isEditing) {
      setMsg("");
      setHours("");
      setMinutes("");
      setMsgExists(false);
    }
    return;
  }

  const m = data[0];

  const createdAt = new Date(m.created_at);
  const expiresAt = new Date(createdAt.getTime() + m.duration_minutes * 60000);
  const now = new Date();

  const isActive = now < expiresAt;

  if (isActive) {
    if (!isEditing) {
      setMsg(m.msg_text);

      const h = Math.floor(m.duration_minutes / 60);
      const min = m.duration_minutes % 60;

      setHours(h.toString());
      setMinutes(min.toString());
    }
    setMsgExists(true);
  } else {
    setMsgExists(false);

    if (!isEditing) {
      setMsg("");
      setHours("");
      setMinutes("");
    }
  }
};


  // Save a single lane
  const saveLane = async (index) => {
    const value = lanes[index];

    await supabase
      .from("torget")
      .update({ rootNr: value })
      .eq("id", index + 1);

    const updatedOriginal = [...original];
    updatedOriginal[index] = value;
    setOriginal(updatedOriginal);
  };

  // Clear lane
  const clearLane = async (index) => {
    const confirmDelete = window.confirm(
      `Är du säker på att du vill rensa Bana ${index + 1}?`,
    );
    if (!confirmDelete) return;

    const updated = [...lanes];
    updated[index] = "";
    setLanes(updated);

    await supabase
      .from("torget")
      .update({ rootNr: "" })
      .eq("id", index + 1);

    const updatedOriginal = [...original];
    updatedOriginal[index] = "";
    setOriginal(updatedOriginal);
  };

  // Capitalize first letter of each sentence
  const formatMessage = (text) => {
    return text.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  };

  // Validate time
  const isTimeValid = () => {
    const h = Number(hours);
    const m = Number(minutes);
    if (isNaN(h) || isNaN(m)) return false;
    if (h < 0 || h > 23) return false;
    if (m < 0 || m > 59) return false;
    return h + m > 0; // must be > 0 minutes
  };

  // Save message
  const sendMessage = async () => {
    if (!isTimeValid() || msg.trim() === "") return;

    const duration_minutes = Number(hours) * 60 + Number(minutes);

    await supabase.from("torg_msg").insert([
      {
        msg_text: formatMessage(msg.trim()),
        duration_minutes,
      },
    ]);
    setIsEditing(false); // ← ADD THIS
    setMsgExists(true);
  };

  // Clear message
  const clearMessage = async () => {
    const confirmClear = window.confirm("Rensa meddelandet?");
    if (!confirmClear) return;

    await supabase.from("torg_msg").delete().neq("id", 0);
    setIsEditing(false); // ← ADD THIS
    setMsg("");
    setHours("");
    setMinutes("");
    setMsgExists(false);
  };

  return (
    <div className="container-fluid py-4" style={{ maxWidth: "1800px" }}>
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-center mb-4">
        <img
          src="/arla-logo.png"
          alt="Arla"
          style={{
            height: "70px",
            marginRight: "15px",
            filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))",
          }}
        />
        <h1
          className="fw-bold m-0"
          style={{
            fontSize: "2.8rem",
            textShadow: "0 2px 4px rgba(0,0,0,0.25)",
          }}
        >
          Torget – Adminpanel
        </h1>
      </div>

      {/* 11-COLUMN GRID */}
      <div
        className="d-grid mb-5"
        style={{
          gridTemplateColumns: "repeat(11, 1fr)",
          gap: "1rem",
          width: "100%",
        }}
      >
        {lanes.map((value, i) => {
          const used = value.trim() !== "";
          const changed = value !== original[i];
          const showSave = changed && value.trim() !== "";
          const showDelete = used;

          return (
            <div
              key={i}
              className="p-3 rounded d-flex flex-column"
              style={{
                border: "1px solid #c8c8c8",
                background: used
                  ? "linear-gradient(180deg, #ffd86b 0%, #ffca3a 100%)"
                  : "linear-gradient(180deg, #ffffff 0%, #f3f3f3 100%)",
                minHeight: "200px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              <div
                className="fw-bold text-white text-center mb-3"
                style={{
                  background: "#2d2d2d",
                  borderRadius: "6px",
                  padding: "0.45rem 0",
                  fontSize: "1.2rem",
                }}
              >
                Bana {i + 1}
              </div>

              <input
                type="text"
                maxLength={4}
                className="form-control text-center mb-3"
                style={{
                  fontSize: "1.6rem",
                  padding: "0.7rem",
                  border: "2px solid #bfbfbf",
                  borderRadius: "8px",
                  textTransform: "uppercase",
                }}
                value={value}
                onChange={(e) => {
                  const updated = [...lanes];
                  updated[i] = e.target.value.toUpperCase();
                  setLanes(updated);
                }}
              />

              {(showSave || showDelete) && (
                <div className="d-flex flex-column gap-2">
                  {showSave && (
                    <button
                      className="btn save-btn"
                      style={{
                        width: "100%",
                        fontSize: "1.3rem",
                        padding: "0.5rem 0",
                        background: "#28a745",
                        color: "white",
                        border: "2px solid #28a745",
                        borderRadius: "8px",
                        fontWeight: "bold",
                      }}
                      onClick={() => saveLane(i)}
                    >
                      💾 Spara
                    </button>
                  )}

                  {showDelete && (
                    <button
                      className="btn delete-btn"
                      style={{
                        width: "100%",
                        fontSize: "1.3rem",
                        padding: "0.5rem 0",
                        background: "#dc3545",
                        color: "white",
                        border: "2px solid #dc3545",
                        borderRadius: "8px",
                      }}
                      onClick={() => clearLane(i)}
                    >
                      ❌ Rensa
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MESSAGE COMPOSER */}
      <div
        className="p-4 rounded shadow-sm"
        style={{
          border: "1px solid #c8c8c8",
          background: "linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%)",
        }}
      >
        <h3 className="fw-bold mb-3">📢 Meddelande till Torget-display</h3>

        <textarea
          maxLength={100}
          className="form-control mb-3"
          rows={3}
          style={{
            fontSize: "1.4rem",
            padding: "1rem",
            border: "2px solid #bfbfbf",
            borderRadius: "8px",
          }}
          value={msg}
          onChange={(e) => {
            setIsEditing(true);
            setMsg(formatMessage(e.target.value));
          }}
          placeholder="Skriv ett meddelande (max 100 tecken)..."
        />

        <div className="d-flex align-items-center gap-3 mb-3">
          <label className="fw-bold">⏱ Tid:</label>

          <input
            type="number"
            min={0}
            max={23}
            className="form-control"
            style={{ width: "100px", fontSize: "1.3rem" }}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="Tim"
          />

          <input
            type="number"
            min={0}
            max={59}
            className="form-control"
            style={{ width: "100px", fontSize: "1.3rem" }}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="Min"
          />
        </div>

        {/* Buttons only when needed */}
        {msg.trim() !== "" && isTimeValid() && (
          <button
            className="btn btn-success me-3"
            style={{ fontSize: "1.3rem", padding: "0.6rem 1.2rem" }}
            onClick={sendMessage}
          >
            {msgExists ? "🔄 Uppdatera meddelande" : "📤 Skicka meddelande"}
          </button>
        )}

        {msgExists && (
          <button
            className="btn btn-danger"
            style={{ fontSize: "1.3rem", padding: "0.6rem 1.2rem" }}
            onClick={clearMessage}
          >
            ❌ Rensa meddelande
          </button>
        )}
      </div>

      {/* Hover styles */}
      <style>{`
        .save-btn:hover {
          background: #218838 !important;
          transform: translateY(-2px);
        }
        .delete-btn:hover {
          background: #c82333 !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
