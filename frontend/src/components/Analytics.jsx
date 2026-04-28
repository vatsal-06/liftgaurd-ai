export default function Analytics({ result }) {
  return (
    <div className="analytics">
      <h3>LIVE ANALYTICS</h3>

      <div className="stat">
        <b>People:</b> {result?.summary?.num_people || 0}
      </div>

      <div className="stat">
        <b>Motion:</b> {result?.metrics?.motion_score || 0}
      </div>

      <div className="stat">
        <b>Fall:</b>{" "}
        {result?.metrics?.fall_detected ? "YES" : "NO"}
      </div>

      <div className="stat">
        <b>Distance:</b> {result?.metrics?.min_distance || "-"}
      </div>

      <button style={{ width: "100%", padding: 10 }}>
        {result?.summary?.action || "MONITOR"}
      </button>
    </div>
  );
}