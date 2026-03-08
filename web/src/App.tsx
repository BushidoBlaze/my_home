// plugins
import {BrowserRouter, Routes, Route} from "react-router";

// hooks
import {useScrollReveal} from "@/shared/hooks/useScrollReveal.ts";

// routs
import MainLayout from "./layouts/MainLayout.tsx";

// pages
import Home from "./pages/Home.tsx";
import NotFound from "./pages/notFound/NotFound.tsx"; // 404

// styles
import "./shared/assets/styles/reset.css";
import "./shared/assets/styles/global.css";
import "./shared/assets/styles/fonts.css";

// Определяем basename в зависимости от окружения
const basename = import.meta.env.PROD ? '/my_home' : '/';

export default function App() {
    useScrollReveal();

    return (
        <BrowserRouter basename={basename}>
            <Routes>
                <Route element={<MainLayout/>}>
                    <Route path="/" element={<Home/>}/>
                </Route>

                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </BrowserRouter>
    )
}