export default function Dashboard() {
  return (
    <div className="p-6">
      <h1>Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="p-4 border">Total Calls</div>
        <div className="p-4 border">Active Campaigns</div>
        <div className="p-4 border">Success Rate</div>
      </div>
    </div>
  );
}