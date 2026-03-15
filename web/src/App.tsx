// plugins
import {BrowserRouter, Routes, Route} from "react-router";

// hooks
import {useScrollReveal} from "./shared/hooks/useScrollReveal.ts";

// ui
import BackToTopButton from "./widgets/backToTop/BackToTopButton.tsx";

// routs
import MainLayout from "./layouts/MainLayout.tsx";

// pages
import Home from "./pages/Home.tsx"; // домашняя
import Possibilities from "./pages/Possibilities.tsx"; // возможности
import NotFound from "./pages/notFound/NotFound.tsx"; // 404

// styles
import "./shared/assets/styles/reset.css";
import "./shared/assets/styles/global.css";
import "./shared/assets/styles/fonts.css";

// Определяем basename в зависимости от окружения
const basename = import.meta.env.PROD ? '/my_home' : '/';

function AppRoutes() {
    useScrollReveal();

    return (
        <>
            {/*Кнопка скролла наверх*/}
            <BackToTopButton/>

            <Routes>
                <Route element={<MainLayout/>}>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/possibilities" element={<Possibilities/>}/>
                </Route>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </>

    );
}

export default function App() {
    return (
        <BrowserRouter basename={basename}>
            <AppRoutes/>
        </BrowserRouter>
    );
}