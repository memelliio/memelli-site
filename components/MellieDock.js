"use client";
import { useState } from "react";
import { railPost } from "../app/lib/api";

export default function MellieDock() {
  const [q, setQ] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  async function ask(e) {
    e.preventDefault();
    if (!q.trim()) return;
    setBusy(true); setReply("");
    const { data } = await railPost("/api/mellie/chat", { text: q });
    setBusy(false);
    setReply((data && (data.reply || data.answer || data.text)) || "Mellie is thinking…");
  }
  return (
    <div className="mellie-dock">
      {reply ? <div className="mellie-reply">{reply}</div> : null}
      <form className="mellie-bar" onSubmit={ask}>
        <span className="mellie-dot" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask Mellie about credit, funding, or your business…" />
        <button disabled={busy} aria-label="Send">{busy ? "…" : "➤"}</button>
      </form>
    </div>
  );
}
