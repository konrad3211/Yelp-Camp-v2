import { Outlet } from "react-router-dom";
import Header from "@/components/Header";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
