/**
 * Single source for every public number and date the search-facing surfaces
 * (metadata, JSON-LD, OG cards, sitemap) state. Counts are derived from the
 * shipped catalogs at module load; nothing here is typed by hand, and
 * `public-claims.test.ts` fails on a hand-typed `\d+\+` floor in those surfaces.
 *
 * SERVER-ONLY, enforced by `import "server-only"` below: it imports the full connector and template
 * catalogs. A client import fails the build. Client components must keep importing the light constants from
 * `@/lib/seo` instead.
 */
import "server-only";
import { connectors } from "@/data/connectors";
import { templateList } from "@/lib/templates";

export const CONNECTOR_COUNT = connectors.length;
export const TEMPLATE_COUNT = templateList.length;

export const SITE_DESCRIPTION =
  `Build and orchestrate multi-agent AI pipelines on your own machine. Multi-provider AI, AES-256 encrypted credential vault, self-healing execution, and ${CONNECTOR_COUNT} integrations. No code required.`;

export const SOFTWARE_DESCRIPTION =
  `Build and orchestrate multi-agent AI pipelines locally or in the cloud. Multi-provider AI, AES-256 encrypted credential vault, self-healing execution, and ${CONNECTOR_COUNT} integrations - no code required.`;

export const CONNECTOR_FEATURE_LINE =
  `${CONNECTOR_COUNT} built-in integrations (Slack, GitHub, Jira, Notion, etc.)`;

export const TEMPLATES_OG_SUBTITLE =
  `Browse ${TEMPLATE_COUNT} ready-to-use agent templates. Email triage, DevOps automation, content pipelines, and more.`;
