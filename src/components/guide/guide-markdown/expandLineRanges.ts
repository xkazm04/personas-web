export function expandLineRanges(spec: string): number[] {
  const out: number[] = [];
  for (const part of spec.split(",")) {
    const range = part.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (!range) continue;
    const a = parseInt(range[1], 10);
    const b = range[2] ? parseInt(range[2], 10) : a;
    for (let n = a; n <= b; n++) out.push(n);
  }
  return out;
}
