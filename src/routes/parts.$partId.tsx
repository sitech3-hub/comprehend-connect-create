import { createFileRoute, Navigate, useParams } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { PartNav } from "@/components/PartNav";
import { PartView } from "@/components/PartView";

export const Route = createFileRoute("/parts/$partId")({
  component: PartPage,
});

function PartPage() {
  const { user, loading } = useAuth();
  const { partId } = useParams({ from: "/parts/$partId" });
  const id = Number(partId);

  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (![1, 2, 3].includes(id)) return <Navigate to="/parts/$partId" params={{ partId: "1" }} />;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <PartNav />
      <PartView partId={id as 1 | 2 | 3} />
    </div>
  );
}
