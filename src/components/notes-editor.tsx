import { Textarea } from "@/components/ui/textarea";

export default function NotesEditor() {
  return (
    <div className="flex flex-col h-full min-h-[85vh]">
      <h1 className="text-3xl font-bold mb-6">Notes Editor</h1>
      <div className="flex-1 flex">
        <Textarea
          placeholder="Start writing your notes here..."
          className="w-full h-full resize-none text-base"
        />
      </div>
    </div>
  );
}
