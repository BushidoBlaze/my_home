import type {JSX} from "react";
import {Paperclip, Sparkles, Send} from "lucide-react";

export default function ReplyComposer(): JSX.Element {
    return (
        <section className="td-reply">
            <div className="td-reply__tabs">
                <button className="btn btn--sm td-reply__tab--active">Внутренний комментарий</button>
                <button className="btn btn--sm btn--ghost">Ответ жильцу</button>
                <button className="btn btn--sm btn--ghost">Изменение статуса</button>
            </div>
            <textarea
                className="td-reply__textarea"
                placeholder="Бригада выехала. ETA 25 минут, перекрываем стояк по подъезду 4."
            />
            <div className="td-reply__foot">
                <div className="td-reply__tools">
                    <button className="btn btn--icon btn--sm btn--ghost">
                        <Paperclip size={14}/>
                    </button>
                    <button className="btn btn--icon btn--sm btn--ghost">
                        <Sparkles size={14}/>
                    </button>
                    <span className="td-reply__hint">Markdown поддерживается</span>
                </div>
                <button className="btn btn--primary btn--sm">
                    <Send size={13}/>Отправить
                </button>
            </div>
        </section>
    );
}
