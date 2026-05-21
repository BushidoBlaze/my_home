import {useMemo, useState, type JSX} from "react";
import {Download, Plus, FileText} from "lucide-react";
import {toast} from "sonner";
import TopBar from "@/widgets/topBar/ui/TopBar.tsx";
import VotingTabs, {type VotingTab} from "./ui/VotingTabs.tsx";
import PollCard from "./ui/PollCard.tsx";
import ArchiveList from "./ui/ArchiveList.tsx";
import PollDetail from "./ui/PollDetail.tsx";
import CreatePollModal from "./ui/CreatePollModal.tsx";
import {POLLS, ARCHIVED_POLLS} from "./model/data.ts";
import type {Poll} from "./model/types.ts";
import "./Voting.css";

export default function Voting(): JSX.Element {
    const [createOpen, setCreateOpen] = useState(false);
    const [tab, setTab] = useState<VotingTab>("active");
    const [polls, setPolls] = useState<Poll[]>(POLLS);
    const [selectedId, setSelectedId] = useState<string>(POLLS[0]?.id ?? "");

    const counts = useMemo(() => ({
        active: polls.length,
        drafts: 1,                       // пока хардкод; черновики добавим как отдельную таблицу
        archive: ARCHIVED_POLLS.length,
    }), [polls.length]);

    const selectedPoll = useMemo(
        () => polls.find(p => p.id === selectedId) ?? null,
        [polls, selectedId],
    );

    const handleCreated = (pollId: string) => {
        toast.success("Голосование создано и разослано жильцам", {
            description: `ID: ${pollId.slice(0, 8)}…`,
        });
        // TODO: когда подключим API на список — здесь fetch обновлённого списка.
    };

    const handleProtocols = () => {
        toast("Открываю архив протоколов", {
            description: `Доступно ${ARCHIVED_POLLS.length} завершённых голосований.`,
        });
        setTab("archive");
    };

    const subtitle = `${counts.active} активных · ${counts.drafts} черновик · ${counts.archive} в архиве`;

    return (
        <>
            <TopBar
                title="Голосования"
                subtitle={subtitle}
                action={
                    <>
                        <button className="btn" onClick={handleProtocols}>
                            <Download size={13}/>Протоколы
                        </button>
                        <button className="btn btn--primary" onClick={() => setCreateOpen(true)}>
                            <Plus size={13}/>Создать голосование
                        </button>
                    </>
                }
            />

            <div className="vote-layout">
                <div className="vote-list">
                    <VotingTabs active={tab} onChange={setTab} counts={counts}/>

                    {tab === "active" && (
                        <>
                            <div className="vote-cards">
                                {polls.map(p => (
                                    <PollCard
                                        key={p.id}
                                        poll={p}
                                        selected={p.id === selectedId}
                                        onSelect={setSelectedId}
                                    />
                                ))}
                            </div>
                            <ArchiveList/>
                        </>
                    )}

                    {tab === "drafts" && (
                        <div className="vote-empty">
                            <FileText size={36} strokeWidth={1.5}/>
                            <div className="vote-empty__title">Черновиков пока нет</div>
                            <div className="vote-empty__sub">
                                Сохранённые, но не запущенные голосования будут здесь.
                            </div>
                            <button
                                className="btn btn--primary"
                                onClick={() => setCreateOpen(true)}
                                style={{marginTop: 12}}
                            >
                                <Plus size={13}/> Создать первое голосование
                            </button>
                        </div>
                    )}

                    {tab === "archive" && <ArchiveList full/>}
                </div>

                <PollDetail poll={tab === "active" ? selectedPoll : null}/>
            </div>

            <CreatePollModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={handleCreated}
            />
        </>
    );
}
