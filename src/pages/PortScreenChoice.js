import { useNavigate } from "react-router-dom";
import supabase from "../Utilities/supabase.js";
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PortScreenChoice() {
  const nrOfPorts = 26;
  const navigate = useNavigate();
  const [portList, setPortList] = useState([]);

  useEffect(() => {
    const fetchPortData = async () => {
      try {
        const { data, error } = await supabase
          .from("Port_Screens")
          .select("port_nr");

        if (error) {
          console.error("Supabase query error:", error);
        } else {
          setPortList(data.map((item) => parseInt(item.port_nr, 10)));
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchPortData();
  }, []);

  const portClickHandler = (portNumber) => {
    navigate(`/PortDisplay/${portNumber}`);
  };

  const goToTorget = () => navigate("/TorgetDisplay");
  const goToSpecialen = () => navigate("/SpecialenDisplay");

  return (
    <div className="container p-5 flex-column align-items-center justify-content-center min-vh-100 bg-light">
      <h3>
        Port <hr />
      </h3>

      {/* PORTS */}
      <div className="row g-4 justify-content-center">
        {[...Array(nrOfPorts)].map((_, i) => {
          const portNumber = i + 1;
          const isHighlighted = portList.includes(portNumber);

          return (
            <div key={portNumber} className="col-lg-2 col-md-3 col-sm-4">
              <div
                className={`card border-dark border-0 ${
                  isHighlighted
                    ? "bg-warning text-dark"
                    : "bg-secondary text-white"
                }`}
                style={{ cursor: "pointer", transition: "transform 0.2s" }}
                onClick={() => portClickHandler(portNumber)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <div className="card-body text-center">
                  <h5>Port {portNumber}</h5>
                  <p className="card-text">🖥️</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TORGET */}
      <h3 className="mt-5">
        Torget <hr />
      </h3>
      <div className="row g-4 justify-content-center">
        <div className="col-lg-2 col-md-3 col-sm-4">
          <div
            className="card bg-info text-dark border-0"
            style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onClick={goToTorget}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.2)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div className="card-body text-center">
              <h5>Torget</h5>
              <p className="card-text">🖥️</p>
            </div>
          </div>
        </div>
      </div>

      {/* SPECIALEN */}
      <h3 className="mt-5">
        Specialen <hr />
      </h3>
      <div className="row g-4 justify-content-center">
        <div className="col-lg-2 col-md-3 col-sm-4">
          <div
            className="card bg-primary text-white border-0"
            style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onClick={goToSpecialen}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.2)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div className="card-body text-center">
              <h5>Specialen</h5>
              <p className="card-text">🖥️</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
