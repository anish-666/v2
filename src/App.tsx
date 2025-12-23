
import { useEffect, useMemo, useState } from "react";

/* ---------- CSV PARSER ---------- */
function parseCSV(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (current || row.length) {
        row.push(current);
        rows.push(row);
        row = [];
        current = "";
      }
    } else {
      current += char;
    }
  }
  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }
  return rows;
}

type Call = {
  id: string;
  user_number: string;
  agent_number: string;
  status: string;
  duration: number;
  recording_url: string;
  transcript: string;
  summary: string;
  created_at: string;
};

export default function App() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [selected, setSelected] = useState<Call | null>(null);

  useEffect(() => {
    fetch("/calls.csv")
      .then(r => r.text())
      .then(text => {
        const [header, ...data] = parseCSV(text);
        const parsed = data.map(row => {
          const obj: any = {};
          header.forEach((h, i) => (obj[h] = row[i] || ""));
          return { ...obj, duration: Number(obj.duration || 0) };
        });
        setCalls(parsed);
      });
  }, []);

  const stats = useMemo(() => {
    const total = calls.length;
    const completed = calls.filter(c => c.status === "completed").length;
    const dropped = calls.filter(c => c.status === "dropped").length;
    const missed = calls.filter(c => c.status === "no-answer").length;
    return { total, completed, dropped, missed };
  }, [calls]);

  const max = Math.max(stats.completed, stats.dropped, stats.missed);

  return (
    <div style={{ padding: 32, fontFamily: "Inter, system-ui", background: "#f8fafc" }}>
      <h1 style={{ fontSize: 28 }}>Call Analytics Dashboard</h1>
      <p style={{ color: "#64748b", marginBottom: 24 }}>
        Calls, recordings & transcripts
      </p>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <KPI label="Total Calls" value={stats.total} />
        <KPI label="Completed" value={stats.completed} />
        <KPI label="Dropped" value={stats.dropped} />
        <KPI label="Missed" value={stats.missed} />
      </div>

      {/* SIMPLE BAR CHART */}
      <div style={{ marginTop: 32, background: "#fff", padding: 20, borderRadius: 12 }}>
        <h3 style={{ marginBottom: 12 }}>Call Status Distribution</h3>
        {["completed", "dropped", "no-answer"].map(s => {
          const value =
            s === "completed" ? stats.completed :
            s === "dropped" ? stats.dropped :
            stats.missed;
          return (
            <div key={s} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>{s}</div>
              <div style={{ background: "#e5e7eb", borderRadius: 6 }}>
                <div
                  style={{
                    width: `${(value / max) * 100 || 0}%`,
                    height: 10,
                    background:
                      s === "completed" ? "#22c55e" :
                      s === "dropped" ? "#ef4444" :
                      "#facc15",
                    borderRadius: 6
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* TABLE */}
      <div style={{ marginTop: 32, background: "#fff", borderRadius: 12 }}>
        <table width="100%" cellPadding={14}>
          <thead style={{ background: "#f1f5f9" }}>
            <tr>
              <th align="left">Time</th>
              <th align="left">User</th>
              <th align="left">Status</th>
              <th align="left">Duration</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {calls.map(c => (
              <tr key={c.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td>{new Date(c.created_at).toLocaleString()}</td>
                <td>+{c.user_number}</td>
                <td>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    background:
                      c.status === "completed" ? "#dcfce7" :
                      c.status === "no-answer" ? "#fef3c7" :
                      "#fee2e2"
                  }}>
                    {c.status}
                  </span>
                </td>
                <td>{c.duration}s</td>
                <td>
                  <button onClick={() => setSelected(c)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DRAWER */}
      {selected && (
        <div
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            width: 480,
            height: "100%",
            background: "#fff",
            padding: 24,
            boxShadow: "-4px 0 16px rgba(0,0,0,0.15)",
            overflow: "auto"
          }}
        >
          <button
            onClick={() => setSelected(null)}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              fontSize: 18,
              background: "transparent",
              border: "none",
              cursor: "pointer"
            }}
          >
            ✕
          </button>

          <h3>Call Details</h3>
          <p style={{ color: "#64748b" }}>{selected.summary}</p>

          {selected.recording_url && (
            <audio controls src={selected.recording_url} style={{ width: "100%", margin: "16px 0" }} />
          )}

          <h4>Transcript</h4>
          <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8 }}>
            {selected.transcript
              .split("\n")
              .map((line, i) => (
                <p key={i} style={{ margin: "6px 0" }}>
                  {line.startsWith("assistant")
                    ? <b>Assistant:</b>
                    : line.startsWith("user")
                    ? <b>User:</b>
                    : null}{" "}
                  {line.replace(/^(assistant|user):?/i, "")}
                </p>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({ label, value }: any) {
  return (
    <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #e5e7eb" }}>
      <div style={{ fontSize: 13, color: "#64748b" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
