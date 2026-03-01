import {useState} from "react";
import {Link} from 'react-router-dom';
import {CirclePlus, CircleMinus, SquareArrowOutUpRight} from "lucide-react";
import {FAQ_LIST_CONTENT} from "../model/data.ts";
import "./FAQSection.css";

export default function FAQList() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="FAQ-list-container">
            <ul className="FAQ-list">
                {FAQ_LIST_CONTENT.map((item, index) => (
                    <li className="FAQ-list__item"
                        key={index}
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    >
                        <div className="FAQ-list-item__header">
                            <h1 className="FAQ-list-item__title">
                                {item.title}
                            </h1>

                            {openIndex === index ?
                                <CircleMinus
                                    className="FAQ-list-item__icon FAQ-list-item__icon--active"
                                    size={28}
                                    strokeWidth={1.25}
                                />
                                :
                                <CirclePlus
                                    className="FAQ-list-item__icon"
                                    size={28}
                                    strokeWidth={1.25}
                                />
                            }
                        </div>

                        <div className={`FAQ-list-item__content ${openIndex === index ? 'FAQ-list-item__content--open' : ''}`}>
                            <p className="FAQ-list-item__description">
                                {item.description}
                            </p>

                            <Link
                                className="FAQ-list-item__link"
                                to={item.link}>
                                {item.linkName}

                                <SquareArrowOutUpRight size={16} strokeWidth={0.75} />
                            </Link>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}