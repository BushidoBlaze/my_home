import HeroSphere from "@/shared/ui/heroSphere/HeroSphere.tsx";
import HeroContent from "./HeroContent.tsx";
import "./Hero.css";

export default function Hero() {
    return (
        <div className="possibilities-hero">
            <HeroSphere />
            <HeroContent />
        </div>
    );
}
