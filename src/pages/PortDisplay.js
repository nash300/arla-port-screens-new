/* ////////////////////////////////////////////////////////////////////////////////////////// 
PURPOSE:
This is the page that the display screen shows.

FUNCTIONALITY:
* Retrieves information to be displayed for the corresponding port screen.
* Communicates with Supabase for real-time updates.
* If no records exist for that port, displays a default image.
/////////////////////////////////////////////////////////////////////////////////////////// */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../Utilities/supabase";
import RootNumber from "../components/RootNumber";

export default function PortDisplay() {
  const { portNr } = useParams();
  const parsedPortNr = Number(portNr);

  const [portInfo, setPortInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const rotatingStyle = {
    animation: "rotateY360 6s ease-in-out infinite",
    transformStyle: "preserve-3d",
    width: "600px",
  };

  const fetchPortData = async () => {
    setLoading(true);
    try {
      if (!parsedPortNr || isNaN(parsedPortNr)) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("Port_Screens")
        .select("*")
        .eq("port_nr", parsedPortNr);

      if (error) console.error("Supabase query error:", error);
      else setPortInfo(data.length > 0 ? data : null);
    } catch (error) {
      console.error(
        "Unexpected error while retrieving data from the data:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parsedPortNr) fetchPortData();
  }, [parsedPortNr]);

  useEffect(() => {
    if (!parsedPortNr || isNaN(parsedPortNr)) return;

    const channel = supabase
      .channel("realtime-ports")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Port_Screens" },
        () => fetchPortData(),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [parsedPortNr]);

  return (
    <div className="vh-100 d-flex flex-column overflow-hidden">
      {/* Header */}
      <div
        className="bg-dark text-white d-flex align-items-center justify-content-center text-center"
        style={{ height: "20vh" }}
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
            style={{ fontSize: "calc(10vh + 2vw)", whiteSpace: "nowrap" }}
          >
            PORT {parsedPortNr}
          </h1>
        </div>
      </div>

      {/* Middle Section */}
      <div className="d-flex flex-grow-1 justify-content-center position-relative">
        <div className="container-fluid h-100">
          <div className="row h-100 gap-2 justify-content-center">
            {loading ? (
              <div className="d-flex align-items-center justify-content-center w-100 h-100">
                <p>Loading data...</p>
              </div>
            ) : !portInfo ? (
              <div className="d-flex align-items-center justify-content-center w-100 h-100">
                <img
                  src="/cow.png"
                  alt="No data"
                  className="img-fluid"
                  style={rotatingStyle}
                />
                <style>
                  {`
                    @keyframes rotateY360 {
                      from { transform: rotateY(0deg); }
                      to { transform: rotateY(360deg); }
                    }
                  `}
                </style>
              </div>
            ) : (
              portInfo.map((item, index) => (
                <div key={index} className="row">
                  {(() => {
                    const lanes = [
                      { label: "Lane 1", value: item.lane_1 },
                      { label: "Lane 2", value: item.lane_2 },
                      { label: "Lane 3", value: item.lane_3 },
                      { label: "Lane 4", value: item.lane_4 },
                    ];

                    // Only keep lanes that actually have data
                    const activeLanes = lanes.filter(
                      (l) => l.value !== null && l.value !== "",
                    );

                    // Dynamic width based on number of active lanes
                    const laneWidth = `${100 / activeLanes.length}%`;

                    return activeLanes.map((lane, idx) => (
                      <div
                        key={idx}
                        className="d-flex flex-column p-2"
                        style={{ width: laneWidth }}
                      >
                        <div
                          className="rounded-bottom text-center d-flex align-items-center justify-content-center h-100 animate-box"
                          style={{
                            overflow: "hidden",
                            boxShadow:
                              "inset 1px 1px 20px rgba(184, 184, 184, 1)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "clamp(6vw, 8vw, 10vw)",
                              textAlign: "center",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              width: "100%",
                            }}
                          >
                            <RootNumber rootNr={lane.value} />
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      {portInfo && portInfo.some((item) => item.msg !== null) && (
        <div
          className="bg-warning text-white d-flex align-items-center justify-content-center text-center position-relative overflow-hidden"
          style={{ height: "15vh" }}
        >
          {/* Running cow GIF */}
          <div
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              width: "100%",
              overflow: "hidden",
              pointerEvents: "none",
              height: "100%",
            }}
          ></div>

          {/* Message Text */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <h1
              className="blinking-text fw-bold text-black"
              style={{ fontSize: "calc(6vh + 2vw)", whiteSpace: "nowrap" }}
            >
              {portInfo.find((item) => item.msg)?.msg}
            </h1>
          </div>

          <style>
            {`
              @keyframes blinkEffect {
                0% { opacity: 0; }
                50% { opacity: 0.9; }
                100% { opacity: 1; }
              }

              .blinking-text {
                animation: blinkEffect 2s infinite ease-in-out;
              }
            `}
          </style>
        </div>
      )}
    </div>
  );
}
