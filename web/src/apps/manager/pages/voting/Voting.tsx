// plugins
import {useCallback, useEffect, useMemo, useRef, useState, type JSX} from "react";
import {Download, Plus, FileText} from "lucide-react";
import {toast} from "sonner";

// api
import {pollsApi, type PollItem} from "@/api/polls.api.ts";

// types
import type {Poll} from "./model/types.ts";

// lib
import {adaptPolls} from "./model/adapters.ts";

// hooks
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

// ui
import TopBar from "@/widgets/topBar/ui/TopBar.tsx";
import VotingTabs, {type VotingTab} from "./ui/VotingTabs.tsx";
import PollCard from "./ui/PollCard.tsx";
import ArchiveList from "./ui/ArchiveList.tsx";
import PollDetail from "./ui/PollDetail.tsx";
import CreatePollModal from "./ui/CreatePollModal.tsx";
import {DataError, DataLoading} from "@/apps/manager/pages/home/ui/DataState.tsx";

// styles
import "./Voting.css";

/** Интервал автообновления списка опросов. */
const AUTO_REFRESH_MS = 30_000;

export default function Voting(): JSX.Element {
    useDocumentTitle('Голосования');

    const [createOpen, setCreateOpen] = useState(false);
    const [tab, setTab] = useState<VotingTab>("active");

    const [allPolls, setAllPolls] = useState<PollItem[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [selectedId, setSelectedId] = useState<string>("");
    const initialLoad = useRef(true);

    const fetchPolls = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const items = await pollsApi.getPolls();
            setAllPolls(items);
            // Если ничего не выбрано, выберем первый активный.
            const active = items.filter(p => p.status === "Active");
            setSelectedId(prev => (prev && active.some(p => p.id === prev)) ? prev : (active[0]?.id ?? ""));
        } catch (e) {
            if (!silent) {
                setError(e instanceof Error ? e : new Error(String(e)));
                setAllPolls(null);
            }
            // При silent-обновлении ошибки игнорируем — оставляем то что было.
        } finally {
            if (!silent) setLoading(false);
            initialLoad.current = false;
        }
    }, []);

    // Первичная загрузка + интервал автообновления.
    useEffect(() => {
        void fetchPolls();
        const t = window.setInterval(() => { void fetchPolls(true); }, AUTO_REFRESH_MS);
        return () => window.clearInterval(t);
    }, [fetchPolls]);

    // Разделяем на активные и архивные на основе ответа API.
    const activePolls: Poll[] = useMemo(() => {
        if (!allPolls) return [];
        return adaptPolls(allPolls.filter(p => p.status === "Active"));
    }, [allPolls]);

    const archivedPolls: Poll[] = useMemo(() => {
        if (!allPolls) return [];
        return adaptPolls(allPolls.filter(p => p.status === "Closed"));
    }, [allPolls]);

    const counts = useMemo(() => ({
        active: activePolls.length,
        drafts: 0, // отдельная сущность ещё не реализована
        archive: archivedPolls.length,
    }), [activePolls.length, archivedPolls.length]);

    const selectedPoll = useMemo(
        () => activePolls.find(p => p.id === selectedId) ?? null,
        [activePolls, selectedId],
    );

    const handleCreated = async (pollId: string) => {
        toast.success("Голосование создано и разослано жильцам", {
            description: `ID: ${pollId.slice(0, 8)}…`,
        });
        await fetchPolls();
    };

    const handleProtocols = () => {
        toast("Открываю архив протоколов", {
            description: `Доступно ${archivedPolls.length} завершённых голосований.`,
        });
        setTab("archive");
    };

    const subtitle = loading
        ? "загрузка…"
        : error
            ? "ошибка загрузки"
            : `${counts.active} активных · ${counts.drafts} черновик · ${counts.archive} в архиве`;

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
                            {loading && (
                                <div style={{marginTop: 16}}>
                                    <DataLoading label="Загружаем голосования…"/>
                                </div>
                            )}

                            {!loading && error && (
                                <div style={{marginTop: 16}}>
                                    <DataError
                                        title="Не удалось загрузить голосования"
                                        message="Бэкенд недоступен. Проверьте подключение и попробуйте снова."
                                        onRetry={() => fetchPolls()}
                                    />
                                </div>
                            )}

                            {!loading && !error && activePolls.length === 0 && (
                                <div className="vote-empty">
                                    <FileText size={36} strokeWidth={1.5}/>
                                    <div className="vote-empty__title">Активных голосований нет</div>
                                    <div className="vote-empty__sub">
                                        Создайте новое голосование — оно сразу появится у жильцов в приложении.
                                    </div>
                                    <button
                                        className="btn btn--primary"
                                        onClick={() => setCreateOpen(true)}
                                        style={{marginTop: 12}}
                                    >
                                        <Plus size={13}/> Создать голосование
                                    </button>
                                </div>
                            )}

                            {!loading && !error && activePolls.length > 0 && (
                                <div className="vote-cards">
                                    {activePolls.map(p => (
                                        <PollCard
                                            key={p.id}
                                            poll={p}
                                            selected={p.id === selectedId}
                                            onSelect={setSelectedId}
                                        />
                                    ))}
                                </div>
                            )}
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

                    {tab === "archive" && (
                        <>
                            {loading && (
                                <div style={{marginTop: 16}}>
                                    <DataLoading label="Загружаем архив…"/>
                                </div>
                            )}
                            {!loading && error && (
                                <div style={{marginTop: 16}}>
                                    <DataError
                                        title="Не удалось загрузить архив"
                                        onRetry={() => fetchPolls()}
                                    />
                                </div>
                            )}
                            {!loading && !error && archivedPolls.length === 0 && (
                                <div className="vote-empty">
                                    <FileText size={36} strokeWidth={1.5}/>
                                    <div className="vote-empty__title">Архив пуст</div>
                                    <div className="vote-empty__sub">
                                        Завершённые голосования будут появляться здесь.
                                    </div>
                                </div>
                            )}
                            {!loading && !error && archivedPolls.length > 0 && (
                                <ArchiveList polls={archivedPolls}/>
                            )}
                        </>
                    )}
                </div>

                <PollDetail
                    poll={tab === "active" ? selectedPoll : null}
                    onChanged={() => { void fetchPolls(); }}
                />
            </div>

            <CreatePollModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={handleCreated}
            />
        </>
    );
}
