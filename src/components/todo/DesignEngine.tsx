"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, Bot, User, CheckCircle } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  typing?: boolean;
  delay: number;
}

const conversation: ChatMessage[] = [
  { role: "user", content: "Monitor my GitHub PRs and post Slack summaries every morning at 9am.", delay: 0 },
  { role: "system", content: "Parsing intent... 2 tools detected, 1 trigger needed", delay: 800 },
  { role: "assistant", content: "I'll create a **PR Review Digest** agent. Here's what I'm setting up:", delay: 1200 },
  { role: "assistant", content: "**Identity:** PR Review Digest Agent\n**Tools:** `github_list_prs`, `slack_post_message`\n**Trigger:** Schedule — `0 9 * * MON-FRI`\n**Prompt:** 6-section structured (identity, instructions, toolGuidance, examples, errorHandling, custom)", delay: 800 },
  { role: "assistant", content: "A few questions before I finalize:", delay: 600 },
  { role: "assistant", content: "1. Which GitHub repos should I monitor? (all, or specific ones?)\n2. Which Slack channel for the digest?\n3. Should I include draft PRs or only open ones?", delay: 400 },
  { role: "user", content: "All repos in our org, post to #engineering, skip drafts.", delay: 2000 },
  { role: "assistant", content: "Got it. Generating final configuration...", delay: 800 },
  { role: "system", content: "Quality score: 94/100 — structural: 96, semantic: 92", delay: 1200 },
  { role: "system", content: "Connectors: GitHub ✓  Slack ✓ — Ready to deploy", delay: 600 },
  { role: "assistant", content: "Your PR Review Digest agent is ready. Want me to deploy it, or would you like to edit the prompt first?", delay: 800 },
];

export default function DesignEngine() {
  const prefersReducedMotion = useReducedMotion();
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const chatRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasRun = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const scrollChat = useCallback(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, []);

  const runConversation = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setVisibleMessages([]);
    setPhase("running");

    let cumulative = 600;
    conversation.forEach((msg, i) => {
      cumulative += msg.delay;
      // Show typing indicator first for assistant messages
      if (msg.role === "assistant") {
        const typingT = setTimeout(() => {
          setVisibleMessages(prev => [...prev, { ...msg, typing: true, content: "" }]);
          requestAnimationFrame(scrollChat);
        }, cumulative);
        timeoutsRef.current.push(typingT);
        cumulative += 600 + Math.random() * 400; // Simulate typing time
      }
      const t = setTimeout(() => {
        setVisibleMessages(prev => {
          // Replace typing indicator with actual message
          if (msg.role === "assistant") {
            const filtered = prev.filter(m => !(m.typing && m.role === msg.role));
            return [...filtered, msg];
          }
          return [...prev, msg];
        });
        requestAnimationFrame(scrollChat);
        if (i === conversation.length - 1) setPhase("done");
      }, cumulative);
      timeoutsRef.current.push(t);
    });
  }, [scrollChat]);

  useEffect(() => {
    if (prefersReducedMotion || hasRun.current) return;
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun.current) {
        hasRun.current = true;
        runConversation();
        obs.disconnect();
      }
    }, { rootMargin: "-80px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [runConversation, prefersReducedMotion]);

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  return (
    <SectionWrapper id="design">
      <div ref={sectionRef} />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center">
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Design agents through{" "}
            <GradientText className="drop-shadow-lg">conversation</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-muted-dark font-light">
          No forms. No config files. Just tell Claude what you need — it asks the right questions,
          generates the full agent config, and <span className="text-foreground/80 font-medium">deploys in one click.</span>
        </motion.p>
      </motion.div>

      {/* Chat interface */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 mx-auto max-w-2xl"
      >
        <div className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)]">
          {/* Chat header */}
          <div className="flex items-center justify-between border-b border-white/4 px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple/15">
                <Sparkles className="h-4 w-4 text-brand-purple" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground/80">Design Engine</div>
                <div className="text-sm text-muted-dark font-mono">Powered by Claude</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${phase === "running" ? "bg-brand-amber animate-pulse" : phase === "done" ? "bg-brand-emerald" : "bg-white/20"}`} />
              <span className="text-sm font-mono text-muted-dark">
                {phase === "running" ? "designing..." : phase === "done" ? "complete" : "ready"}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div ref={chatRef} className="h-[420px] overflow-y-auto px-5 py-4 space-y-4 scrollbar-hide">
            {phase === "idle" && (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-dark font-mono text-center">Scroll to start design conversation...</p>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {visibleMessages.map((msg, i) => {
                if (msg.typing) {
                  return (
                    <motion.div
                      key={`typing-${i}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-3"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-purple/15 mt-0.5">
                        <Bot className="h-3.5 w-3.5 text-brand-purple/70" />
                      </div>
                      <div className="rounded-xl rounded-tl-sm border border-white/6 bg-white/3 px-4 py-2.5">
                        <motion.div className="flex gap-1" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>
                          <div className="h-1.5 w-1.5 rounded-full bg-brand-purple/50" />
                          <div className="h-1.5 w-1.5 rounded-full bg-brand-purple/40" style={{ animationDelay: "0.2s" }} />
                          <div className="h-1.5 w-1.5 rounded-full bg-brand-purple/30" style={{ animationDelay: "0.4s" }} />
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                }

                if (msg.role === "system") {
                  return (
                    <motion.div
                      key={`sys-${i}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-center"
                    >
                      <div className="flex items-center gap-2 rounded-full border border-brand-emerald/15 bg-brand-emerald/5 px-4 py-1.5">
                        <CheckCircle className="h-3 w-3 text-brand-emerald/60" />
                        <span className="text-sm font-mono text-brand-emerald/70">{msg.content}</span>
                      </div>
                    </motion.div>
                  );
                }

                const isUser = msg.role === "user";
                return (
                  <motion.div
                    key={`msg-${i}`}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                      isUser ? "bg-brand-cyan/15" : "bg-brand-purple/15"
                    }`}>
                      {isUser
                        ? <User className="h-3.5 w-3.5 text-brand-cyan/70" />
                        : <Bot className="h-3.5 w-3.5 text-brand-purple/70" />
                      }
                    </div>
                    <div className={`max-w-[80%] rounded-xl border px-4 py-2.5 ${
                      isUser
                        ? "rounded-tr-sm border-brand-cyan/15 bg-brand-cyan/6 text-foreground/80"
                        : "rounded-tl-sm border-white/6 bg-white/3 text-muted"
                    }`}>
                      {msg.content.split("\n").map((line, j) => (
                        <p key={j} className="text-sm leading-relaxed">
                          {line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, k) => {
                            if (part.startsWith("**") && part.endsWith("**"))
                              return <strong key={k} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
                            if (part.startsWith("`") && part.endsWith("`"))
                              return <code key={k} className="text-brand-cyan/80 text-sm font-mono bg-brand-cyan/5 px-1 py-0.5 rounded">{part.slice(1, -1)}</code>;
                            return <span key={k}>{part}</span>;
                          })}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Input bar */}
          <div className="border-t border-white/4 px-5 py-3 flex items-center gap-3">
            <div className="flex-1 rounded-lg border border-white/6 bg-white/2 px-4 py-2.5 text-sm text-muted-dark font-mono">
              Describe what your agent should do...
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-purple/20 bg-brand-purple/10">
              <Sparkles className="h-4 w-4 text-brand-purple/60" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/4 px-5 py-2 text-sm font-mono text-muted-dark uppercase tracking-wider">
            <span>6-step design pipeline</span>
            {phase === "done" && (
              <button
                onClick={() => { hasRun.current = false; runConversation(); }}
                className="text-brand-cyan/40 hover:text-brand-cyan/70 transition-colors normal-case"
              >
                replay conversation
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
