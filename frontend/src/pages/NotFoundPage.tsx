import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">404</p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Page not found
        </h1>

        <p className="mt-3 text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>

        <Button className="mt-6" nativeButton={false} render={<Link to="/" />}>
          Back to home
        </Button>
      </div>
    </section>
  );
};

export default NotFoundPage;
