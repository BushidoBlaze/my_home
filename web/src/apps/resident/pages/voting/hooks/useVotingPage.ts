import {useEffect, useState} from "react";
import {pollsApi, type PollItem} from "@/api/polls.api.ts";

interface UseVotingPageReturn {
    polls:          PollItem[];
    loading:        boolean;
    error:          string | null;
    active:         PollItem[];
    closed:         PollItem[];
    notVotedCount:  number;
    myVotedCount:   number;
    avgQuorum:      number;
    closedThisYear: number;
    handleVote:     (pollId: string, optionId: string) => Promise<void>;
    reload:         () => void;
}

export function useVotingPage(): UseVotingPageReturn {
    const [polls,   setPolls]   = useState<PollItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const data = await pollsApi.getPolls();
            setPolls(data);
            setError(null);
        } catch {
            setError("Не удалось загрузить голосования");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void load(); }, []);

    const handleVote = async (pollId: string, optionId: string) => {
        await pollsApi.vote(pollId, optionId);
        await load();
    };

    const active = polls.filter(p => p.status === "Active");
    const closed = polls.filter(p => p.status === "Closed");

    const notVotedCount = active.filter(p => !p.hasVoted).length;
    const myVotedCount  = active.filter(p => p.hasVoted).length;

    const avgQuorum = active.length === 0 ? 0 : Math.round(
        active.reduce((sum, p) => {
            const q = p.totalEligible > 0 ? (p.totalVoters / p.totalEligible) * 100 : 0;
            return sum + q;
        }, 0) / active.length
    );

    const yearStart      = new Date(new Date().getFullYear(), 0, 1).getTime();
    const closedThisYear = closed.filter(p => new Date(p.endsAt).getTime() >= yearStart).length;

    return {polls, loading, error, active, closed, notVotedCount, myVotedCount, avgQuorum, closedThisYear, handleVote, reload: load};
}
