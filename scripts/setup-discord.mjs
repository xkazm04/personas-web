#!/usr/bin/env node
/**
 * Discord server provisioner for the Personas community.
 *
 * One-shot: creates roles, categories, channels, permission overwrites,
 * rules/welcome posts, AutoMod rules, and a permanent invite link.
 *
 * Usage:
 *   1. Create an app + bot at https://discord.com/developers/applications
 *   2. Enable "Server Members Intent" and "Message Content Intent" on the Bot tab
 *   3. Invite the bot to your server with Administrator scope:
 *        https://discord.com/oauth2/authorize?client_id=<APP_ID>&permissions=8&scope=bot
 *      (the script prints the exact URL if the bot isn't in the guild yet)
 *   4. Enable Developer Mode in Discord (User Settings -> Advanced) and right-click
 *      your server -> Copy Server ID
 *   5. Put both values in .env.local (gitignored):
 *        DISCORD_BOT_TOKEN=...
 *        DISCORD_GUILD_ID=...
 *   6. node --env-file=.env.local scripts/setup-discord.mjs
 *
 * Delete this file once the server is provisioned. The bot token should
 * be regenerated in the Developer Portal immediately after.
 */
import process from "node:process";

const API = "https://discord.com/api/v10";
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

if (!TOKEN) {
  console.error("Missing DISCORD_BOT_TOKEN env var.");
  console.error("Pass it via: node --env-file=.env.local scripts/setup-discord.mjs");
  process.exit(1);
}
if (!GUILD_ID) {
  console.error("Missing DISCORD_GUILD_ID env var.");
  console.error("Enable Developer Mode in Discord, right-click your server, Copy Server ID.");
  process.exit(1);
}

async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bot ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "personas-web setup-discord (https://github.com)",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 429) {
    const retry = Number(res.headers.get("retry-after") ?? "1");
    console.warn(`  rate-limited, sleeping ${retry}s`);
    await sleep(retry * 1000);
    return api(method, path, body);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} -> ${res.status} ${res.statusText}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Discord permission bits we use
const PERM = {
  ADMINISTRATOR: 1n << 3n,
  MANAGE_CHANNELS: 1n << 4n,
  MANAGE_GUILD: 1n << 5n,
  MANAGE_MESSAGES: 1n << 13n,
  VIEW_CHANNEL: 1n << 10n,
  SEND_MESSAGES: 1n << 11n,
  ADD_REACTIONS: 1n << 6n,
  MENTION_EVERYONE: 1n << 17n,
};

async function main() {
  // ── Preflight ───────────────────────────────────────────────────────
  let me;
  try {
    me = await api("GET", "/users/@me");
  } catch (err) {
    if (String(err).includes("401")) {
      console.error("Token is invalid or revoked. Reset it in the Developer Portal and try again.");
      process.exit(1);
    }
    throw err;
  }
  console.log(`Bot: ${me.username}#${me.discriminator ?? "0"} (id ${me.id})`);

  let guild;
  try {
    guild = await api("GET", `/guilds/${GUILD_ID}`);
  } catch (err) {
    if (String(err).match(/(403|404|Missing Access|Unknown Guild)/i)) {
      const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${me.id}&permissions=8&scope=bot%20applications.commands`;
      console.error("Bot is not in this server (or lacks access). Invite it first:");
      console.error(oauthUrl);
      process.exit(1);
    }
    throw err;
  }
  console.log(`Guild: ${guild.name} (id ${guild.id})`);
  console.log("");

  // ── 1. Guild-level settings ────────────────────────────────────────
  await api("PATCH", `/guilds/${GUILD_ID}`, {
    verification_level: 2, // MEDIUM (verified email + 5 min on Discord)
    default_message_notifications: 1, // MENTIONS_ONLY
    explicit_content_filter: 2, // ALL_MEMBERS
    system_channel_flags: 0,
  });
  console.log("Guild settings: verification=MEDIUM, notifs=MENTIONS, explicit-filter=ALL");

  // ── 2. Roles (created bottom-up; Discord stacks new roles at lowest position) ──
  // Order matters: create lowest-rank first so the final stack reads
  // Founder > Maintainer > Contributor > Beta > Community > @everyone
  const roleDefs = [
    { name: "Community", color: 0x5865f2, permissions: "0", hoist: false, mentionable: false },
    { name: "Beta Tester", color: 0x00b8d4, permissions: "0", hoist: true, mentionable: true },
    { name: "Contributor", color: 0x10b981, permissions: "0", hoist: true, mentionable: true },
    {
      name: "Maintainer",
      color: 0xf59e0b,
      permissions: String(PERM.MANAGE_MESSAGES | PERM.MENTION_EVERYONE),
      hoist: true,
      mentionable: true,
    },
    {
      name: "Founder",
      color: 0xef4444,
      permissions: String(PERM.ADMINISTRATOR),
      hoist: true,
      mentionable: true,
    },
  ];

  console.log("\nRoles:");
  const roles = {};
  for (const def of roleDefs) {
    const r = await api("POST", `/guilds/${GUILD_ID}/roles`, def);
    roles[def.name] = r.id;
    console.log(`  + ${def.name}`);
    await sleep(200);
  }

  // ── 3. Categories ──────────────────────────────────────────────────
  const categoryDefs = [
    { key: "welcome", name: "welcome" },
    { key: "personas", name: "personas" },
    { key: "community", name: "community" },
    { key: "support", name: "support" },
    { key: "dev", name: "dev" },
  ];

  console.log("\nCategories:");
  const categories = {};
  for (const def of categoryDefs) {
    const c = await api("POST", `/guilds/${GUILD_ID}/channels`, {
      name: def.name,
      type: 4, // GUILD_CATEGORY
    });
    categories[def.key] = c.id;
    console.log(`  + ${def.name}`);
    await sleep(200);
  }

  // ── 4. Channels ────────────────────────────────────────────────────
  // Permission overwrites for read-only channels
  const readOnlyForEveryone = (everyoneId, staffRoleIds) => [
    {
      id: everyoneId,
      type: 0,
      allow: String(PERM.VIEW_CHANNEL | PERM.ADD_REACTIONS),
      deny: String(PERM.SEND_MESSAGES),
    },
    ...staffRoleIds.map((id) => ({
      id,
      type: 0,
      allow: String(PERM.SEND_MESSAGES | PERM.VIEW_CHANNEL),
      deny: "0",
    })),
  ];

  const channelDefs = [
    // welcome
    {
      name: "rules",
      topic: "Server rules. Read before posting. Updated periodically.",
      parent: "welcome",
      readOnly: true,
    },
    {
      name: "announcements",
      topic: "Release notes, roadmap updates, scheduled maintenance.",
      parent: "welcome",
      readOnly: true,
    },
    {
      name: "introductions",
      topic: "Say hi and tell us what you're building.",
      parent: "welcome",
      rate_limit_per_user: 30,
    },

    // personas
    { name: "general", topic: "Anything Personas-related.", parent: "personas" },
    {
      name: "showcase",
      topic: "Show off agents, pipelines, and templates you've built.",
      parent: "personas",
    },
    {
      name: "feature-requests",
      topic: "Propose features. Use 👍 / 👎 reactions to vote.",
      parent: "personas",
    },
    {
      name: "roadmap-voting",
      topic: "Coordinate votes on the public roadmap (Supabase-backed in-app).",
      parent: "personas",
    },

    // community
    {
      name: "off-topic",
      topic: "Coffee, music, side projects. Keep it kind.",
      parent: "community",
    },
    {
      name: "jobs-and-collabs",
      topic: "Hiring, looking for work, or seeking collaborators.",
      parent: "community",
    },

    // support
    {
      name: "help",
      topic: "Get help configuring agents, connectors, and pipelines.",
      parent: "support",
    },
    {
      name: "bugs",
      topic: "Report bugs. Include repro steps and what you expected.",
      parent: "support",
      rate_limit_per_user: 10,
    },
    {
      name: "orchestrator",
      topic: "Self-hosted orchestrator questions (NEXT_PUBLIC_ORCHESTRATOR_URL).",
      parent: "support",
    },

    // dev
    {
      name: "contributing",
      topic: "Pull requests, code review, design discussion.",
      parent: "dev",
    },
    {
      name: "i18n",
      topic: "Localization help across the 14 supported locales.",
      parent: "dev",
    },
    {
      name: "connectors",
      topic: "Building and proposing new connectors.",
      parent: "dev",
    },
  ];

  console.log("\nChannels:");
  const channels = {};
  const everyoneId = GUILD_ID; // @everyone role id == guild id
  for (const def of channelDefs) {
    const payload = {
      name: def.name,
      type: 0, // GUILD_TEXT
      topic: def.topic,
      parent_id: categories[def.parent],
      rate_limit_per_user: def.rate_limit_per_user ?? 0,
    };
    if (def.readOnly) {
      payload.permission_overwrites = readOnlyForEveryone(everyoneId, [
        roles.Maintainer,
        roles.Founder,
      ]);
    }
    const c = await api("POST", `/guilds/${GUILD_ID}/channels`, payload);
    channels[def.name] = c.id;
    console.log(`  + #${def.name}`);
    await sleep(200);
  }

  // ── 5. Welcome + rules messages ────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);

  const rulesBody =
    "**Personas Discord - Rules**\n" +
    "\n" +
    "**1. Be respectful.** Disagree on ideas, never on people. No harassment, hate speech, or slurs.\n" +
    `**2. Stay on-topic.** Use the right channel. Off-topic chat goes in <#${channels["off-topic"]}>.\n` +
    `**3. No spam, no self-promo.** Sharing your project in <#${channels.showcase}> is welcome. Drive-by promo is not.\n` +
    "**4. No piracy, leaked content, or NSFW.**\n" +
    `**5. Don't ping @everyone or roles without permission.** Tag a Maintainer in <#${channels.help}> if you need eyes on something.\n` +
    `**6. English is the default**, but other languages are welcome in <#${channels["off-topic"]}> and <#${channels.i18n}>.\n` +
    "**7. Report problems** to a Maintainer or Founder via DM.\n" +
    "\n" +
    "By participating you agree to Discord's Community Guidelines and Terms of Service.\n" +
    "\n" +
    `*Updated ${today}*`;

  await api("POST", `/channels/${channels.rules}/messages`, { content: rulesBody });
  console.log("\n  + posted #rules");

  const welcomeBody =
    "Welcome to **Personas** - a multi-agent AI orchestration platform.\n" +
    "\n" +
    "**Get started**\n" +
    `- Read <#${channels.rules}> first.\n` +
    `- Drop a hello in <#${channels.introductions}> - what are you building?\n` +
    `- Chat in <#${channels.general}>.\n` +
    "\n" +
    "**Need help?**\n" +
    `- Setup / config: <#${channels.help}>\n` +
    `- Self-hosted orchestrator: <#${channels.orchestrator}>\n` +
    `- Found a bug: <#${channels.bugs}>\n` +
    "\n" +
    "**Shape the product**\n" +
    `- Suggest features in <#${channels["feature-requests"]}>\n` +
    `- Vote on the roadmap in <#${channels["roadmap-voting"]}>\n` +
    "\n" +
    "**Contribute**\n" +
    `- Code, docs, translations: <#${channels.contributing}>\n` +
    `- 14 locales - help us keep them in lockstep in <#${channels.i18n}>\n` +
    "\n" +
    "Have fun, build cool things, be kind.";

  await api("POST", `/channels/${channels.announcements}/messages`, { content: welcomeBody });
  console.log("  + posted #announcements welcome");

  // ── 6. AutoMod ────────────────────────────────────────────────────
  try {
    await api("POST", `/guilds/${GUILD_ID}/auto-moderation/rules`, {
      name: "Block profanity and slurs",
      event_type: 1, // MESSAGE_SEND
      trigger_type: 4, // KEYWORD_PRESET
      trigger_metadata: { presets: [1, 2, 3], allow_list: [] }, // PROFANITY, SEXUAL_CONTENT, SLURS
      actions: [{ type: 1 }], // BLOCK_MESSAGE
      enabled: true,
    });
    console.log("\n  + AutoMod: profanity/slurs");
  } catch (err) {
    console.warn(`  ! AutoMod profanity rule failed: ${err.message}`);
  }

  try {
    await api("POST", `/guilds/${GUILD_ID}/auto-moderation/rules`, {
      name: "Block mention spam",
      event_type: 1,
      trigger_type: 5, // MENTION_SPAM
      trigger_metadata: { mention_total_limit: 5 },
      actions: [{ type: 1 }],
      enabled: true,
    });
    console.log("  + AutoMod: mention spam");
  } catch (err) {
    console.warn(`  ! AutoMod mention-spam rule failed: ${err.message}`);
  }

  // ── 7. Permanent invite ───────────────────────────────────────────
  const invite = await api("POST", `/channels/${channels.introductions}/invites`, {
    max_age: 0, // never expires
    max_uses: 0, // unlimited
    temporary: false,
    unique: true,
  });

  console.log("\n========================================================");
  console.log("Provisioning complete.");
  console.log("");
  console.log(`Permanent invite: https://discord.gg/${invite.code}`);
  console.log("");
  console.log("Next steps:");
  console.log("  1. Set NEXT_PUBLIC_DISCORD_INVITE_URL in .env.local to the URL above.");
  console.log("  2. Regenerate the bot token in the Developer Portal (the one you used");
  console.log("     was shared in chat).");
  console.log("  3. Delete scripts/setup-discord.mjs - it has served its purpose.");
  console.log("========================================================");
}

main().catch((err) => {
  console.error("\nFailed:", err.message ?? err);
  process.exit(1);
});
