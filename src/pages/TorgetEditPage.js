import React, { useCallback, useEffect, useMemo, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import supabase from "../Utilities/supabase";

const EMPTY_LANES = Array.from({ length: 11 }, (_, index) => ({
  id: index + 1,
  rootNr: "",
}));

const getMessageExpiry = (message) => {
  if (!message) return null;
  return new Date(
    new Date(message.created_at).getTime() + message.duration_minutes * 60000,
  );
};

const getRemainingText = (message) => {
  const expiresAt = getMessageExpiry(message);
  if (!expiresAt) return "";

  const msLeft = expiresAt.getTime() - Date.now();
  if (msLeft <= 0) return "Utgången";

  const totalMinutes = Math.ceil(msLeft / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min kvar`;
  return `${hours} tim ${minutes} min kvar`;
};

export default function TorgetEditPage() {
  const [lanes, setLanes] = useState(EMPTY_LANES);
  const [savedLanes, setSavedLanes] = useState(EMPTY_LANES);
  const [message, setMessage] = useState("");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("30");
  const [activeMessage, setActiveMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingLaneId, setSavingLaneId] = useState(null);
  const [messageBusy, setMessageBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [clockTick, setClockTick] = useState(0);

  const loadLanes = useCallback(async () => {
    const { data, error: laneError } = await supabase
      .from("torget")
      .select("id, rootNr")
      .order("id", { ascending: true });

    if (laneError) throw laneError;

    const nextLanes = data?.length ? data : EMPTY_LANES;
    setLanes(nextLanes);
    setSavedLanes(nextLanes);
  }, []);

  const loadActiveMessage = useCallback(async () => {
    const { data, error: messageError } = await supabase
      .from("torg_msg")
      .select("id, created_at, msg_text, duration_minutes")
      .order("created_at", { ascending: false })
      .limit(1);

    if (messageError) throw messageError;

    const latest = data?.[0] || null;
    const expiresAt = getMessageExpiry(latest);
    const isActive = expiresAt && expiresAt.getTime() > Date.now();

    setActiveMessage(isActive ? latest : null);
  }, []);

  const loadPageData = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      await Promise.all([loadLanes(), loadActiveMessage()]);
    } catch (err) {
      console.error("Torget admin load error:", err);
      setError("Kunde inte hämta Torget-data.");
    } finally {
      setLoading(false);
    }
  }, [loadActiveMessage, loadLanes]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setClockTick((tick) => tick + 1);
      loadActiveMessage();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [loadActiveMessage]);

  const durationMinutes = useMemo(() => {
    const h = Number(hours);
    const m = Number(minutes);

    if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
    return h * 60 + m;
  }, [hours, minutes]);

  const durationIsValid = durationMinutes > 0 && durationMinutes <= 24 * 60;
  const canSendMessage = message.trim().length > 0 && durationIsValid;

  const updateLaneValue = (id, value) => {
    const cleanedValue = value.toUpperCase().replace(/\s/g, "").slice(0, 4);
    setLanes((current) =>
      current.map((lane) =>
        lane.id === id ? { ...lane, rootNr: cleanedValue } : lane,
      ),
    );
  };

  const saveLane = async (lane) => {
    setSavingLaneId(lane.id);
    setError("");
    setStatus("");

    try {
      const { error: updateError } = await supabase
        .from("torget")
        .update({ rootNr: lane.rootNr.trim() })
        .eq("id", lane.id);

      if (updateError) throw updateError;

      setSavedLanes((current) =>
        current.map((savedLane) =>
          savedLane.id === lane.id ? { ...lane, rootNr: lane.rootNr.trim() } : savedLane,
        ),
      );
      setStatus(`Bana ${lane.id} sparad.`);
    } catch (err) {
      console.error("Torget lane save error:", err);
      setError(`Kunde inte spara bana ${lane.id}.`);
    } finally {
      setSavingLaneId(null);
    }
  };

  const clearLane = async (lane) => {
    const confirmed = window.confirm(`Vill du rensa bana ${lane.id}?`);
    if (!confirmed) return;

    await saveLane({ ...lane, rootNr: "" });
    setLanes((current) =>
      current.map((currentLane) =>
        currentLane.id === lane.id ? { ...currentLane, rootNr: "" } : currentLane,
      ),
    );
  };

  const sendMessage = async () => {
    if (!canSendMessage) return;

    setMessageBusy(true);
    setError("");
    setStatus("");

    try {
      const { error: insertError } = await supabase.from("torg_msg").insert([
        {
          msg_text: message.trim(),
          duration_minutes: durationMinutes,
        },
      ]);

      if (insertError) throw insertError;

      setMessage("");
      setStatus("Meddelandet skickades till Torget.");
      await loadActiveMessage();
    } catch (err) {
      console.error("Torget message send error:", err);
      setError("Kunde inte skicka meddelandet.");
    } finally {
      setMessageBusy(false);
    }
  };

  const clearMessage = async () => {
    const confirmed = window.confirm("Vill du rensa det aktiva Torget-meddelandet?");
    if (!confirmed) return;

    setMessageBusy(true);
    setError("");
    setStatus("");

    try {
      const { error: deleteError } = await supabase
        .from("torg_msg")
        .delete()
        .neq("id", 0);

      if (deleteError) throw deleteError;

      setActiveMessage(null);
      setStatus("Meddelandet är rensat.");
    } catch (err) {
      console.error("Torget message clear error:", err);
      setError("Kunde inte rensa meddelandet.");
    } finally {
      setMessageBusy(false);
    }
  };

  return (
    <main className="torget-admin min-vh-100 bg-light">
      <div className="torget-admin-container container-fluid">
        <header className="torget-admin-header d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="torget-admin-title d-flex align-items-center gap-3">
            <img src="/arla-logo.png" alt="Arla" />
            <div>
              <h1 className="h2 fw-bold mb-1">Torget Adminpanel</h1>
              <div className="text-secondary">Ruttuppgifter och tidsstyrda meddelanden</div>
            </div>
          </div>

          <button
            className="btn btn-outline-dark d-flex align-items-center gap-2"
            onClick={loadPageData}
            disabled={loading}
            type="button"
          >
            <i className="bi bi-arrow-clockwise" aria-hidden="true"></i>
            Uppdatera
          </button>
        </header>

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {status && <div className="alert alert-success py-2">{status}</div>}

        <section className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="h5 fw-bold m-0">Banor</h2>
            <span className="text-secondary small">{lanes.length} banor</span>
          </div>

          <div className="torget-lane-grid">
            {lanes.map((lane) => {
              const savedValue =
                savedLanes.find((savedLane) => savedLane.id === lane.id)?.rootNr || "";
              const changed = lane.rootNr !== savedValue;
              const isSaving = savingLaneId === lane.id;

              return (
                <div
                  key={lane.id}
                  className={`torget-lane-card ${lane.rootNr ? "is-filled" : ""}`}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-bold">Bana {lane.id}</span>
                    {changed && <span className="badge text-bg-warning">Ej sparad</span>}
                  </div>

                  <input
                    aria-label={`Rutt för bana ${lane.id}`}
                    className="form-control form-control-lg text-center fw-bold"
                    maxLength={4}
                    value={lane.rootNr}
                    onChange={(event) => updateLaneValue(lane.id, event.target.value)}
                    placeholder="-"
                    style={{ textTransform: "uppercase" }}
                  />

                  <div className="d-grid gap-2 mt-3">
                    <button
                      className="btn btn-success"
                      disabled={!changed || isSaving}
                      onClick={() => saveLane(lane)}
                      type="button"
                    >
                      {isSaving ? "Sparar..." : "Spara"}
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      disabled={!lane.rootNr || isSaving}
                      onClick={() => clearLane(lane)}
                      type="button"
                    >
                      Rensa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="row g-4">
          <div className="col-lg-7">
            <div className="torget-panel h-100">
              <h2 className="h5 fw-bold mb-3">Nytt Meddelande</h2>

              <textarea
                className="form-control"
                maxLength={100}
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, 100))}
                placeholder="Meddelande som visas på Torget-displayen"
              />

              <div className="torget-message-controls d-flex flex-wrap align-items-end gap-3 mt-3">
                <div className="torget-time-field">
                  <label className="form-label fw-semibold">Timmar</label>
                  <input
                    className="form-control"
                    min={0}
                    max={24}
                    onChange={(event) => setHours(event.target.value)}
                    type="number"
                    value={hours}
                  />
                </div>
                <div className="torget-time-field">
                  <label className="form-label fw-semibold">Minuter</label>
                  <input
                    className="form-control"
                    min={0}
                    max={59}
                    onChange={(event) => setMinutes(event.target.value)}
                    type="number"
                    value={minutes}
                  />
                </div>
                <button
                  className="torget-send-button btn btn-success px-4"
                  disabled={!canSendMessage || messageBusy}
                  onClick={sendMessage}
                  type="button"
                >
                  {messageBusy ? "Skickar..." : "Skicka Meddelande"}
                </button>
              </div>

              <div className="torget-message-meta d-flex justify-content-between mt-2 text-secondary small">
                <span>{message.length}/100 tecken</span>
                <span>
                  Timer: {durationIsValid ? `${durationMinutes} minuter` : "välj 1-1440 minuter"}
                </span>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="torget-panel h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h5 fw-bold m-0">Aktivt Meddelande</h2>
                <span className="badge text-bg-dark" key={clockTick}>
                  {activeMessage ? getRemainingText(activeMessage) : "Inget"}
                </span>
              </div>

              {activeMessage ? (
                <>
                  <div className="torget-active-message mb-3">
                    {activeMessage.msg_text}
                  </div>
                  <button
                    className="torget-clear-message btn btn-outline-danger"
                    disabled={messageBusy}
                    onClick={clearMessage}
                    type="button"
                  >
                    Rensa Aktivt Meddelande
                  </button>
                </>
              ) : (
                <div className="text-secondary">Det finns inget aktivt Torget-meddelande just nu.</div>
              )}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .torget-admin {
          color: #1f2933;
        }

        .torget-admin-container {
          padding: 24px;
        }

        .torget-admin-header {
          margin-bottom: 24px;
        }

        .torget-admin-title img {
          width: 92px;
          flex: 0 0 auto;
        }

        .torget-lane-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .torget-lane-card,
        .torget-panel {
          background: #ffffff;
          border: 1px solid #d8dee5;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(22, 34, 51, 0.08);
          padding: 16px;
        }

        .torget-lane-card.is-filled {
          border-color: #81b29a;
          background: #f5fbf7;
        }

        .torget-time-field input {
          width: 110px;
        }

        .torget-active-message {
          min-height: 160px;
          border-radius: 8px;
          background: #ffc107;
          color: #111827;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: clamp(1.8rem, 4vw, 4rem);
          font-weight: 800;
          line-height: 1.05;
          padding: 20px;
          overflow-wrap: anywhere;
          animation: torgetMessageBlink 3.8s ease-in-out infinite;
        }

        @keyframes torgetMessageBlink {
          0%,
          100% {
            background: #ffc107;
            color: #111827;
            box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.25);
          }

          50% {
            background: #2f3338;
            color: #ffe08a;
            box-shadow: inset 0 0 0 4px rgba(255, 193, 7, 0.35);
          }
        }

        @media (max-width: 768px) {
          .torget-admin-container {
            padding: 14px;
          }

          .torget-admin-header {
            align-items: stretch !important;
            margin-bottom: 18px;
          }

          .torget-admin-title {
            width: 100%;
            align-items: center;
          }

          .torget-admin-title img {
            width: 64px;
          }

          .torget-admin-title h1 {
            font-size: 1.45rem;
          }

          .torget-admin-title .text-secondary {
            font-size: 0.9rem;
            line-height: 1.25;
          }

          .torget-admin-header .btn {
            width: 100%;
            justify-content: center;
            min-height: 44px;
          }

          .torget-lane-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .torget-lane-card,
          .torget-panel {
            border-radius: 8px;
            padding: 12px;
          }

          .torget-lane-card .form-control-lg {
            min-height: 48px;
            font-size: 1.25rem;
          }

          .torget-lane-card .btn {
            min-height: 42px;
          }

          .torget-message-controls {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 12px !important;
          }

          .torget-time-field input {
            width: 100%;
            min-height: 44px;
          }

          .torget-send-button {
            grid-column: 1 / -1;
            width: 100%;
            min-height: 46px;
          }

          .torget-message-meta {
            flex-direction: column;
            gap: 4px;
          }

          .torget-active-message {
            min-height: 120px;
            font-size: clamp(1.5rem, 9vw, 3rem);
            padding: 14px;
          }

          .torget-clear-message {
            width: 100%;
            min-height: 44px;
          }
        }

        @media (max-width: 420px) {
          .torget-admin-container {
            padding: 10px;
          }

          .torget-lane-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
