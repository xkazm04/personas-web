export default function AmbientOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute left-[8%] top-[12%] h-140 w-140 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)" }}
      />
      <div
        className="absolute right-[8%] top-[36%] h-130 w-130 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.035) 0%, transparent 70%)" }}
      />
    </div>
  );
}
