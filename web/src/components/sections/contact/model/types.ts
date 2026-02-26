export interface ContactCardProps {
    type: string;
    placeholder: string;
    required: boolean; //обязательное / необязательное поле
    className?: string;
    pattern?: string; // формат ввода
}

export interface AppealContentProps {
    name: string;
    question: string;
    answer: string;
    thanks: string; // финальное сообщение пользователя
}