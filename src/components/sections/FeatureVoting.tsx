"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Apple, Globe, LayoutDashboard, Building2 } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { trackFeatureVote } from "@/lib/analytics";
import { VoteCard, CustomRequest, type Feature, type ShippedInfo } from "./feature-voting";

const features: Feature[] = [
  {
    id: "macos",
    icon: Apple,
    title: "macOS Support",
    subtitle: "Native experience",
    description:
      "Full native macOS build with Apple Silicon optimization, Spotlight integration, and menu bar agent controls.",
    accent: "cyan",
    seedVotes: 342,
  },
  {
    id: "i18n",
    icon: Globe,
    title: "Internationalization",
    subtitle: "Global reach",
    description:
      "Multi-language agent instructions, localized UI, and region-aware scheduling for worldwide teams.",
    accent: "purple",
    seedVotes: 189,
  },
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Web Dashboard",
    subtitle: "Monitor anywhere",
    description:
      "Browser-based dashboard for real-time agent monitoring, execution history, and fleet management from any device.",
    accent: "emerald",
    seedVotes: 276,
  },
  {
    id: "enterprise",
    icon: Building2,
    title: "Enterprise Projects",
    subtitle: "Team-scale ops",
    description:
      "Multi-tenant workspaces, RBAC, audit logs, SSO integration, and shared agent templates across your organization.",
    accent: "amber",
    seedVotes: 214,
  },
];

function getVoterId(): string {
  const key = "personas_voter_id";
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export default function FeatureVoting() {
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>(() => {
    const seed: Record<string, number> = {};
    for (const f of features) seed[f.id] = f.seedVotes;
    return seed;
  });
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [voterId, setVoterId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [shippedFeatures, setShippedFeatures] = useState<ShippedInfo[]>([]);
  const userVotesRef = useRef(userVotes);

  useEffect(() => {
    userVotesRef.current = userVotes;
  }, [userVotes]);

  useEffect(() => {
    const id = getVoterId();
    setVoterId(id);

    fetch(`/api/votes?voterId=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.counts) setVoteCounts(data.counts);
        if (data.userVotes) setUserVotes(new Set(data.userVotes));
        if (data.userEmail) setUserEmail(data.userEmail);
        if (data.shipped) setShippedFeatures(data.shipped);
      })
      .catch(() => {
        // Keep seed counts on failure
      });
  }, []);

  const handleVote = useCallback(
    (featureId: string) => {
      if (!voterId) return;

      const wasVoted = userVotesRef.current.has(featureId);
      trackFeatureVote(featureId, wasVoted ? "undo" : "upvote");

      // Optimistic update
      setUserVotes((prev) => {
        const next = new Set(prev);
        if (wasVoted) next.delete(featureId);
        else next.add(featureId);
        userVotesRef.current = next;
        return next;
      });
      setVoteCounts((prev) => ({
        ...prev,
        [featureId]: (prev[featureId] || 0) + (wasVoted ? -1 : 1),
      }));

      // Persist to server
      fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureId, voterId }),
      }).catch(() => {
        // Revert on failure
        setUserVotes((prev) => {
          const next = new Set(prev);
          if (wasVoted) next.add(featureId);
          else next.delete(featureId);
          userVotesRef.current = next;
          return next;
        });
        setVoteCounts((prev) => ({
          ...prev,
          [featureId]: (prev[featureId] || 0) + (wasVoted ? 1 : -1),
        }));
      });
    },
    [voterId],
  );

  const shippedMap = useMemo(
    () => new Map(shippedFeatures.map((s) => [s.feature_id, s])),
    [shippedFeatures],
  );

  const sorted = useMemo(
    () => [...features].sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0)),
    [voteCounts],
  );

  const totalVotes = useMemo(
    () => Object.values(voteCounts).reduce((s, c) => s + c, 0),
    [voteCounts],
  );

  return (
    <SectionWrapper id="vote" dotGrid>
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute right-[10%] top-[15%] h-[400px] w-[400px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute left-[5%] bottom-[20%] h-[350px] w-[350px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(6,182,212,0.03) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Header */}
      <motion.div variants={fadeUp} className="text-center relative">
        <span className="inline-block rounded-full border border-brand-purple/30 bg-brand-purple/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-brand-purple shadow-[0_0_15px_rgba(168,85,247,0.2)] font-mono mb-6">
          Community
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-6xl drop-shadow-md">
          Vote for{" "}
          <GradientText className="drop-shadow-lg">what&apos;s next</GradientText>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-dark leading-relaxed font-light">
          Help us prioritize. Pick the features that matter most to you
          and shape the future of Personas.
        </p>
      </motion.div>

      {/* Cards grid */}
      <motion.div
        variants={staggerContainer}
        className="mt-16 grid gap-5 sm:grid-cols-2"
      >
        {sorted.map((feature) => (
          <VoteCard
            key={feature.id}
            feature={feature}
            count={voteCounts[feature.id] || 0}
            voted={userVotes.has(feature.id)}
            onVote={handleVote}
            voterId={voterId}
            userEmail={userEmail}
            shippedInfo={shippedMap.get(feature.id) ?? null}
          />
        ))}
      </motion.div>

      {/* Custom feature request */}
      <CustomRequest />

      {/* Footer note */}
      <motion.div variants={fadeUp} className="mt-8 text-center">
        <p className="text-xs font-mono text-muted-dark/50 tracking-wide">
          {totalVotes.toLocaleString()} total
          votes cast&ensp;·&ensp;Results reset monthly
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
