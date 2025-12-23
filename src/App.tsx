
import { useEffect, useMemo, useState } from "react";
import "./index.css";

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
    <div className="app">
      <h1>Call Analytics Dashboard</h1>
      <p className="subtitle">Calls, recordings & transcripts</p>

      <div className="kpis">
        <KPI label="Total Calls" value={stats.total} />
        <KPI label="Completed" value={stats.completed} />
        <KPI label="Missed" value={stats.missed} />
        <KPI label="Avg Duration (s)" value={Math.round(stats.avg)} />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Time</th>
            <th>User</th>
            <th>Status</th>
            <th>Duration</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {calls.map(c => (
            <tr key={c.id}>
              <td>{new Date(c.created_at).toLocaleString()}</td>
              <td>{c.user_number}</td>
              <td>
                <span className={`status ${c.status}`}>
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

      {selected && (
        <aside className="side">
          <h3>Call Details</h3>

          <p><b>User:</b> {selected.user_number}</p>
          <p><b>Status:</b> {selected.status}</p>
          <p className="summary">{selected.summary}</p>

          {selected.recording_url && (
            <audio controls src={selected.recording_url} />
          )}

          <h4>Transcript</h4>
          <pre>{selected.transcript}</pre>

          <button className="close" onClick={() => setSelected(null)}>
            Close
          </button>
        </aside>
      )}
    </div>
  );
}

function KPI({ label, value }: any) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  );
}
