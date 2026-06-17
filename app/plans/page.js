"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "../../components/Shell";
import { railGet } from "../lib/api";

export default function Plans() {
  const router = useRouter();
  const [plans, setPlans] = useState(null);
  const [sel, setSel] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    railGet("/api/subscription_plans")
      .then((d) => setPlans(d.plans || []))
      .catch(() => setErr("Could not load plans."));
  }, []);

  function choose(slug) {
    setSel(slug);
    if (typeof window !== "undefined") localStorage.setItem("memelli_plan", slug);
  }

  return (
    <Shell step={2} total={6} label="Step 2 of 6 · Choose your plan"
      title="Pick your plan" sub="Select the tier that fits. You can change it anytime from your dashboard.">
      {plans === null && !err ? <div className="sub">Loading plans…</div> : null}
      {err ? <div className="err">{err}</div> : null}
      {(plans || []).map((p) => (
        <div key={p.slug} className={"row" + (sel === p.slug ? " sel" : "")} onClick={() => choose(p.slug)}>
          <span className="p">{p.price || p.amount || ""}</span>
          <div className="t">{p.name}</div>
          <div className="d">{p.description || ""}</div>
        </div>
      ))}
      <button className="cta" disabled={!sel} onClick={() => router.push("/funding")}>Continue</button>
    </Shell>
  );
}
