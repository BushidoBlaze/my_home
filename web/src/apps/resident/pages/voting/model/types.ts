// Tone shown on the gradient cover and progress bar.
export type PollTone = "emerald" | "warning" | "danger";

// Vote choice in a "За / Против / Воздержаться" poll.
export type VoteChoice = "for" | "against" | "abstain";

// Gradient colors for the poll cover.
export interface PollGradient {
    from: string;
    to:   string;
}

export const GRADIENTS: Record<PollTone, PollGradient> = {
    emerald: {from: "#10b981", to: "#064e3b"},
    warning: {from: "#f59e0b", to: "#b45309"},
    danger:  {from: "#dc2626", to: "#7f1d1d"},
};
