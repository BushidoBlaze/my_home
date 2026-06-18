import {chatsApi} from "@/api/chats.api.ts";
import {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";

export default function InviteJoin() {
    const {code} = useParams<{ code: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "error">("loading");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!code) {
            setStatus("error");
            setError("Некорректная ссылка-приглашение.");
            return;
        }

        let active = true;

        chatsApi.joinChatByInviteCode(code)
            .then(() => {
                if (!active) return;
                navigate("/resident/chats", {replace: true});
            })
            .catch((e) => {
                if (!active) return;
                setStatus("error");
                setError(e instanceof Error ? e.message : "Не удалось присоединиться к чату.");
            });

        return () => {
            active = false;
        };
    }, [code, navigate]);

    return (
        <div style={{padding: "40px", fontFamily: "Inter, sans-serif"}}>
            {status === "loading" ? (
                <p>Подключаем к чату по приглашению...</p>
            ) : (
                <>
                    <h1 style={{marginBottom: "10px"}}>Не удалось присоединиться</h1>
                    <p style={{marginBottom: "16px"}}>{error}</p>
                    <Link to="/resident/chats">Вернуться в чаты</Link>
                </>
            )}
        </div>
    );
}
