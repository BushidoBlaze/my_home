import "./Skyline.css";

export default function Skyline() {
    return (
        <svg className="skyline" viewBox="0 0 600 800" preserveAspectRatio="xMidYMax slice">
            <defs>
                <pattern id="loginGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M40 0H0V40" fill="none" stroke="rgba(167,243,208,.35)" strokeWidth=".5" opacity=".5"/>
                </pattern>
            </defs>
            <rect width="600" height="800" fill="url(#loginGrid)"/>
            <g fill="rgba(110,231,183,.08)" stroke="rgba(167,243,208,.35)" strokeWidth="1">
                <rect x="40" y="540" width="80" height="260"/>
                <rect x="130" y="480" width="60" height="320"/>
                <rect x="200" y="420" width="70" height="380"/>
                <rect x="280" y="520" width="50" height="280"/>
                <rect x="340" y="380" width="90" height="420"/>
                <rect x="440" y="460" width="60" height="340"/>
                <rect x="510" y="510" width="60" height="290"/>
            </g>
            <g fill="rgba(167,243,208,.35)">
                {Array.from({length: 7}).map((_, c) =>
                    Array.from({length: 14}).map((_, r) => (
                        <rect
                            key={`${c}-${r}`}
                            x={50 + c * 70} y={560 + r * 18}
                            width="3" height="6"
                            opacity={(c + r) % 3 === 0 ? 0.6 : 0.25}
                        />
                    ))
                )}
            </g>
            <g stroke="rgba(167,243,208,.35)" fill="none" strokeWidth="1">
                <path d="M40 540 L80 510 L120 540"/>
                <path d="M340 380 L385 350 L430 380"/>
                <path d="M200 420 L235 395 L270 420"/>
            </g>
        </svg>
    );
}