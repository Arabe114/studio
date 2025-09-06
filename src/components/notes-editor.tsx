"use client";

import { useState, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bold, Italic, Upload } from "lucide-react";

export default function NotesEditor() {
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("Untitled Note");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyFormat = (format: 'bold' | 'italic') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = noteContent.substring(start, end);
    
    if (!selectedText) return;

    let formattedText;
    switch(format) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            break;
    }

    const newContent = noteContent.substring(0, start) + formattedText + noteContent.substring(end);
    setNoteContent(newContent);

    // After updating, focus and move cursor
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, end + 2);
    }, 0);
  };
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'text/plain') {
        alert("Please select a .txt file.");
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result;
        setNoteContent(text as string);
    };
    reader.readAsText(file);
    setNoteTitle(file.name.replace('.txt', ''));
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h1 className="text-3xl font-bold">Notes Editor</h1>
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Import .txt File
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".txt"
                className="hidden"
            />
        </Button>
      </div>

      <Input 
        value={noteTitle}
        onChange={(e) => setNoteTitle(e.target.value)}
        className="text-2xl font-semibold border-0 shadow-none focus-visible:ring-0 mb-4 p-0 shrink-0"
        placeholder="Note Title"
      />

      <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-card border shrink-0">
        <Button variant="outline" size="icon" onClick={() => applyFormat('bold')} title="Bold">
            <Bold className="h-4 w-4"/>
        </Button>
        <Button variant="outline" size="icon" onClick={() => applyFormat('italic')} title="Italic">
            <Italic className="h-4 w-4"/>
        </Button>
      </div>

      <div className="flex-grow flex flex-col">
        <Textarea
          ref={textareaRef}
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Start writing your notes here..."
          className="w-full h-full flex-grow resize-none text-base"
        />
      </div>
    </div>
  );
}
