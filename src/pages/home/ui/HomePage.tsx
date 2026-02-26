import { Button } from "@/shared/ui/button";

export function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
      <h1 className="text-4xl font-bold">EXE101 🚀</h1>
      <p className="text-muted-foreground">
        React + TypeScript + Tailwind v4 + FSD + shadcn/ui
      </p>
      <div className="flex gap-2">
        <Button>Get Started</Button>
        <Button variant="outline">Learn More</Button>
      </div>
    </main>
  );
}
