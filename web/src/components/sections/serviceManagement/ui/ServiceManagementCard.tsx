import {SERVICE_MANAGEMENT_DETAILS} from "../model/data.ts";
import type {ServiceManagementContentProps} from "../model/types.ts";
import {useServiceDetails} from "../hooks/useServiceDetails.ts";
import CardHeader from "./CardHeader.tsx";
import DetailsList from "./DetailsList.tsx";
import DetailPanel from "./DetailPanel.tsx";
import "./ServiceManagement.css";

export function ServiceManagementCard(props: ServiceManagementContentProps) {
    const details = SERVICE_MANAGEMENT_DETAILS[props.id];
    const {isOpen, currentItem, open, close, next, prev} = useServiceDetails(details);

    return (
        <div className="service-management-card">
            <CardHeader {...props} />

            {details && (
                <DetailsList
                    details={details}
                    isOpen={isOpen}
                    onOpen={open}
                />
            )}

            {details && (
                <DetailPanel
                    isOpen={isOpen}
                    item={currentItem}
                    onClose={close}
                    onNext={next}
                    onPrev={prev}
                />
            )}
        </div>
    );
}