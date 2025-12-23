
import { useEffect, useMemo, useState } from "react";

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
        const [header, ...rows] = text.split("\n");
        const keys = header.split(",");
        const data = rows
          .filter(Boolean)
          .map(r => {
            const values = r.split(",");
            return Object.fromEntries(keys.map((k, i) => [k, values[i]])) as any;
          });
        setCalls(data);
      });
  }, []);

  const stats = useMemo(() => {
    const total = calls.length;
    const completed = calls.filter(c => c.status === "completed").length;
    const missed = calls.filter(c => c.status === "no-answer").length;
    const avg =
      calls.reduce((a, b) => a + Number(b.duration || 0), 0) / (completed || 1);
    return { total, completed, missed, avg };
  }, [calls]);

  return (
    <div style={{ padding: 32, fontFamily: "system-ui", background: "#fafafa" }}>
      <h1>Call Analytics Dashboard</h1>
      <p style={{ color: "#666" }}>Calls, recordings & transcripts</p>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <KPI label="Total Calls" value={stats.total} />
        <KPI label="Completed" value={stats.completed} />
        <KPI label="Missed" value={stats.missed} />
        <KPI label="Avg Duration (s)" value={Math.round(stats.avg)} />
      </div>

      <table width="100%" cellPadding={12} style={{ background: "#fff" }}>
        <thead>
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
            <tr key={c.id}>
              <td>{new Date(c.created_at).toLocaleString()}</td>
              <td>{c.user_number}</td>
              <td>{c.status}</td>
              <td>{c.duration}s</td>
              <td>
                <button onClick={() => setSelected(c)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            width: 420,
            height: "100%",
            background: "#fff",
            padding: 20,
            borderLeft: "1px solid #ddd",
            overflow: "auto"
          }}
        >
          <h3>Call Details</h3>
          <p><b>User:</b> {selected.user_number}</p>
          <p><b>Status:</b> {selected.status}</p>
          <p>{selected.summary}</p>

          {selected.recording_url && (
            <audio controls src={selected.recording_url} style={{ width: "100%" }} />
          )}

          <h4>Transcript</h4>
          <pre style={{ background: "#f4f4f4", padding: 12 }}>
            {selected.transcript}
          </pre>

          <button onClick={() => setSelected(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

function KPI({ label, value }: any) {
  return (
    <div
      style={{
        background: "#fff",
        padding: 16,
        borderRadius: 8,
        border: "1px solid #ddd",
        minWidth: 160
      }}
    >
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
