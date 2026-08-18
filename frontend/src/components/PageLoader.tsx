import { Loader2 } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="flex min-h-75 items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
};

export default PageLoader;
