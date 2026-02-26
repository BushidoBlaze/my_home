import type {AppealContentProps} from "../../model/types.ts";
import {useTypewriterAppeal} from "../../hooks/useTypewriterAppeal.ts";
import "./AppealSection.css";

type DecorativeAppealCardProps = {
    content: AppealContentProps;
    onComplete: () => void;
}

export default function DecorativeAppealCard({content, onComplete}: DecorativeAppealCardProps) {
    const {typedQuestion, typedAnswer, typedThanks} =
        useTypewriterAppeal(
            content.question,
            content.answer,
            content.thanks,
            {onComplete}
        );

    return (
        <div className="decorative-appeal-card">

            {/* Вопрос */}
            {typedQuestion && (
                <div className="decorative-appeal-card__bubble decorative-appeal-card__bubble--user">
                    <span className="decorative-appeal-card__user">
                        {content.name}
                    </span>
                    <p className="decorative-appeal-card__question">
                        {typedQuestion}
                    </p>
                </div>
            )}

            {/* Ответ */}
            {typedAnswer && (
                <div className="decorative-appeal-card__bubble decorative-appeal-card__bubble--support">
                    <span className="decorative-appeal-card__support">
                        Тех. поддержка — "Мой Дом"
                    </span>
                    <p className="decorative-appeal-card__answer">
                        {typedAnswer}
                    </p>
                </div>
            )}

            {/* Слова благодарности */}
            {typedThanks && (
                <div
                    className="decorative-appeal-card__bubble decorative-appeal-card__bubble--user decorative-appeal-card__bubble--thanks">
                    <span className="decorative-appeal-card__user">
                        {content.name}
                    </span>
                    <p className="decorative-appeal-card__question">
                        {typedThanks}
                    </p>
                </div>
            )}
        </div>
    );
}