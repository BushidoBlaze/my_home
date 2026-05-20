export default function CompletedRequests() {
    return (
        <div className="card">
            <h3 className="card__title">Последние выполненные</h3>

            <div className="card__list">
                <div className="card__item">Замена лампочки</div>
                <div className="card__item">Починка двери</div>
            </div>
        </div>
    );
}