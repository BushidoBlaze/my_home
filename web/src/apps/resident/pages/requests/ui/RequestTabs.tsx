import type {RequestStatus} from "../model/types.ts";

type Props = {
    active: RequestStatus;
    onChange: (status: RequestStatus) => void;
};

const tabs: {label: string; value: RequestStatus}[] = [
    {label: "Активные", value: "active"},
    {label: "Выполненные", value: "done"},
    {label: "Отклонённые", value: "rejected"},
    {label: "Черновики", value: "draft"},
];

export default function RequestTabs({active, onChange}: Props) {
    return (
        <div className="requests__tabs">
            {tabs.map(tab => (
                <button
                    key={tab.value}
                    className={
                        active === tab.value
                            ? "requests__tab requests__tab--active"
                            : "requests__tab"
                    }
                    onClick={() => onChange(tab.value)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}