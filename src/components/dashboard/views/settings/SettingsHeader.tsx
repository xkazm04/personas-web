import GradientText from "@/components/GradientText";

/** T0 frame: paints with the view and never animates (loading-orchestration standard). */
export function SettingsHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight">
        <GradientText variant="silver">{title}</GradientText>
      </h1>
      <p className="mt-1 text-base text-muted-dark">{subtitle}</p>
    </div>
  );
}
