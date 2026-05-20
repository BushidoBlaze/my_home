import type {JSX} from "react";
import DetailHeader from "./ui/DetailHeader.tsx";
import SlaBanner from "./ui/SlaBanner.tsx";
import Description from "./ui/Description.tsx";
import Timeline from "./ui/Timeline.tsx";
import ReplyComposer from "./ui/ReplyComposer.tsx";
import SidePanel from "./ui/SidePanel.tsx";
import "./TicketDetail.css";

export default function TicketDetail(): JSX.Element {
    return (
        <>
            <DetailHeader/>

            <div className="td-grid">
                <div className="td-main">
                    <SlaBanner/>
                    <Description/>
                    <Timeline/>
                    <ReplyComposer/>
                </div>
                <SidePanel/>
            </div>
        </>
    );
}
