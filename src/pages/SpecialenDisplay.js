

export default function SpecialenDisplay() {
  const rotatingStyle = {
    animation: "rotateY360 6s ease-in-out infinite",
    transformStyle: "preserve-3d",
    width: "600px",
  };

  return (
    <div className="vh-100 d-flex flex-column overflow-hidden">
      {/* Header */}
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
            SPECIALEN
          </h1>
        </div>
      </div>
    </div>
  );
}
