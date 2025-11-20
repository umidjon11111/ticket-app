import { getDashboardStats } from "@/actions/dashboard.actions";
import DashboardClient from "./_components/DashboardClient";

const AdminHomePage = async () => {
  const stats = await getDashboardStats();
  return (
    <div>
      <DashboardClient stats={stats} />
    </div>
  );
};

export default AdminHomePage;
