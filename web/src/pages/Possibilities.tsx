import Hero from "@/components/possibilitiesPage/hero/ui/Hero.tsx";
import Devices from "@/components/possibilitiesPage/devices/ui/Devices.tsx";
import SloganLabel from "@/shared/ui/sloganLabel/SloganLabel.tsx";
import PossibilitiesCards from "@/components/possibilitiesPage/possibilitiesCards/ui/PossibilitiesCards.tsx";

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
        </>
    )
}