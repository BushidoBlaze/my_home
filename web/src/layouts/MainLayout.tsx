import {Outlet} from "react-router";
import Header from "@/widgets/header/ui/Header.tsx";

export default function MainLayout() {
    return (
        <>
            <Header/>
            <main>
                <Outlet/>
            </main>
            {/*</Footer>*/}
        </>
    )
}