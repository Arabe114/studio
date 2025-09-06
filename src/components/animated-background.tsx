
"use client";

import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';

const AnimatedBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const { resolvedTheme } = useTheme();
    const mousePosition = useRef({ x: Infinity, y: Infinity });

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
        };

        const handleMouseMove = (event: MouseEvent) => {
            mousePosition.current = { x: event.clientX, y: event.clientY };
        };

        const handleMouseLeave = () => {
            mousePosition.current = { x: Infinity, y: Infinity };
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
                    const dx = i - mousePosition.current.x;
                    const dy = this.y - mousePosition.current.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const maxSwell = 200;
                    const swell = 1 - (distance / maxSwell);
                    const swellAmount = swell > 0 ? Math.sin(swell * Math.PI) * 80 : 0;
                    
                    const waveY = Math.sin(i * this.length + this.phase + frame * this.frequency) * this.amplitude + this.y + swellAmount;
                    context.lineTo(i, waveY);
                }

                context.strokeStyle = this.color;
                context.lineWidth = 2;
                context.stroke();
                context.closePath();
            }
        }
        
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim().split(' ');
        const primaryH = parseFloat(primaryColor[0]);
        const primaryS = parseFloat(primaryColor[1]);
        const primaryL = parseFloat(primaryColor[2]);

        const waves = [
            new Wave(height * 0.4, 0.01, 20, 0.01, `hsla(${primaryH}, ${primaryS}%, ${primaryL}%, 0.3)`),
            new Wave(height * 0.45, 0.012, 30, 0.015, `hsla(${primaryH}, ${primaryS}%, ${primaryL}%, 0.4)`),
            new Wave(height * 0.5, 0.008, 40, 0.02, `hsla(${primaryH}, ${primaryS}%, ${primaryL}%, 0.6)`),
            new Wave(height * 0.55, 0.009, 30, 0.025, `hsla(${primaryH}, ${primaryS}%, ${primaryL}%, 0.4)`),
            new Wave(height * 0.6, 0.01, 20, 0.03, `hsla(${primaryH}, ${primaryS}%, ${primaryL}%, 0.3)`),
        ];

        let frame = 0;
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            const bgColor = resolvedTheme === 'dark' ? 'hsl(0 0% 19%)' : 'hsl(0 0% 100%)';
            ctx.fillStyle = bgColor;
            ctx.fillRect(0,0,width,height);

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
