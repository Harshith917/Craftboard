import { useParams } from "react-router-dom";

export default function EditorPage() {
  const { projectId, pageId } = useParams();

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-lg font-semibold text-foreground mb-2">Canvas editor</h1>
        <p className="text-sm text-muted-foreground mb-4">
          The canvas editor is being migrated to the new stack. It will land in the next phase.
        </p>
        <p className="text-xs text-muted-foreground/70">
          Project {projectId} · Page {pageId}
        </p>
      </div>
    </div>
  );
}
