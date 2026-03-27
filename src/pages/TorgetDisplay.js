import React, { useEffect, useState } from "react";
import supabase from "../Utilities/supabase";
import "bootstrap/dist/css/bootstrap.min.css";
import RootNumber from "../components/RootNumber";

export default function TorgetDisplay() {
  const [lanes, setLanes] = useState(Array(11).fill(""));
  const [message, setMessage] = useState("");

  const fetchTorgetData = async () => {
    try {
      const { data, error } = await supabase
        .from("torget")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Supabase query error:", error);
        return;
      }

      // Map DB rows → lane values
      const laneValues = data.map((row) => row.rootNr || "");
      setLanes(laneValues);

      // If you later add a message column:
      // setMessage(data[0]?.message || "");
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  useEffect(() => {
    fetchTorgetData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("realtime-torget")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "torget",
        },
        () => fetchTorgetData(),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
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
              gridTemplateColumns: "repeat(11, 1fr)",
              gap: "0.25rem",
              height: "100%",
            }}
          >
            {lanes.map((value, i) => (
              <div key={i} className="h-100 d-flex">
                <div className="card w-100 h-100 shadow-sm border-dark border-3 border-top-0">
                  {/* Lane number */}
                  <div
                    className="card-header bg-dark text-light fw-bold text-center"
                    style={{
                      fontSize: "clamp(1.2rem, 2vw, 2.5rem)",
                      textShadow: "0 0 6px rgba(12, 12, 12, 0.6)",
                      padding: "0.4rem 0",
                    }}
                  >
                    {i + 1}
                  </div>

                  {/* Lane content using your green box + RootNumber */}
                  <div
                    className="card-body d-flex justify-content-center align-items-center bg-light"
                    style={{
                      fontSize: "clamp(0.9rem, 1.5vw, 2rem)",
                      overflow: "hidden",
                      padding: "0.5rem",
                      borderTop: "1px solid #ffffff",
                    }}
                  >
                    <div
                      style={{
                        background:
                          "linear-gradient(145deg, #20f80383, rgb(28, 123, 50))",
                        boxShadow: "inset 1px 1px 10px rgb(0, 0, 0)",
                        borderRadius: "5px",
                        padding: "0.5rem 1rem",
                        minWidth: "80%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "clamp(1.5rem, 3vw, 4rem)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          lineHeight: 1.2,
                        }}
                      >
                        <RootNumber rootNr={value} />
                      </div>
                    </div>
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
              ? "d-flex justify-content-center align-items-center p-3 bg-warning"
              : "d-flex justify-content-center align-items-center p-3 bg-secondary text-white"
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
