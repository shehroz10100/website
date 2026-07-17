"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitInquiryAction, type ActionResult } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const initial: ActionResult | null = null;

type Props = {
  productId?: string;
  productName?: string;
};

export function InquiryForm({ productId, productName }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    submitInquiryAction,
    initial
  );
  const { toast } = useToast();

  useEffect(() => {
    if (!state) return;
    toast({
      title: state.success ? "Inquiry sent" : "Error",
      description: state.message,
      variant: state.success ? "default" : "destructive",
    });
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="relative space-y-4">
      {productId && (
        <input type="hidden" name="product_id" value={productId} />
      )}
      {/* Honeypot — leave empty */}
      <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      {productName && (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          Inquiry regarding:{" "}
          <strong className="text-foreground">{productName}</strong>
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer_name">Name *</Label>
          <Input id="customer_name" name="customer_name" required />
          {state?.errors?.customer_name && (
            <p className="text-xs text-destructive">
              {state.errors.customer_name[0]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_name">Company</Label>
          <Input id="company_name" name="company_name" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required />
          {state?.errors?.email && (
            <p className="text-xs text-destructive">{state.errors.email[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input id="country" name="country" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder="Quantities, certifications required, delivery destination..."
        />
        {state?.errors?.message && (
          <p className="text-xs text-destructive">{state.errors.message[0]}</p>
        )}
      </div>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Sending..." : "Submit Inquiry"}
      </Button>
    </form>
  );
}
