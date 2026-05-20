import Hero from "@/pages/possibilities/ui/hero/ui/Hero.tsx";
import Devices from "@/pages/possibilities/ui/devices/ui/Devices.tsx";
import SloganLabel from "@/shared/ui/sloganLabel/SloganLabel.tsx";
import PossibilitiesCards from "@/pages/possibilities/ui/possibilitiesCards/ui/PossibilitiesCards.tsx";
import Audience from "@/pages/possibilities/ui/audience/ui/Audience.tsx";
import Reviews from "@/pages/possibilities/ui/reviews/Reviews.tsx";
import Stats from "@/pages/possibilities/ui/stats/ui/Stats.tsx";

export default function Possibilities() {
    return (
        <>
            {/*Главная секция*/}
            <Hero/>

            {/*Секция с дивайсами*/}
            <Devices/>

            {/*Слоган (UI - элемент)*/}
            <SloganLabel sloganText={<>Все инструменты для комфортного управления домом в одном месте</>}/>

            {/*Карточки возможностей*/}
            <PossibilitiesCards/>

            {/*Слоган (UI - элемент)*/}
            <SloganLabel sloganText={<>Прозрачность на каждом шаге <br/>от заявки до закрытия</>}/>

            {/*Дашборды*/}
            <Audience/>

            <Stats/>

            <Reviews/>
        </>
    )
}