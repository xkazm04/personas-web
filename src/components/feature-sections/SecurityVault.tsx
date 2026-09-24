"use client";

import IllustrationSwitcher from "@/components/illustrate/IllustrationSwitcher";
import Current from "./SecurityVault.current";
import V_sealed_device from "./SecurityVault.sealed-device";
import V_nested_vault from "./SecurityVault.nested-vault";
import V_vault_silhouette from "./SecurityVault.vault-silhouette";

/* /illustrate prototype (1.1.0, picture first): current + three directions. */
const VARIANTS = [
  { key: "current", label: "Current", hint: "Three encrypted pillars", Component: Current },
  { key: "sealed-device", label: "Sealed device", hint: "Keys lock inside; nothing crosses out", Component: V_sealed_device },
  { key: "nested-vault", label: "Nested vault", hint: "Three rings close around one key", Component: V_nested_vault },
  { key: "vault-silhouette", label: "Vault silhouette", hint: "The real vault, reduced to shape", Component: V_vault_silhouette },
];

export default function SecurityVault() {
  return <IllustrationSwitcher section="security" variants={VARIANTS} props={{}} />;
}
