import {Outlet} from "react-router";
import Header from "@/widgets/header/ui/Header.tsx";
import Footer from "@/widgets/footer/ui/Footer.tsx";

export default function MainLayout() {
    return (
        <>
            <Header/>
            <main>
                <Outlet/>
            </main>
            <Footer/>
        </>
    )
}