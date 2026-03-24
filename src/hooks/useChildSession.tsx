import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface ChildSession {
  child_id: string;
  name: string;
}

interface ChildSessionContextType {
  childSession: ChildSession | null;
  setChildSession: (session: ChildSession) => void;
  logout: () => void;
}

const STORAGE_KEY = "child_session";

const ChildSessionContext = createContext<ChildSessionContextType | undefined>(undefined);

function getStoredSession(): ChildSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.child_id && parsed?.name) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function ChildSessionProvider({ children }: { children: ReactNode }) {
  const [childSession, setChildSessionState] = useState<ChildSession | null>(getStoredSession);

  const setChildSession = (session: ChildSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setChildSessionState(session);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setChildSessionState(null);
  };

  return (
    <ChildSessionContext.Provider value={{ childSession, setChildSession, logout }}>
      {children}
    </ChildSessionContext.Provider>
  );
}

export function useChildSession() {
  const context = useContext(ChildSessionContext);
  if (!context) throw new Error("useChildSession must be used within ChildSessionProvider");
  return context;
}

/** Guard hook: redirects to /child-login if no valid child session for the current route */
export function useRequireChildSession() {
  const { childSession } = useChildSession();
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!childSession || childSession.child_id !== childId) {
      navigate("/child-login", { replace: true });
    }
  }, [childSession, childId, navigate]);

  return childSession;
}
