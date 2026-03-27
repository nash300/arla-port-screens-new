import React, { useEffect, useState } from "react";
import supabase from "../Utilities/supabase";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TorgetEditPage() {
  const [lanes, setLanes] = useState(Array(11).fill(""));
  const [original, setOriginal] = useState(Array(11).fill(""));
  const [status, setStatus] = useState("");

  // Auto-hide status after 3 seconds
  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(""), 3000);
    return () => clearTimeout(timer);
  }, [status]);

  // Load existing values
  const fetchTorgetData = async () => {
    const { data, error } = await supabase
      .from("torget")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      setStatus("Fel vid hämtning av data");
      return;
    }

    const laneValues = data.map((row) => row.rootNr || "");
    setLanes(laneValues);
    setOriginal(laneValues);
  };

  useEffect(() => {
    fetchTorgetData();
  }, []);

  // Save a single lane
  const saveLane = async (index) => {
    const value = lanes[index];

    const { error } = await supabase
      .from("torget")
      .update({ rootNr: value })
      .eq("id", index + 1);

    if (error) {
      console.error(error);
      setStatus(`Fel vid uppdatering av bana ${index + 1}`);
    } else {
      setStatus(`Bana ${index + 1} sparad`);
      const updatedOriginal = [...original];
      updatedOriginal[index] = value;
      setOriginal(updatedOriginal);
    }
  };

  // Clear lane with confirmation
  const clearLane = async (index) => {
    const confirmDelete = window.confirm(
      `Är du säker på att du vill rensa Bana ${index + 1}?`,
    );

    if (!confirmDelete) return;

    const updated = [...lanes];
    updated[index] = "";
    setLanes(updated);

    const { error } = await supabase
      .from("torget")
      .update({ rootNr: "" })
      .eq("id", index + 1);

    if (error) {
      console.error(error);
      setStatus(`Fel vid rensning av bana ${index + 1}`);
    } else {
      setStatus(`Bana ${index + 1} rensad`);
      const updatedOriginal = [...original];
      updatedOriginal[index] = "";
      setOriginal(updatedOriginal);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ maxWidth: "1800px" }}>
      {/* HEADER WITH LOGO */}
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

      {status && (
        <div
          className="alert alert-info text-center mx-auto"
          style={{ maxWidth: "600px" }}
        >
          {status}
        </div>
      )}

      {/* 11-COLUMN GRID */}
      <div
        className="d-grid"
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
              {/* Lane number */}
              <div
                className="fw-bold text-white text-center mb-3"
                style={{
                  background: "#2d2d2d",
                  borderRadius: "6px",
                  padding: "0.45rem 0",
                  fontSize: "1.2rem",
                  boxShadow: "inset 0 0 6px rgba(0,0,0,0.4)",
                }}
              >
                Bana {i + 1}
              </div>

              {/* Input */}
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
                placeholder=""
                onChange={(e) => {
                  const updated = [...lanes];
                  updated[i] = e.target.value.toUpperCase();
                  setLanes(updated);
                }}
              />

              {/* Buttons only appear when needed */}
              {(showSave || showDelete) && (
                <div className="d-flex flex-column gap-2">
                  {/* Save */}
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
                        transition: "0.2s",
                      }}
                      onClick={() => saveLane(i)}
                    >
                      💾 Spara
                    </button>
                  )}

                  {/* Delete */}
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
                        transition: "0.2s",
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

      {/* Hover styles */}
      <style>{`
        .save-btn:hover {
          background: #218838 !important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(33,136,56,0.4);
        }

        .delete-btn:hover {
          background: #c82333 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(200,35,51,0.4);
        }
      `}</style>
    </div>
  );
}
