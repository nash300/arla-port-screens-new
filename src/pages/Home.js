import React from "react";
import { useNavigate } from "react-router-dom";

export default function MenuPage() {
  const navigate = useNavigate();

  const handleAllScreensClick = () => navigate("/PortScreenChoice");

  const handlePortEditClick = () => navigate("/PortEditPage");
  const handleTorgetEditClick = () => navigate("/TorgetEditPage");
  const handleSpecialenEditClick = () => navigate("/SpecialenEditPage");

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card shadow-lg p-4"
        style={{ maxWidth: "750px", width: "100%" }}
      >
        <div className="row g-0">
          {/* Left Logo Section */}
          <div className="col-md-4 d-flex align-items-center justify-content-center bg-light border-end">
            <img
              src="/arla-logo.png"
              alt="Logo"
              className="img-fluid"
              style={{ maxWidth: "140px" }}
            />
          </div>

          {/* Right Content Section */}
          <div className="col-md-8 p-4">
            {/* Main Menu Button */}
            <div className="d-grid mb-4">
              <button
                className="btn btn-warning btn-lg shadow-sm"
                onClick={handleAllScreensClick}
              >
                🖥️ Alla skärmar
              </button>
            </div>

            {/* Update Section */}
            <div className="card bg-light shadow-sm p-3">
              <h5 className="mb-3 text-center">
                <i className=" me-2 text-primary"></i>
                Ändra | Uppdatera
              </h5>

              {/* Port */}
              <div className="d-grid mb-3">
                <button
                  className="btn btn-success"
                  onClick={handlePortEditClick}
                >
                  <i className="bi bi-box-arrow-up-right me-2"></i>
                  Port
                </button>
              </div>

              <hr />

              {/* Torget */}
              <div className="d-grid mb-3">
                <button
                  className="btn btn-success"
                  onClick={handleTorgetEditClick}
                >
                  <i className="bi bi-shop me-2"></i>
                  Torget
                </button>
              </div>

              <hr />

              {/* Specialen */}
              <div className="d-grid">
                <button
                  className="btn btn-success"
                  onClick={handleSpecialenEditClick}
                >
                  <i className="bi bi-stars me-2"></i>
                  Specialen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
