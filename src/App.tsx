import { useState } from "react";

/**
 * REAL DATA (from your CSV)
 * You can add all rows here
 */
const CALLS = [
  {
    id: "3c26ccfe-ba25-42cd-b7f0-475d0686cc94",
    time: "2025-12-20 07:54",
    caller: "+91 9811024270",
    agent: "+91 8035737708",
    status: "Completed",
    duration: 193,
    outcome: "Connected",
    recordingUrl:
      "https://bolna-recordings-india.s3.ap-south-1.amazonaws.com/...",
    transcript:
      "Agent: Hello...\nUser: I am organizing an event...\nAgent: Sure, let me help.",
    summary:
      "User called to discuss event organization and pricing.",
  },
  {
    id: "2a2f7a96-3637-4b9c-8812-0fbc51e2c68e",
    time: "2025-12-20 07:54",
    caller: "+91 9886400852",
    agent: "+91 8035737708",
    status: "Dropped",
    duration: 223,
    outcome: "Dropped",
    recordingUrl:
      "https://bolna-recordings-india.s3.ap-south-1.amazonaws.com/...",
    transcript:
      "Agent: Hello...\nUser: Can you hear me?\n(Call dropped)",
    summary:
      "Call dropped after partial conversation.",
  },
  {
    id: "9bcb749d-db68-40ad-b37a-7fec62a705e5",
    time: "2025-12-20 07:55",
    caller: "+91 9886523472",
    agent: "+91 8035737708",
    status: "No Answer",
    duration: 0,
    outcome: "Missed",
    recordingUrl: "",
    transcript: "No answer from user.",
    summary: "User did not answer the call.",
  },
];

/* =====================
   HELPERS
   ===================== */
const formatDuration = (s: number) =>
  s === 0 ? "0:00" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function App() {
  const [selected, setSelected] = useState<any | null>(null);

  const total = CALLS.length;
  const completed = CALLS.filter(c => c.status === "Completed").length;
  const missed = CALLS.filter(c => c.status === "No Answer").length;
  const avgDuration =
    CALLS.reduce((a, b) => a + b.duration, 0) / (completed || 1);

  return (
    <div style={{ padding: 32, fontFamily: "system-ui", background: "#fafafa" }}>
      <h1>Call Analytics Dashboard</h1>
      <p style={{ color: "#666" }}>
        Calls, recordings, transcripts & performance overview
      </p>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 20, marginTop: 24 }}>
        <KPI label="Total Calls" value={total} />
        <KPI label="Completed" value={completed} />
        <KPI label="Missed" value={missed} />
        <KPI
          label="Avg Duration"
          value={formatDuration(Math.round(avgDuration))}
        />
      </div>

      {/* TABLE */}
      <h2 style={{ marginTop: 40 }}>Call History</h2>
      <table width="100%" cellPadding={10} style={{ background: "#fff" }}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Caller</th>
            <th>Status</th>
            <th>Duration</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {CALLS.map(call => (
            <tr key={call.id}>
              <td>{call.time}</td>
              <td>{call.caller}</td>
              <td>{call.status}</td>
              <td>{formatDuration(call.duration)}</td>
              <td>
                <button onClick={() => setSelected(call)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* SIDE PANEL */}
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
          }}
        >
          <h3>Call Details</h3>
          <p><b>Caller:</b> {selected.caller}</p>
          <p><b>Status:</b> {selected.status}</p>
          <p><b>Summary:</b> {selected.summary}</p>

          <h4>Recording</h4>
          {selected.recordingUrl ? (
            <audio controls style={{ width: "100%" }}>
              <source src={selected.recordingUrl} />
            </audio>
          ) : (
            <p>No recording available</p>
          )}

          <h4>Transcript</h4>
          <pre style={{ background: "#f4f4f4", padding: 10 }}>
            {selected.transcript}
          </pre>

          <button onClick={() => setSelected(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

/* =====================
   KPI
   ===================== */
function KPI({ label, value }: { label: string; value: any }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: 16,
        borderRadius: 8,
        border: "1px solid #ddd",
        minWidth: 160,
      }}
    >
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
