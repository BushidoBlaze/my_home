import {useEffect, useRef} from "react";
import "./HeroSphere.css";

interface RGB {
    r: number;
    g: number;
    b: number;
}

interface HeroSphereProps {
    // Цвет точек сзади (тёмные, почти невидимые)
    colorBack?: RGB;
    // Цвет точек спереди (яркие, ближние)
    colorFront?: RGB;
}

export default function HeroSphere({
                                       colorBack = {r: 29, g: 84, b: 59}, // #1D543B
                                       colorFront = {r: 143, g: 207, b: 135}, // #8FCF87
                                   }: HeroSphereProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animId: number;
        let angle = 0;

        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resize();
        window.addEventListener("resize", resize);

        // Равномерное распределение точек по сфере (Fibonacci lattice)
        const NUM_POINTS = 700;
        const GOLDEN = Math.PI * (1 + Math.sqrt(5));
        const pts: [number, number, number][] = [];

        for (let i = 0; i < NUM_POINTS; i++) {
            const theta = Math.acos(1 - (2 * (i + 0.5)) / NUM_POINTS);
            const phi = GOLDEN * i;
            pts.push([
                Math.sin(theta) * Math.cos(phi),
                Math.sin(theta) * Math.sin(phi),
                Math.cos(theta),
            ]);
        }

        const TILT_COS = Math.cos(0.18);
        const TILT_SIN = Math.sin(0.18);

        const draw = () => {
            const W = canvas.offsetWidth;
            const H = canvas.offsetHeight;
            const cx = W / 2;
            const cy = H / 2;
            const R = Math.min(W, H) * 0.40;
            const FOV = 3.2;

            ctx.clearRect(0, 0, W, H);
            angle += 0.0025;

            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);

            type Dot = { sx: number; sy: number; depth: number };
            const dots: Dot[] = [];

            for (const [x, y, z] of pts) {
                // Поворот вокруг Y
                const rx = x * cosA + z * sinA;
                const rz = -x * sinA + z * cosA;
                // Наклон вокруг X (чуть вперёд)
                const ry2 = y * TILT_COS - rz * TILT_SIN;
                const rz2 = y * TILT_SIN + rz * TILT_COS;

                const scale = FOV / (FOV + rz2);
                dots.push({
                    sx: cx + rx * R * scale,
                    sy: cy + ry2 * R * scale,
                    depth: rz2,
                });
            }

            // Рисуем от дальних к ближним
            dots.sort((a, b) => a.depth - b.depth);

            for (const {sx, sy, depth} of dots) {
                const t = (depth + 1) / 2;             // 0 = сзади, 1 = спереди
                const opacity = 0.06 + t * 0.72;
                const dotSize = 0.7 + t * 1.8;

                const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
                const r = lerp(colorBack.r, colorFront.r);
                const g = lerp(colorBack.g, colorFront.g);
                const b = lerp(colorBack.b, colorFront.b);

                ctx.beginPath();
                ctx.arc(sx, sy, dotSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r},${g},${b},${opacity.toFixed(2)})`;
                ctx.fill();
            }

            animId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, [colorBack, colorFront]);

    return (
        <div className="hero-sphere">
            <canvas ref={canvasRef} className="hero-sphere__canvas"/>
        </div>
    );
}