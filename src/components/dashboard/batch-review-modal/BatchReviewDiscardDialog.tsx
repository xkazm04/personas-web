import { motion } from "framer-motion";

export function BatchReviewDiscardDialog({
  title,
  body,
  keepLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  keepLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.14 }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="batch-review-discard-title"
        className="w-full max-w-sm rounded-2xl border border-glass bg-[#0a0f1a]/98 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="batch-review-discard-title"
          className="text-base font-semibold text-foreground"
        >
          {title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-dark">{body}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            {keepLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/25"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
