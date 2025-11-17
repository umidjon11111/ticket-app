import { getDashboardStats } from "@/actions/dashboard.actions";
import DashboardClient from "./_components/DashboardClient";
import KarzinaTable from "./_components/KarzinaTable";

const AdminHomePage = async () => {
  const stats = await getDashboardStats();
  return (
    <div>
      <DashboardClient stats={stats} />
      <KarzinaTable />
    </div>
  );
};

export default AdminHomePage;
