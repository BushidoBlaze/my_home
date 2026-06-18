// plugins
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {Toaster} from "sonner";

// hooks
import {useScrollReveal} from "@/shared/hooks/useScrollReveal.ts";

// ui
import BackToTopButton from "@/widgets/backToTop/BackToTopButton.tsx";

// layouts
import MarketingLayout from "@/layouts/MarketingLayout.tsx";
import ResidentLayout from "@/apps/resident/layouts/residentLayout/ResidentLayout.tsx";
import ManagerLayout from "@/apps/manager/layouts/ManagerLayout.tsx";

// marketing pages
import Home from "@/pages/home/Home.tsx";
import Possibilities from "@/pages/possibilities/Possibilities.tsx";
import TariffsPage from "@/pages/tariffs/TariffsPage.tsx";
import ManagementPage from "@/pages/management/ManagementPage.tsx";
import ResidentsPage from "@/pages/residents/ResidentsPage.tsx";
import BlogPage from "@/pages/blog/BlogPage.tsx";

// auth
import Login from "@/pages/auth/login/Login.tsx";
import Register from "@/pages/auth/register/Register.tsx";
import InviteJoin from "@/apps/resident/pages/invite/InviteJoin.tsx";

// resident cabinet
import ResidentHome from "@/apps/resident/pages/residentHome/ResidentHome.tsx";
import Requests from "@/apps/resident/pages/requests/Requests.tsx";
import Account from "@/apps/resident/pages/account/Account.tsx";
import Chats from "@/apps/resident/pages/chats/Chats.tsx";
import News from "@/apps/resident/pages/news/News.tsx";
import Marketplace from "@/apps/resident/pages/marketplace/Marketplace.tsx";
import {SettingsPage} from "@/apps/resident/pages/settings/SettingsPage.tsx";
import Help from "@/apps/resident/pages/Help.tsx";
import Expenses from "@/apps/resident/pages/Expenses.tsx";
import VotingPage from "@/apps/resident/pages/voting/VotingPage.tsx";

// manager cabinet
import ManagerHome from "@/apps/manager/pages/home/Home.tsx";
import ManagerTickets from "@/apps/manager/pages/tickets/Tickets.tsx";
import ManagerTicketDetail from "@/apps/manager/pages/ticketDetail/TicketDetail.tsx";
import ManagerBuildings from "@/apps/manager/pages/buildings/Buildings.tsx";
import ManagerBilling from "@/apps/manager/pages/billing/Billing.tsx";
import ManagerMeters from "@/apps/manager/pages/meters/Meters.tsx";
import ManagerVoting from "@/apps/manager/pages/voting/Voting.tsx";
// Менеджер использует тот же полноценный чат, что и жилец — это просто
// другой пользователь с теми же чатами/сообщениями. Дубль страницы убран.
import ManagerChat from "@/apps/resident/pages/chats/Chats.tsx";
import ManagerAccount from "@/apps/manager/pages/account/Account.tsx";
import ManagerNews from "@/apps/manager/pages/news/News.tsx";

// 404
import NotFound from "@/pages/notFound/NotFound.tsx";

// styles
import "@/shared/assets/styles/reset.css";
import "@/shared/assets/styles/global.css";
import "@/shared/assets/styles/fonts.css";

const basename = import.meta.env.PROD ? '/my_home' : '/';

// Защищённый роут для жителя
// Если нет токена — редиректит на /login
function PrivateRoute({children}: { children: React.ReactNode }) {
    const token = localStorage.getItem("token");
    return token ? <>{children}</> : <Navigate to="/login" replace/>;
}

// Защищённый роут для менеджера УК
// Если нет токена или роль не Manager — редиректит на /login
function ManagerRoute({children}: { children: React.ReactNode }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    return token && role === "Manager" ? <>{children}</> : <Navigate to="/login" replace/>;
}

function AppRoutes() {
    useScrollReveal();

    return (
        <>
            {/*Кнопка скролла наверх*/}
            <BackToTopButton/>

            <Routes>
                {/* Маркетинговые страницы */}
                <Route element={<MarketingLayout/>}>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/possibilities" element={<Possibilities/>}/>
                    <Route path="/tariffs" element={<TariffsPage/>}/>
                    <Route path="/management" element={<ManagementPage/>}/>
                    <Route path="/residents" element={<ResidentsPage/>}/>
                    <Route path="/blog" element={<BlogPage/>}/>
                </Route>

                {/* Авторизация */}
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/invite/:code" element={
                    <PrivateRoute>
                        <InviteJoin/>
                    </PrivateRoute>
                }/>

                {/* Кабинет жителя */}
                <Route path="/resident" element={
                    <PrivateRoute>
                        <ResidentLayout/>
                    </PrivateRoute>
                }>
                    <Route path="home" element={<ResidentHome/>}/>
                    <Route path="requests" element={<Requests/>}/>
                    <Route path="expenses" element={<Expenses/>}/>
                    <Route path="account" element={<Account/>}/>
                    <Route path="chats" element={<Chats/>}/>
                    <Route path="news" element={<News/>}/>
                    <Route path="marketplace" element={<Marketplace/>}/>
                    <Route path="voting" element={<VotingPage/>}/>
                    <Route path="settings" element={<SettingsPage/>}/>
                    <Route path="help" element={<Help/>}/>
                </Route>

                {/* Кабинет УК */}
                <Route path="/manager" element={
                    <ManagerRoute>
                        <ManagerLayout/>
                    </ManagerRoute>
                }>
                    <Route index element={<Navigate to="home" replace/>}/>
                    <Route path="home" element={<ManagerHome/>}/>
                    <Route path="tickets" element={<ManagerTickets/>}/>
                    <Route path="tickets/:id" element={<ManagerTicketDetail/>}/>
                    <Route path="buildings" element={<ManagerBuildings/>}/>
                    <Route path="billing" element={<ManagerBilling/>}/>
                    <Route path="meter" element={<ManagerMeters/>}/>
                    <Route path="vote" element={<ManagerVoting/>}/>
                    <Route path="chat" element={<ManagerChat/>}/>
                    <Route path="account" element={<ManagerAccount/>}/>
                    <Route path="news" element={<ManagerNews/>}/>
                    <Route path="*" element={<Navigate to="home" replace/>}/>
                </Route>

                {/* Ещё не реализованы — полноэкранный 404 вне layout-а УК */}
                <Route path="/manager/users" element={<NotFound/>}/>
                <Route path="/manager/report" element={<NotFound/>}/>

                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter basename={basename}>
            <AppRoutes/>
            <Toaster richColors position="top-right"/>
        </BrowserRouter>
    );
}
