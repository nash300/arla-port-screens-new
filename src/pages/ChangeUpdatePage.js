import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import supabase from "../Utilities/supabase";
import { useNavigate } from "react-router-dom";

export default function ChangeUpdatePage() {
  const [selectedPortNumber, setSelectedPortNumber] = useState("");
  const [lane_1, setLane_1] = useState("");
  const [lane_2, setLane_2] = useState("");
  const [lane_3, setLane_3] = useState("");
  const [lane_4, setLane_4] = useState("");
  const [message, setMessage] = useState("");
  const [selectedHours, setSelectedHours] = useState(10);
  const [selectedMinutes, setSelectedMinutes] = useState(1);
  const [portList, setPortList] = useState([]);
  const [numOfLanes, setNumOfLanes] = useState(1);

  const navigate = useNavigate();

  const hourOptions = [0, 1, 5, 10, 15, 24];
  const minuteOptions = [1, 30];

  const removePort = (portToRemove) => {
    setPortList((prev) => prev.filter((port) => port !== Number(portToRemove)));
  };

  const handleTextChange = (e) => {
    if (e.target.value.length <= 40) setMessage(e.target.value);
  };

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const { data, error } = await supabase
          .from("Port_Screens")
          .select("port_nr");
        if (error) throw error;
        setPortList(data.map((item) => parseInt(item.port_nr, 10)));
      } catch (err) {
        console.error("Error loading port list:", err);
      }
    };
    fetchPorts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Parse numeric values safely
    const hours = parseInt(selectedHours, 10) || 0;
    const minutes = parseInt(selectedMinutes, 10) || 0;
    const totalMinutes = hours * 60 + minutes;

    if (!selectedPortNumber) return alert("Välj ett portnummer!");
    if (!(lane_1 || lane_2 || lane_3 || lane_4))
      return alert("Välj minst ett ruttnummer!");
    if (totalMinutes <= 0) return alert("Tidgräns kan inte vara 0!");

    try {
      // Remove any old data for that port
      const { error: deleteError } = await supabase
        .from("Port_Screens")
        .delete()
        .eq("port_nr", selectedPortNumber);
      if (deleteError) throw deleteError;

      // Insert new data
      const { error } = await supabase.from("Port_Screens").insert([
        {
          port_nr: selectedPortNumber,
          lane_1: lane_1,
          lane_2: lane_2,
          lane_3: lane_3,
          lane_4: lane_4,
          time_limit: totalMinutes,
          msg: message || null,
        },
      ]);

      if (error) throw error;

      // Reset form
      setSelectedPortNumber("");
      setLane_1("");
      setLane_2("");
      setLane_3("");
      setLane_4("");
      setSelectedHours(0);
      setSelectedMinutes(1);
      setMessage("");
      // Reload the page
      window.location.reload();
    } catch (err) {
      console.error("Database error:", err);
      alert("Ett fel uppstod vid uppdatering av databasen.");
    }
  };

  const handleDeleteButton = async () => {
    const confirmDelete = window.confirm(
      "Är du säker på att du vill återställa denna skärm?",
    );
    if (!confirmDelete) return;
    try {
      const { error } = await supabase
        .from("Port_Screens")
        .delete()
        .eq("port_nr", selectedPortNumber);
      if (error) throw error;
      alert("Portdisplayen har återställts");
      removePort(selectedPortNumber);
      setSelectedPortNumber("");
    } catch (err) {
      console.error("Error deleting port:", err);
      alert("Kunde inte radera posten.");
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div
        className="bg-white shadow-lg rounded-4 p-5 border border-3 border-success w-50 mx-auto"
        style={{ maxWidth: "600px", minWidth: "300px" }}
      >
        <div className="d-flex justify-content-center mb-3">
          <img src="/arla-logo.png" alt="Logo" style={{ maxWidth: "100px" }} />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Port selection */}
          <div className="border bg-success bg-opacity-25 mb-4 text-center p-3 rounded">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex flex-column">
                <label className="form-label fw-bold text-dark text-start">
                  Portnummer:
                </label>
                <select
                  value={selectedPortNumber}
                  onChange={(e) => setSelectedPortNumber(e.target.value)}
                  className="form-select border border-success text-dark p-2"
                >
                  <option value="">Port</option>
                  {Array.from({ length: 26 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              {/* number of lanes selection */}

              <div className="d-flex flex-column">
                <label className="form-label fw-bold text-dark text-start">
                  Antal rutter
                </label>
                <select
                  value={numOfLanes}
                  onChange={(e) => setNumOfLanes(Number(e.target.value))}
                  className="form-select border border-success text-dark p-2"
                >
                  {Array.from({ length: 4 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              {portList.includes(Number(selectedPortNumber)) && (
                <button
                  type="button"
                  onClick={handleDeleteButton}
                  className="btn btn-danger ms-3 fw-bold p-2"
                >
                  Återställ port {selectedPortNumber}
                </button>
              )}
            </div>
          </div>

          {/* Selecting # OF LANES*/}

          {numOfLanes === 1 && (
            <div
              className="mb-2 border-3 p-3 rounded"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0, 0, 0, 0.14), rgba(243, 243, 243, 0.4)), url('/1.jpg')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                minHeight: "130px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {[lane_1].map((value, idx) => {
                  const setters = [setLane_1, undefined, undefined, undefined];

                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <input
                        type="text"
                        maxLength={4}
                        value={value}
                        onChange={(e) =>
                          setters[idx](e.target.value.toUpperCase())
                        }
                        className="form-control border border-success text-dark text-center"
                        style={{ width: "100px" }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {numOfLanes === 2 && (
            <div
              className="mb-2 border p-3 rounded"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0, 0, 0, 0.14), rgba(243, 243, 243, 0.4)), url('/2.jpg')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                minHeight: "130px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {[lane_1, lane_2].map((value, idx) => {
                  const setters = [setLane_1, setLane_2, undefined, undefined];

                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <input
                        type="text"
                        maxLength={4}
                        value={value}
                        onChange={(e) =>
                          setters[idx](e.target.value.toUpperCase())
                        }
                        className="form-control border border-success text-dark text-center"
                        style={{ width: "100px" }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {numOfLanes === 3 && (
            <div
              className="mb-2 border p-3 rounded"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0, 0, 0, 0.14), rgba(243, 243, 243, 0.4)), url('/3.jpg')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                minHeight: "130px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {[lane_1, lane_2, lane_3].map((value, idx) => {
                  const setters = [setLane_1, setLane_2, setLane_3, undefined];

                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <input
                        type="text"
                        maxLength={4}
                        value={value}
                        onChange={(e) =>
                          setters[idx](e.target.value.toUpperCase())
                        }
                        className="form-control border border-success text-dark text-center"
                        style={{ width: "100px" }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {numOfLanes === 4 && (
            <div
              className="mb-2 border p-3 rounded"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0, 0, 0, 0.14), rgba(243, 243, 243, 0.4)), url('/4.jpg')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                minHeight: "130px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {[lane_1, lane_2, lane_3, lane_4].map((value, idx) => {
                  const setters = [setLane_1, setLane_2, setLane_3, setLane_4];

                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <input
                        type="text"
                        maxLength={4}
                        value={value}
                        onChange={(e) =>
                          setters[idx](e.target.value.toUpperCase())
                        }
                        className="form-control border border-success text-dark text-center"
                        style={{ width: "100px" }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time */}
          <div className="mb-4 text-center border p-3 rounded">
            <label className="form-label fw-bold text-dark">
              Tidsgräns (max 24 timmar):
            </label>
            <div className="d-flex justify-content-center gap-3">
              <select
                value={selectedHours}
                onChange={(e) => setSelectedHours(Number(e.target.value))}
                className="form-select border border-success text-dark p-2"
              >
                {hourOptions.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour} tim
                  </option>
                ))}
              </select>

              <select
                value={selectedMinutes}
                onChange={(e) => setSelectedMinutes(Number(e.target.value))}
                className="form-select border border-success text-dark p-2"
              >
                {minuteOptions.map((minute) => (
                  <option key={minute} value={minute}>
                    {minute} min
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message */}
          <div className="mb-4 text-center border p-3 rounded">
            <label className="form-label fw-bold text-dark">
              Meddelande (max 40 tecken):
            </label>
            <textarea
              value={message}
              onChange={handleTextChange}
              className="form-control border border-success text-dark mx-auto text-center"
              rows="1"
              maxLength="40"
            />
            <small className="text-muted d-block mt-1">
              {40 - message.length} tecken kvar
            </small>
          </div>

          <button type="submit" className="btn btn-success w-100 fw-bold p-2">
            Uppdatera
          </button>
        </form>
      </div>
    </div>
  );
}
