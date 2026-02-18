import {useState, useEffect} from 'react'
import {ArrowUpToLine} from "lucide-react";
import "./BackToTop.css";

export default function BackToTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 600) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        }
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo(
            {top: 0, behavior: "smooth"}
        );
    }

    return (
        <>
            {visible && (
                <button
                    className="back-to-top__button"
                    onClick={scrollToTop}>
                    <ArrowUpToLine size={18}/>
                </button>
            )}
        </>

    )
}