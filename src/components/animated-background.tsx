
"use client";

import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';

const AnimatedBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const { resolvedTheme } = useTheme();
    const realMousePosition = useRef({ x: Infinity, y: Infinity });
    const animatedMousePosition = useRef({ x: Infinity, y: Infinity });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            createWaves(); // Re-create waves on resize
        };

        const handleMouseMove = (event: MouseEvent) => {
            realMousePosition.current = { x: event.clientX, y: event.clientY };
        };

        const handleMouseLeave = () => {
            realMousePosition.current = { x: Infinity, y: Infinity };
        }

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        class Wave {
            y: number;
            length: number;
            amplitude: number;
            frequency: number;
            phase: number;
            color: string;

            constructor(y: number, length: number, amplitude: number, frequency: number, color: string) {
                this.y = y;
                this.length = length;
                this.amplitude = amplitude;
                this.frequency = frequency;
                this.phase = Math.random() * Math.PI * 2;
                this.color = color;
            }

            draw(context: CanvasRenderingContext2D, frame: number) {
                context.beginPath();
                context.moveTo(0, this.y);

                for (let i = 0; i < width; i++) {
                    const dx = i - animatedMousePosition.current.x;
                    const dy = this.y - animatedMousePosition.current.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const maxSwell = 500; // Increased range
                    // Using a cosine easing function for a smoother falloff
                    const swellFactor = Math.max(0, 1 - distance / maxSwell);
                    const easedSwell = (1 - Math.cos(swellFactor * Math.PI)) / 2;
                    const swellAmount = easedSwell * 100; // Increased swell height
                    
                    const waveY = this.y + Math.sin(i * this.length + this.phase + frame * this.frequency) * this.amplitude + swellAmount;
                    context.lineTo(i, waveY);
                }

                context.strokeStyle = this.color;
                context.lineWidth = 1.5;
                context.stroke();
                context.closePath();
            }
        }
        
        let waves: Wave[] = [];

        const createWaves = () => {
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim().split(' ');
            const primaryH = parseFloat(primaryColor[0]);
            const primaryS = parseFloat(primaryColor[1]);
            const primaryL = parseFloat(primaryColor[2]);
            
            const numberOfWaves = Math.floor(height / 50); 
            waves = [];
            for (let i = 0; i < numberOfWaves; i++) {
                const y = (height / (numberOfWaves - 1)) * i;
                const length = 0.005 + Math.random() * 0.01;
                const amplitude = 15 + Math.random() * 20;
                const frequency = 0.01 + Math.random() * 0.01;
                const opacity = 0.4 + Math.random() * 0.3;
                const color = `hsla(${primaryH}, ${primaryS}%, ${primaryL}%, ${opacity})`;
                waves.push(new Wave(y, length, amplitude, frequency, color));
            }
        }

        createWaves();

        let frame = 0;
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            const bgColor = resolvedTheme === 'dark' ? 'hsl(0 0% 19%)' : 'hsl(0 0% 100%)';
            ctx.fillStyle = bgColor;
            ctx.fillRect(0,0,width,height);
            
            // Easing / Interpolation for smoother mouse follow
            const easingFactor = 0.04; // Decreased for smoother follow
            if (animatedMousePosition.current.x === Infinity) {
                animatedMousePosition.current = realMousePosition.current;
            } else {
                animatedMousePosition.current.x += (realMousePosition.current.x - animatedMousePosition.current.x) * easingFactor;
                animatedMousePosition.current.y += (realMousePosition.current.y - animatedMousePosition.current.y) * easingFactor;
            }

            waves.forEach(wave => wave.draw(ctx, frame));
            frame++;
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [resolvedTheme]);

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed top-0 left-0 w-full h-full -z-10"
        />
    );
};

export default AnimatedBackground;
