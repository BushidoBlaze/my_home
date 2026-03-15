import HeroContent from "./HeroContent.tsx";
import "./Hero.css";

export default function Hero() {
    return (
        <div className="possibilities-hero">
            {/*Основной контент встречающей секции*/}
            <HeroContent/>
        </div>
    );
}