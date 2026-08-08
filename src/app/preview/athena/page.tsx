import { notFound } from "next/navigation";
import AthenaPrototypeSwitcher from "./AthenaPrototypeSwitcher";

/**
 * Dev-only staging ground for the /athena flagship page. Hosts every
 * in-flight prototype behind a tab switcher (see AthenaPrototypeSwitcher)
 * so competing variants can be compared in place. Returns 404 in
 * production builds — nothing here ships to end users.
 */
export default function AthenaPreview() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <AthenaPrototypeSwitcher />;
}
