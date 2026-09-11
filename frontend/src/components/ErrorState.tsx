import { AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

const ErrorState = ({
  message = "Something went wrong",
  onRetry,
}: ErrorStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-6 text-destructive" />
        </div>

        <h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>

        <p className="mt-2 text-sm text-muted-foreground">{message}</p>

        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
            Back
          </Button>

          {onRetry && <Button onClick={onRetry}>Try again</Button>}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
