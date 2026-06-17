"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "../../components/Shell";
import { railPost, setToken, setCustomer } from "../lib/api";

export default function Signup() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", password: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const { status, data } = await railPost("/api/signup", f);
    setBusy(false);
    if (status === 503) { setErr("Signups are paused right now. Check back soon."); return; }
    if (!data.ok) { setErr(data.error || "Could not sign up."); return; }
    setToken(data.token);
    if (data.customer && data.customer.id) setCustomer(data.customer.id);
    router.push("/plans");
  }

  return (
    <Shell step={1} total={6} label="Step 1 of 6 · Create account"
      title="Create your account" sub="One sign-up starts your whole path — credit, funding, and coaching.">
      <form onSubmit={submit}>
        <div className="field"><label>Full name</label><input value={f.name} onChange={on("name")} required /></div>
        <div className="field"><label>Email</label><input type="email" value={f.email} onChange={on("email")} required /></div>
        <div className="field"><label>Password</label><input type="password" value={f.password} onChange={on("password")} required /></div>
        <div className="field"><label>Phone</label><input value={f.phone} onChange={on("phone")} placeholder="+1…" /></div>
        <button className="cta" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
        {err ? <div className="err">{err}</div> : null}
      </form>
      <div className="muted">Already have an account? <a href="/signin">Sign in</a></div>
    </Shell>
  );
}
