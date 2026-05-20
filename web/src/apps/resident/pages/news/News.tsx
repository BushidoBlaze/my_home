// hooks
import {useNews} from "./hooks/useNews.ts";

// ui
import {NewsList} from "./ui/NewsList.tsx";
import {NewsDetail} from "./ui/NewsDetail.tsx";

// styles
import "./News.css";

// Страница новостей — лента объявлений УК
// Слева список, справа детальный просмотр
export default function News() {
    const {
        list,
        selected,
        comments,
        listLoading,
        detailLoading,
        error,
        selectNews,
    } = useNews();

    const pinnedCount = list.filter(n => n.isPinned).length;

    return (
        <div className="news">
            {/* Список новостей */}
            <aside className="news__sidebar">
                <div className="news__sidebar-header">
                    <div className="news__sidebar-header-top">
                        <h2 className="news__sidebar-title">Новости</h2>
                        {!listLoading && list.length > 0 && (
                            <span className="news__sidebar-count">{list.length}</span>
                        )}
                    </div>
                    <p className="news__sidebar-subtitle">Объявления управляющей компании</p>
                    {pinnedCount > 0 && (
                        <span className="news__sidebar-pinned">📌 {pinnedCount} важных</span>
                    )}
                </div>
                <NewsList
                    list={list}
                    selected={selected}
                    loading={listLoading}
                    error={error}
                    onSelect={selectNews}
                />
            </aside>

            {/* Детальный просмотр */}
            <main className="news__main">
                <NewsDetail
                    selected={selected}
                    comments={comments}
                    loading={detailLoading}
                />
            </main>
        </div>
    );
}