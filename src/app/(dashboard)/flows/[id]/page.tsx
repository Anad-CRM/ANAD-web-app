"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { getFlow, type Flow, type FlowNode } from "@/core/api/flowApi";
import { FlowEditorShell } from "@/modules/flows";
import { COLORS } from "@/core/components/theme/colors";

export default function FlowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [flow, setFlow] = useState<Flow | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getFlow(id);
        setFlow(data.flow);
        setNodes(data.nodes);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load flow");
        router.push("/flows");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: COLORS.primaryDark }} />
      </div>
    );
  }

  if (!flow) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/flows")}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" /> Back to Flows
        </button>
      </div>

      {/* Editor workspace */}
      <FlowEditorShell initialFlow={flow} initialNodes={nodes} />
    </div>
  );
}
