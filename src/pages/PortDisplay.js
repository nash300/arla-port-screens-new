

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
      .channel(`realtime-port-${parsedPortNr}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Port_Screens",
          filter: `port_nr=eq.${parsedPortNr}`, // ← server-side filtering
        },
        (payload) => {
          const isRelevant =
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE" ||
            payload.eventType === "DELETE" ||
            payload.new?.port_nr === parsedPortNr ||
            payload.old?.port_nr === parsedPortNr;

          if (isRelevant) {
            fetchPortData();
          }
        },
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

      {/* Middle + Bottom Wrapper */}
      <div className="d-flex flex-column" style={{ height: "80vh" }}>
        {/* Middle Section — 70% */}
        <div
          className="d-flex justify-content-center position-relative"
          style={{
            flex: "0 0 70%",
            backgroundImage:
              portInfo && portInfo[0]
                ? (() => {
                    const lanes = [
                      portInfo[0].lane_1,
                      portInfo[0].lane_2,
                      portInfo[0].lane_3,
                      portInfo[0].lane_4,
                    ];

                    const activeCount = lanes.filter(
                      (l) => l !== null && l !== "",
                    ).length;

                    return `url('/${activeCount}.jpg')`;
                  })()
                : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
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

                      const activeLanes = lanes.filter(
                        (l) => l.value !== null && l.value !== "",
                      );

                      const laneWidth = `${100 / activeLanes.length}%`;

                      return activeLanes.map((lane, idx) => (
                        <div
                          key={idx}
                          className="d-flex flex-column p-2"
                          style={{ width: laneWidth }}
                        >
                          <div
                            className="lane-wrapper d-flex align-items-end justify-content-center"
                            style={{ height: "100%" }}
                          >
                            <div className="lane-box-container d-flex flex-column align-items-center">
                              {/* Main green box */}
                              <div
                                className="lane-box"
                                style={{
                                  background:
                                    "linear-gradient(145deg, #20f80383, rgb(28, 123, 50))",
                                  boxShadow: "inset 1px 1px 10px rgb(0, 0, 0)",
                                  height: "35%", // keeps it compact
                                  maxWidth: "500px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderTopLeftRadius: "45px",
                                  borderTopRightRadius: "45px",
                                  borderBottomLeftRadius: "45px",
                                  borderBottomRightRadius: "45px",
                                  paddingLeft: "10px",
                                  paddingRight: "10px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "180px",
                                    lineHeight: "1.3",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                  }}
                                >
                                  <RootNumber rootNr={lane.value} />
                                </div>
                              </div>

                              {/* Reflection */}
                              <div
                                className="lane-reflection"
                                style={{
                                  width: "100%",
                                  height: "60px",
                                  marginTop: "5px",
                                  background:
                                    "linear-gradient(to bottom, rgb(0, 0, 0), rgba(0, 0, 0, 0.29))",
                                  borderTopLeftRadius: "50px",
                                  borderTopRightRadius: "50px",

                                  filter: "blur(10px)",
                                  opacity: 0.7,
                                }}
                              ></div>
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

        {/* Bottom Section — 30% */}
        <div
          className="d-flex align-items-center justify-content-center text-center position-relative overflow-hidden"
          style={{
            flex: "0 0 30%",
            background:
              portInfo && portInfo.some((item) => item.msg)
                ? "orange"
                : "black",
            color:
              portInfo && portInfo.some((item) => item.msg) ? "black" : "white",
          }}
        >
          {portInfo && portInfo.some((item) => item.msg) ? (
            <h1
              className="blinking-text fw-bold"
              style={{ fontSize: "calc(6vh + 2vw)", whiteSpace: "nowrap" }}
            >
              {portInfo.find((item) => item.msg)?.msg}
            </h1>
          ) : null}

          {/* Blinking + Rotation animation CSS */}
          <style>
            {`
  @keyframes blinkEffect {
    0% { opacity: 0; }
    50% { opacity: 0.9; }
    100% { opacity: 1; }
  }

  @keyframes rotateY360 {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
  }

  .blinking-text {
    animation: blinkEffect 2s infinite ease-in-out;
  }
`}
          </style>
        </div>
      </div>
    </div>
  );
}
