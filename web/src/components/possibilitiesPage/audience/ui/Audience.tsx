import AudienceMC from "./managementCompany/AudienceMC.tsx";
import AudienceRC from "./residentialComplex/AudienceRC.tsx";
import "./Audience.css";

export default function Audience() {
    return (
        <div className="possibilities-audience" data-reveal>

            {/*Блок управляющей компании*/}
            <AudienceMC/>

            {/*Блок жильцов*/}
            <AudienceRC/>
        </div>
    );
}