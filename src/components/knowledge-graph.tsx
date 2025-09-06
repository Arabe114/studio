"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ChevronRight, Folder, Star, Paperclip, FilePlus, FolderPlus, Trash2, Upload, FileCode } from 'lucide-react';
import ForceGraph from './force-graph';
import { Button } from './ui/button';

export default function KnowledgeGraph() {
  const [repelStrength, setRepelStrength] = useState(-500);
  const [linkDistance, setLinkDistance] = useState(50);
  const [centerForce, setCenterForce] = useState(true);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full min-h-[85vh]">
      <Card className="lg:col-span-1 bg-card/50 hidden lg:block">
        <CardHeader>
          <h2 className="text-lg font-semibold">File Explorer</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              <details open className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
                  <Star className="h-4 w-4 shrink-0 text-yellow-500" />
                  <span className="truncate">Favorites</span>
                </summary>
                <ul className="pl-6 pt-1 space-y-1">
                  <li className="text-muted-foreground hover:text-foreground cursor-pointer truncate">Project Plan</li>
                  <li className="text-muted-foreground hover:text-foreground cursor-pointer truncate">Meeting Notes</li>
                </ul>
              </details>
            </li>
            <li>
              <details open className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
                  <Folder className="h-4 w-4 shrink-0 text-blue-500" />
                  <span className="truncate">ELN</span>
                </summary>
                <ul className="pl-6 pt-1 space-y-1">
                  <li className="text-muted-foreground hover:text-foreground cursor-pointer truncate">Experiment 1</li>
                  <li className="text-muted-foreground hover:text-foreground cursor-pointer truncate">Experiment 2</li>
                </ul>
              </details>
            </li>
            <li>
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
                  <Paperclip className="h-4 w-4 shrink-0 text-gray-500" />
                  <span className="truncate">Attachments</span>
                </summary>
                 <ul className="pl-6 pt-1 space-y-1">
                  <li className="text-muted-foreground hover:text-foreground cursor-pointer truncate">image.png</li>
                </ul>
              </details>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 h-[50vh] lg:h-full rounded-lg border bg-background">
        <ForceGraph 
          repelStrength={repelStrength}
          linkDistance={linkDistance}
          centerForce={centerForce}
        />
      </div>

      <Card className="lg:col-span-1 bg-card/50">
        <CardHeader>
          <h2 className="text-lg font-semibold">Controls</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input placeholder="Search nodes..." />

          <div className="space-y-2">
            <h3 className="font-medium">Actions</h3>
            <div className="grid grid-cols-2 gap-2">
               <Button variant="outline" size="sm"><FilePlus /> New Node</Button>
               <Button variant="outline" size="sm"><FolderPlus /> New Folder</Button>
            </div>
            <Button variant="outline" size="sm" className="w-full"><Trash2 /> Delete Selected</Button>
            <Button variant="outline" size="sm" className="w-full"><Upload /> Import Folder</Button>
            <Button variant="outline" size="sm" className="w-full"><FileCode /> Add Project Files</Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Forces</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="center-force">Center</Label>
              <Switch id="center-force" checked={centerForce} onCheckedChange={setCenterForce} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repel-force">Repel ({repelStrength})</Label>
              <Slider 
                id="repel-force" 
                min={-1000} 
                max={0} 
                step={50} 
                value={[repelStrength]} 
                onValueChange={(value) => setRepelStrength(value[0])}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-force">Link Distance ({linkDistance})</Label>
              <Slider 
                id="link-force" 
                min={10} 
                max={200} 
                step={10} 
                value={[linkDistance]} 
                onValueChange={(value) => setLinkDistance(value[0])}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
