import type {Request} from "../model/types.ts";

export default function RequestCard({request}: {request: Request}) {
    return (
        <div className="request-card">
            <div className="request-card__header">
                <h3>{request.title}</h3>
                <span className={`request-card__status request-card__status--${request.status}`}>
                    {request.status}
                </span>
            </div>

            <p className="request-card__desc">{request.description}</p>

            <div className="request-card__footer">
                Срок: {request.deadline}
            </div>
        </div>
    );
}