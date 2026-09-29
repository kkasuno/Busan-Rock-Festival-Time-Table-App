import { useEffect, useState } from "react";

export function OfflineStatus() {
  const [online, setOnline] = useState(true);
  const [saved, setSaved] = useState("");
  const [failed, setFailed] = useState(false);
  const [update,setUpdate] = useState<ServiceWorkerRegistration|null>(null);
  const [refreshAvailable, setRefreshAvailable] = useState(false);
  useEffect(() => {
    let disposed = false;
    let controlled = Boolean(navigator.serviceWorker?.controller);
    let registration: ServiceWorkerRegistration | undefined;
    let installing: ServiceWorker | null = null;
    const readSaved = async () => {
      try {
        const response = await fetch("/offline-version.json");
        if (!response.ok) throw new Error("Offline metadata unavailable");
        const { updated } = await response.json();
        if (!disposed) {
          setFailed(false);
          setSaved(new Date(updated).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }));
        }
      } catch { if (!disposed) setFailed(true); }
    };
    const controllerChanged = () => {
      if (controlled) setRefreshAvailable(true);
      controlled = true;
      setUpdate(null);
      void readSaved();
    };
    const stateChanged = () => {
      if (disposed) return;
      if (installing?.state === "redundant") setFailed(true);
      if (registration?.waiting) setUpdate(registration);
    };
    const updateFound = () => {
      installing?.removeEventListener("statechange", stateChanged);
      installing = registration?.installing ?? null;
      installing?.addEventListener("statechange", stateChanged);
    };
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", controllerChanged);
      navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then(reg => {
        if (disposed) return;
        registration = reg;
        if(reg.waiting&&!disposed)setUpdate(reg);
        reg.addEventListener("updatefound", updateFound);
        updateFound();
        return navigator.serviceWorker.ready;
      }).then(() => { if (!disposed) return readSaved(); }).catch(() => {
        if (disposed) return;
        if (navigator.serviceWorker.controller) void readSaved();
        else setFailed(true);
      });
    } else setFailed(true);
    return () => {
      disposed = true;
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
      navigator.serviceWorker?.removeEventListener("controllerchange", controllerChanged);
      registration?.removeEventListener("updatefound", updateFound);
      installing?.removeEventListener("statechange", stateChanged);
    };
  }, []);
  const applyUpdate=()=>{
    if(!update?.waiting) { window.location.reload(); return; }
    navigator.serviceWorker.addEventListener("controllerchange",()=>window.location.reload(),{once:true});
    update.waiting.postMessage("ACTIVATE_UPDATE");
  };
  return <div className="offline-status" role="status">{!online ? `오프라인 · 저장 자료 ${saved || "확인 중"}` : failed ? "오프라인 저장 불가" : saved ? `오프라인 준비 완료 · 자료 ${saved}` : "오프라인 저장 중…"}{(update || refreshAvailable)&&<button onClick={applyUpdate}>새 버전 열기</button>}{failed&&<a href="/repair">연결 복구</a>}</div>;
}
