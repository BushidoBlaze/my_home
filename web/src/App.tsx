// plugins
import {BrowserRouter, Routes, Route} from "react-router";

// routs
import MainLayout from "./layouts/MainLayout.tsx";

// pages
import Home from "./pages/Home.tsx";

// styles
import "./shared/assets/styles/reset.css";
import "./shared/assets/styles/global.css";
import "./shared/assets/styles/fonts.css";

// Определяем basename в зависимости от окружения
const basename = import.meta.env.PROD ? '/my_home' : '/';

export default function App() {
    return (
        <BrowserRouter basename={basename}>
            <Routes>
                <Route element={<MainLayout/>}>
                    <Route path="/" element={<Home/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}