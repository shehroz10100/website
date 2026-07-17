"use client";

import { useTransition } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { ActionResult } from "@/lib/actions";

type Props = {
  id: string;
  onDuplicate: (id: string) => Promise<ActionResult>;
};

export function DuplicateButton({ id, onDuplicate }: Props) {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title="Duplicate product"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            const result = await onDuplicate(id);
            if (result && !result.success) {
              toast({
                title: "Error",
                description: result.message,
                variant: "destructive",
              });
            }
          } catch {
            // redirect throws — expected on success
          }
        })
      }
    >
      <Copy className="h-4 w-4" />
    </Button>
  );
}
