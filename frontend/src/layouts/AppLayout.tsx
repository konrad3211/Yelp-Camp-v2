import { Outlet } from "react-router-dom";
import Header from "@/components/Header";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
