// plugins
import {BrowserRouter, Routes, Route} from "react-router";

// routs
import MainLayout from "./layouts/MainLayout.tsx";

// pages
import Home from "./pages/Home.tsx";

// styles
import "./assets/styles/reset.css";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout/>}>
                    <Route path="/" element={<Home/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}