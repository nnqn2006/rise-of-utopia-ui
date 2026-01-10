import { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
    baseValue: number;
    incrementPerSecond: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}

export function AnimatedCounter({
    baseValue,
    incrementPerSecond,
    decimals = 4,
    prefix = "",
    suffix = "",
    className = ""
}: AnimatedCounterProps) {
    const [value, setValue] = useState(baseValue);
    const startTimeRef = useRef(Date.now());
    const frameRef = useRef<number>();

    useEffect(() => {
        startTimeRef.current = Date.now();

        const animate = () => {
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            const newValue = baseValue + (elapsed * incrementPerSecond);
            setValue(newValue);
            frameRef.current = requestAnimationFrame(animate);
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [baseValue, incrementPerSecond]);

    const formattedValue = value.toFixed(decimals);

    return (
        <span className={`font-mono tabular-nums ${className}`}>
            {prefix}{formattedValue}{suffix}
        </span>
    );
}
