# Security & Compliance — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 2, Low: 1)

## 1. Architecture layer detail text is mouse-hover-only — invisible to keyboard, touch, and screen-reader users
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: hover-only-content-a11y
- **File**: `src/app/security/ArchitectureFlow.tsx:116`
- **Scenario**: Each `LayerCard` reveals its expanded detail paragraph (encryption specifics, keyring backends, air-gap notes) only via `onMouseEnter`/`onMouseLeave`. There is no focus handler, no button/disclosure semantics, and the card is `cursor-default`, so keyboard users, touch/mobile users (the whole `sm:` audience), and screen-reader users can never reach this content — and get no hint it exists.
- **Root cause**: The reveal is bound exclusively to mouse-hover state (`useState(hovered)` toggled by mouse events) instead of a focusable disclosure pattern like the sibling `ComplianceRow`/`SecurityFAQItem` components already implement correctly with `aria-expanded`/`aria-controls`.
- **Impact**: Security-substantiating copy (DPAPI/Keychain/libsecret, "no relay or proxy") is unreachable for a large share of visitors on a page whose entire job is building trust; WCAG 2.1.1 (keyboard) and 1.4.13 (content on hover) failures.
- **Fix sketch**: Make the card a `<button>` (or add `tabIndex={0}` + focus/blur + Enter/Space toggle) with `aria-expanded`/`aria-controls` on the detail region, mirroring `SecurityFAQItem`; keep hover as a convenience trigger. On touch, tap toggles.

## 2. `LAYER_DETAILS` keyed by display-name strings duplicated from the data file — renames silently drop detail content
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: stringly-keyed-data-drift
- **File**: `src/app/security/ArchitectureFlow.tsx:7`
- **Scenario**: A copywriter edits `ARCHITECTURE_LAYERS` in `src/data/security.ts` (e.g. "Your AI Provider" → "AI Provider"). The page still renders, but `LAYER_DETAILS[layer.name]` returns `undefined` and the hover detail for that layer silently disappears — no type error, no runtime error, no test.
- **Root cause**: The layer detail text lives in the component, keyed by the human-readable `name` from a different file, instead of being a `detail` field on `ArchitectureLayer` in `src/data/security.ts` (where description/color already live). The layout.tsx comment at `src/app/security/layout.tsx:18` shows the team already learned this exact lesson for FAQs ("Previously this was a hand-maintained duplicate") — the same anti-pattern was reintroduced here.
- **Impact**: Silent content loss on any copy tweak; two sources of truth for architecture copy; the AES/keyring details in `LAYER_DETAILS` also textually duplicate `SECURITY_PILLARS[1]`, so security claims can drift apart across sections of the same page.
- **Fix sketch**: Add `detail: string` to `ArchitectureLayer` in `src/data/security.ts`, move the four strings there, delete `LAYER_DETAILS`, and read `layer.detail` directly — making omission a compile-time error.

## 3. Compliance rows assert legal conclusions ("No BAA needed", "device encryption satisfies safeguard requirements") with no recorded basis or disclaimer
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: unsourced-compliance-claims
- **File**: `src/data/security.ts:91`
- **Scenario**: A hospital compliance officer reads the HIPAA row: "No Business Associate Agreement (BAA) needed with Personas" and "Your existing device encryption satisfies safeguard requirements". The second claim is categorically false for many orgs (HIPAA Security Rule safeguards go far beyond disk encryption), and nothing on the page or in the data file records who vetted these statements, under what assumptions (BYO provider keys still require a BAA with the AI provider for PHI), or offers a "not legal advice" qualifier.
- **Root cause**: Checklist copy was authored as marketing bullets without distinguishing "Personas-scope obligations removed" from "your overall compliance obligations" — an undocumented assumption that readers infer the narrower scope.
- **Impact**: Overstated legal claims on a trust page create liability exposure and erode credibility with exactly the security-conscious buyers this page targets; the GDPR/SOC 2 rows share the pattern in milder form.
- **Fix sketch**: Rescope absolute bullets to the Personas relationship ("No BAA needed *with Personas* — your AI provider BAA still applies for PHI"), soften "satisfies" to "is the applicable scope", add a one-line "informational, not legal advice" note under the compliance legend, and record the review rationale as a comment in `security.ts`.

## 4. Two parallel accordion implementations with divergent semantics — `ComplianceRow` vs `SecurityFAQItem`
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: duplicate-disclosure-component
- **File**: `src/app/security/security-page/ComplianceRow.tsx:25`
- **Scenario**: `ComplianceRow` and `SecurityFAQItem` each hand-roll the same disclosure pattern (button + `aria-expanded`/`aria-controls` + `AnimatePresence` height animation + reduced-motion branch + rotating `ChevronDown`). They have already drifted: ComplianceRow puts an `<h4>` inside its `<button>` (heading-inside-button is announced awkwardly and skips h2→h4 under `SectionHeading`), while the FAQ question is a plain `<span>` with no heading semantics at all; padding, id schemes (`label`-slug vs `idx`), and typography also differ. Both chevrons lack `aria-hidden`.
- **Root cause**: The accordion was implemented twice per-section instead of extracting one `Disclosure` primitive with consistent heading structure.
- **Impact**: Inconsistent screen-reader experience and heading outline within one page; every future accordion tweak (motion timing, a11y fix) must be applied twice and can drift again — as the `LayerCard` hover reveal (finding 1) already demonstrates a third divergent expansion pattern on this page.
- **Fix sketch**: Extract a shared `Disclosure` component (trigger renders `<h3>` wrapping the button per the ARIA accordion pattern, `aria-hidden` chevron, single reduced-motion transition config); pass row/FAQ content as props and reuse it for the LayerCard detail toggle.

## 5. Pulse-connector animation encodes an undocumented data-flow direction with magic numbers
- **Severity**: Low
- **Agent**: ambiguity_guardian
- **Category**: magic-number-animation-intent
- **File**: `src/app/security/ArchitectureFlow.tsx:27`
- **Scenario**: `delay = (TOTAL - index) * 0.4`, `values="0 40;0 -10"`, `dur="3s"`, and `keyTimes="0;0.1;0.9;1"` together animate pulses traveling upward (machine → provider), staggered bottom-first. Nothing explains why the flow is upward, why the stagger inverts index, or what the 0.4s/3s constants represent — a future editor reordering `ARCHITECTURE_LAYERS` (provider is currently first/top, machine last/bottom) would silently reverse the diagram's meaning.
- **Root cause**: The diagram's semantic (requests originate at your machine and flow up to the provider) lives only implicitly in animation constants; layer order in `src/data/security.ts:187` carries load-bearing meaning with no comment.
- **Impact**: Low user impact today, but the page's central architecture claim ("no middleman") depends on this ordering; an innocent data reorder or delay tweak breaks the story without any signal.
- **Fix sketch**: Name the constants (`PULSE_STAGGER_S = 0.4`, `PULSE_PERIOD_S = 3`), add a two-line comment stating "pulses travel upward: machine → provider; stagger starts at the bottom", and note in `security.ts` that `ARCHITECTURE_LAYERS` order is top-to-bottom render order.
