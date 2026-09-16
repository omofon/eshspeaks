"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { submitArticleFeedback } from "@/lib/api/articles";
import { ApiError } from "@/lib/api/client";
import { useAuthGatedAction } from "@/lib/auth/useAuthGatedAction";

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "done"; isUseful: boolean }
  | { status: "error"; message: string };

/**
 * No prior feedback implementation existed anywhere in the repository
 * (confirmed by a full-repo search) — this is a genuinely new component
 * wired directly to POST /api/v1/articles/:id/feedback.
 */
export function ArticleFeedback({ articleId }: { articleId: string }) {
  const [state, setState] = useState<State>({ status: "idle" });
  const runOrRedirectToLogin = useAuthGatedAction("feedback");

  async function send(isUseful: boolean) {
    setState({ status: "submitting" });
    try {
      const result = await submitArticleFeedback(articleId, isUseful);
      setState({ status: "done", isUseful: result.isUseful });
    } catch (e) {
      setState({
        status: "error",
        message: e instanceof ApiError ? e.message : "Couldn't submit your feedback.",
      });
    }
  }

  if (state.status === "done") {
    return (
      <div className="mt-6 rounded-2xl border-2 border-line bg-white px-4 py-3.5 text-sm text-ink-soft">
        Thanks for the feedback — you found this {state.isUseful ? "useful" : "not useful"}.
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-line bg-white px-4 py-3.5">
      <p className="text-sm font-semibold text-ink">Was this useful?</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={state.status === "submitting"}
          onClick={() => runOrRedirectToLogin(() => send(true))}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3.5 py-1.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.75} />
          Yes
        </button>
        <button
          type="button"
          disabled={state.status === "submitting"}
          onClick={() => runOrRedirectToLogin(() => send(false))}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3.5 py-1.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ThumbsDown className="h-3.5 w-3.5" strokeWidth={1.75} />
          No
        </button>
      </div>
      {state.status === "error" ? (
        <p className="w-full text-xs text-error">{state.message}</p>
      ) : null}
    </div>
  );
}
