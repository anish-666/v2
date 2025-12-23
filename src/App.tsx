
import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
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
        const data = rows.map(r => {
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
      calls.reduce((a, b) => a + Number(b.duration || 0), 0) /
      (completed || 1);
    return { total, completed, missed, avg };
  }, [calls]);

  return (
    <div className="app">
      <h1>Call Analytics Dashboard</h1>

      <div className="kpis">
        <KPI label="Total Calls" value={stats.total} />
        <KPI label="Completed" value={stats.completed} />
        <KPI label="Missed" value={stats.missed} />
        <KPI label="Avg Duration (s)" value={Math.round(stats.avg)} />
      </div>

      <div className="charts">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={[
                { name: "Completed", value: stats.completed },
                { name: "Missed", value: stats.missed },
              ]}
              dataKey="value"
            >
              <Cell fill="#22c55e" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
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
              <td>{c.status}</td>
              <td>{c.duration}</td>
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
          <p>{selected.summary}</p>

          {selected.recording_url && (
            <audio controls src={selected.recording_url} />
          )}

          <pre>{selected.transcript}</pre>

          <button onClick={() => setSelected(null)}>Close</button>
        </aside>
      )}
    </div>
  );
}

function KPI({ label, value }: any) {
  return (
    <div className="kpi">
      <div>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}
