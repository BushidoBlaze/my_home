import {Outlet} from "react-router";
import ManagerSidebar from "@/widgets/sidebar/ui/ManagerSidebar.tsx";
import "@/shared/assets/styles/admin.css";
import "./ManagerLayout.css";

export default function ManagerLayout() {
    return (
        <div className="manager-layout admin-app">
            <ManagerSidebar/>

            <main className="manager-content">
                <Outlet/>
            </main>
        </div>
    );
}
