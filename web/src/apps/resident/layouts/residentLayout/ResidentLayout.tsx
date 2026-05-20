import {Outlet} from "react-router";
import ResidentSidebar from "@/widgets/sidebar/ui/ResidentSidebar.tsx";
import "./ResidentLayout.css";

export default function ResidentLayout() {
    return (
        <div className="resident-layout">
            <ResidentSidebar/>

            <main className="resident-content">
                <Outlet/>
            </main>
        </div>
    );
}