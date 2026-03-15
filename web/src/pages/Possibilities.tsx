import Hero from "@/components/possibilitiesPage/hero/ui/Hero.tsx";
import Devices from "@/components/possibilitiesPage/devices/ui/Devices.tsx";

export default function Possibilities() {
    return (
        <>
            {/*Главная секция*/}
            <Hero/>

            {/*Секция с дивайсами*/}
            <Devices/>
        </>
    )
}