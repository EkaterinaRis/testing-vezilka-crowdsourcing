import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, getToken, setToken, refreshUserObj } from "../utils/auth";
import { jwtDecode } from "jwt-decode";

const WARN_BEFORE_SECONDS = 60;

function SessionExpiryModal({ secondsLeft, onExtend, onLogout }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, secondsLeft / WARN_BEFORE_SECONDS);
  const dashOffset = circumference * (1 - progress);

  const urgency = secondsLeft <= 15;

  return (
    <>
      <style>{`
        .sem-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: ${
            urgency ? "hsl(var(--destructive))" : "var(--hero-gradient)"
          };
          transition: background 0.4s ease;
        }

        .sem-ring-bg {
          fill: ${
            urgency
              ? "hsl(var(--destructive) / 0.08)"
              : "hsl(var(--primary) / 0.08)"
          };
          transition: fill 0.4s ease;
        }

        .sem-ring-fill {
          fill: none;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-dasharray: ${circumference};
          stroke-dashoffset: ${dashOffset};
          transition: stroke-dashoffset 0.9s linear, stroke 0.4s ease;
          stroke: ${urgency ? "hsl(var(--destructive))" : "hsl(var(--primary))"};
        }

        .sem-timer-number {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: ${urgency ? "hsl(var(--destructive))" : "hsl(var(--primary))"};
          transition: color 0.3s;
        }
      `}</style>

      <div
        className="sem-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sem-title"
      >
        <div className={`sem-card ${urgency ? "sem-urgency-pulse" : ""}`}>
          <div className="sem-header">
            <div className="sem-timer-ring" aria-hidden="true">
              <svg width="68" height="68" viewBox="0 0 68 68">
                <circle className="sem-ring-bg" cx="34" cy="34" r="34" />
                <circle className="sem-ring-track" cx="34" cy="34" r={radius} />
                <circle className="sem-ring-fill" cx="34" cy="34" r={radius} />
              </svg>
              <div className="sem-timer-number">{secondsLeft}s</div>
            </div>
            <div className="sem-text">
              <h2 id="sem-title">Session expiring</h2>
              <p>
                Your session will end in{" "}
                <strong
                  style={{
                    color: urgency
                      ? "hsl(var(--destructive))"
                      : "hsl(var(--primary))",
                  }}
                >
                  {secondsLeft} second{secondsLeft !== 1 ? "s" : ""}
                </strong>
                . Extend it to stay signed in.
              </p>
            </div>
          </div>

          <div className="sem-divider" />

          <div className="sem-actions">
            <button className="sem-btn-extend" onClick={onExtend}>
              Extend session
            </button>
            <button className="sem-btn-logout" onClick={onLogout}>
              Log out now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARN_BEFORE_SECONDS);
  const countdownRef = useRef(null);
  const logoutTimeoutRef = useRef(null);
  const warnTimeoutRef = useRef(null);

  const doLogout = useCallback(() => {
    setShowModal(false);
    clearAuth();
    navigate("/login");
  }, [navigate]);

  const clearAllTimers = useCallback(() => {
    clearTimeout(logoutTimeoutRef.current);
    clearTimeout(warnTimeoutRef.current);
    clearInterval(countdownRef.current);
  }, []);

  const scheduleExpiry = useCallback(
    (expiresIn) => {
      clearAllTimers();

      const warnAt = expiresIn - WARN_BEFORE_SECONDS * 1000;

      if (warnAt <= 0) {
        const remaining = Math.max(0, Math.round(expiresIn / 1000));
        setSecondsLeft(remaining);
        setShowModal(true);

        countdownRef.current = setInterval(() => {
          setSecondsLeft((s) => {
            if (s <= 1) {
              clearInterval(countdownRef.current);
              return 0;
            }
            return s - 1;
          });
        }, 1000);

        logoutTimeoutRef.current = setTimeout(doLogout, expiresIn);
      } else {
        warnTimeoutRef.current = setTimeout(() => {
          setSecondsLeft(WARN_BEFORE_SECONDS);
          setShowModal(true);

          countdownRef.current = setInterval(() => {
            setSecondsLeft((s) => {
              if (s <= 1) {
                clearInterval(countdownRef.current);
                return 0;
              }
              return s - 1;
            });
          }, 1000);
        }, warnAt);

        logoutTimeoutRef.current = setTimeout(doLogout, expiresIn);
      }
    },
    [doLogout, clearAllTimers],
  );

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const expiresIn = decoded.exp * 1000 - Date.now();

      if (expiresIn <= 0) {
        doLogout();
        return;
      }

      scheduleExpiry(expiresIn);
    } catch {
      doLogout();
    }

    return clearAllTimers;
  }, [navigate, scheduleExpiry, doLogout, clearAllTimers]);

  const handleExtend = useCallback(async () => {
    setShowModal(false);
    clearAllTimers();

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      const token = getToken();
      if (!token) {
        doLogout();
        return;
      }

      const res = await fetch(`${BACKEND_URL}/api/auth`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        doLogout();
        return;
      }

      const data = await res.json();
      setToken(data.jwtToken);
      await refreshUserObj();

      const decoded = jwtDecode(data.jwtToken);
      const expiresIn = decoded.exp * 1000 - Date.now();
      if (expiresIn <= 0) {
        doLogout();
        return;
      }
      scheduleExpiry(expiresIn);
    } catch {
      doLogout();
    }
  }, [clearAllTimers, doLogout, scheduleExpiry]);

  const handleLogout = useCallback(() => {
    clearAllTimers();
    doLogout();
  }, [clearAllTimers, doLogout]);

  return (
    <>
      {showModal && (
        <SessionExpiryModal
          secondsLeft={secondsLeft}
          onExtend={handleExtend}
          onLogout={handleLogout}
        />
      )}
      {children}
    </>
  );
}
