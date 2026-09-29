/** A status lamp. `on` glows with the signal colour, `ok`/`bad` use status colours. */
export default function LnLed({
  state = "off",
  className,
}: {
  state?: "off" | "on" | "ok" | "bad";
  className?: string;
}) {
  return (
    <i
      aria-hidden="true"
      className={["ln-led", state !== "off" && `ln-${state}`, className].filter(Boolean).join(" ")}
    />
  );
}
