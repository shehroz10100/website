"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteAllProductsAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

type Props = {
  total: number;
};

export function DeleteAllProductsButton({ total }: Props) {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  if (total <= 0) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
          Delete all
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete all {total} products?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes every product from the catalog. Categories
            stay. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() =>
              startTransition(async () => {
                const result = await deleteAllProductsAction();
                toast({
                  title: result.success ? "Products deleted" : "Error",
                  description: result.message,
                  variant: result.success ? "default" : "destructive",
                });
                if (result.success) router.refresh();
              })
            }
          >
            {pending ? "Deleting..." : `Delete all ${total}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
