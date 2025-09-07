"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Stage as StageType } from 'konva/lib/Stage';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Pen, Eraser, Undo, Redo, Trash2, Download, Palette } from 'lucide-react';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useLanguage } from '@/hooks/use-language';

type Line = {
  tool: 'pen' | 'eraser';
  points: number[];
  color: string;
  strokeWidth: number;
};

export default function DrawBoard() {
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [lines, setLines] = useState<Line[]>([]);
  const [history, setHistory] = useState<Line[][]>([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);
  const isDrawing = useRef(false);
  const stageRef = useRef<StageType>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsMounted(true);
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  }, []);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    // Start a new line
    const newLine = { tool, points: [pos.x, pos.y], color, strokeWidth: brushSize };
    setLines([...lines, newLine]);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    let lastLine = lines[lines.length - 1];
    // Add point to the last line
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // Replace last line
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(lines);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };
  
  const handleUndo = () => {
    if (historyStep === 0) return;
    const newStep = historyStep - 1;
    setHistoryStep(newStep);
    setLines(history[newStep]);
  };
  
  const handleRedo = () => {
    if (historyStep === history.length - 1) return;
    const newStep = historyStep + 1;
    setHistoryStep(newStep);
    setLines(history[newStep]);
  };
  
  const handleClear = () => {
    setLines([]);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push([]);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }

  const handleExport = () => {
    if(!stageRef.current) return;
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = 'sketch.png';
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ColorButton = ({ value }: { value: string }) => (
    <button
        className="w-8 h-8 rounded-full border-2 border-card"
        style={{ backgroundColor: value }}
        onClick={() => setColor(value)}
    />
  );

  return (
    <div className="h-full flex flex-col gap-4">
       <h1 className="text-3xl font-bold">{t('drawBoard')}</h1>
      <p className="text-muted-foreground -mt-2">
        {t('drawBoardDescription')}
      </p>
      
      <Card className="flex flex-col md:flex-row gap-4 p-4 items-center">
        <div className="flex gap-2">
            <Button variant={tool === 'pen' ? 'secondary': 'ghost'} size="icon" onClick={() => setTool('pen')} title={t('pen')}>
                <Pen />
            </Button>
            <Button variant={tool === 'eraser' ? 'secondary': 'ghost'} size="icon" onClick={() => setTool('eraser')} title={t('eraser')}>
                <Eraser />
            </Button>
        </div>

        <div className="flex items-center gap-4">
            <Label htmlFor="brush-color">{t('color')}</Label>
            <Popover>
                <PopoverTrigger asChild>
                     <Button style={{ backgroundColor: color }} className="w-10 h-10 rounded-full border-2 border-card" />
                </PopoverTrigger>
                <PopoverContent className="w-auto">
                    <div className="grid grid-cols-4 gap-2">
                        <ColorButton value="#ffffff" />
                        <ColorButton value="#ef4444" />
                        <ColorButton value="#f97316" />
                        <ColorButton value="#eab308" />
                        <ColorButton value="#84cc16" />
                        <ColorButton value="#22c55e" />
                        <ColorButton value="#14b8a6" />
                        <ColorButton value="#06b6d4" />
                        <ColorButton value="#3b82f6" />
                        <ColorButton value="#8b5cf6" />
                        <ColorButton value="#ec4899" />
                        <ColorButton value="#111827" />
                    </div>
                </PopoverContent>
            </Popover>
        </div>

        <div className="flex items-center gap-2 w-full md:w-48">
          <Label htmlFor="brush-size" className="whitespace-nowrap">{t('brushSize')}: {brushSize}</Label>
          <Slider
            id="brush-size"
            min={1}
            max={50}
            step={1}
            value={[brushSize]}
            onValueChange={(value) => setBrushSize(value[0])}
          />
        </div>
        
        <div className="flex gap-2 ml-auto">
             <Button variant='ghost' size="icon" onClick={handleUndo} title={t('undo')} disabled={historyStep === 0}><Undo /></Button>
             <Button variant='ghost' size="icon" onClick={handleRedo} title={t('redo')} disabled={historyStep === history.length - 1}><Redo /></Button>
             <Button variant='ghost' size="icon" onClick={handleClear} title={t('clear')}><Trash2 /></Button>
             <Button onClick={handleExport} title={t('export')}><Download className="mr-2" /> {t('export')}</Button>
        </div>
      </Card>
      
      <CardContent ref={containerRef} className="p-0 flex-grow rounded-lg border bg-background overflow-hidden">
        {isMounted && (
            <Stage
            width={dimensions.width}
            height={dimensions.height}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            ref={stageRef}
            >
            <Layer>
                {lines.map((line, i) => (
                <Line
                    key={i}
                    points={line.points}
                    stroke={line.color}
                    strokeWidth={line.strokeWidth}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation={
                    line.tool === 'eraser' ? 'destination-out' : 'source-over'
                    }
                />
                ))}
            </Layer>
            </Stage>
        )}
      </CardContent>
    </div>
  );
}