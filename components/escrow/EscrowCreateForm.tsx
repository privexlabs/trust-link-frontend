"use client";

import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { createEscrow, EscrowInput, EscrowResponse } from "@/lib/api";

const SHIPPING_OPTIONS = ["Same day", "1–3 days", "1 week", "Custom"] as const;

interface FormState {
  itemName: string;
  priceUSDC: string;
  description: string;
  shippingWindow: string;
}

function getEscrowIdFromUrl(url: string): string {
  return url.split("/").pop() || "escrow";
}

export default function EscrowCreateForm() {
  const [form, setForm] = useState<FormState>({
    itemName: "",
    priceUSDC: "",
    description: "",
    shippingWindow: SHIPPING_OPTIONS[0],
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.itemName.trim()) newErrors.itemName = "Item name is required";
    if (!form.priceUSDC || isNaN(Number(form.priceUSDC)) || Number(form.priceUSDC) <= 0) {
      newErrors.priceUSDC = "Price must be a positive number";
    }
    if (!form.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: EscrowInput = {
        itemName: form.itemName,
        priceUSDC: form.priceUSDC,
        description: form.description,
        shippingWindow: form.shippingWindow,
      };
      const data: EscrowResponse = await createEscrow(payload);

      // Build the full buyer payment URL from the returned URL or escrow ID
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const escrowId = getEscrowIdFromUrl(data.url);
      const paymentUrl = data.url.startsWith("http") ? data.url : `${origin}/pay/${escrowId}`;

      setResultUrl(paymentUrl);
      toast.success("Escrow link created!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setSubmitError(msg);
      toast.error("Failed to create escrow");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async () => {
    if (!resultUrl) return;
    await navigator.clipboard.writeText(resultUrl);
    toast.success("Link copied to clipboard");
  };

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const escrowId = getEscrowIdFromUrl(resultUrl || "escrow");
    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = `escrow_${escrowId}.png`;
    a.click();
    toast.success("QR code downloaded");
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="itemName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Item name
          </label>
          <Input
            id="itemName"
            placeholder="Awesome Widget"
            value={form.itemName}
            onChange={(e) => handleChange("itemName", e.target.value)}
            disabled={isSubmitting}
          />
          {errors.itemName && <p className="mt-1 text-xs text-red-600">{errors.itemName}</p>}
        </div>

        <div>
          <label htmlFor="priceUSDC" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Price (USDC)
          </label>
          <Input
            id="priceUSDC"
            type="number"
            placeholder="123.45"
            value={form.priceUSDC}
            onChange={(e) => handleChange("priceUSDC", e.target.value)}
            disabled={isSubmitting}
          />
          {errors.priceUSDC && <p className="mt-1 text-xs text-red-600">{errors.priceUSDC}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Description
          </label>
          <Input
            id="description"
            placeholder="Brief description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            disabled={isSubmitting}
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        </div>

        <div>
          <label htmlFor="shippingWindow" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Shipping window
          </label>
          <select
            id="shippingWindow"
            value={form.shippingWindow}
            onChange={(e) => handleChange("shippingWindow", e.target.value)}
            disabled={isSubmitting}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            {SHIPPING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating link…
            </>
          ) : (
            "Create escrow link"
          )}
        </Button>
      </form>

      {resultUrl && (
        <div className="mt-6 p-4 border border-zinc-200 rounded-xl bg-white dark:bg-zinc-900 dark:border-zinc-700 shadow">
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">
            Your Escrow Link
          </h3>

          <div className="flex items-center gap-2 mb-4">
            <Input readOnly value={resultUrl} className="flex-1 font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={copyToClipboard} aria-label="Copy link">
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* QR Code — sized for mobile scanning */}
          <div className="flex justify-center mb-4">
            <QRCodeCanvas
              ref={canvasRef}
              value={resultUrl}
              size={200}
              marginSize={2}
            />
          </div>

          <Button variant="outline" className="w-full" onClick={downloadQR} aria-label="Download QR code">
            <Download className="mr-2 h-4 w-4" />
            Download QR
          </Button>
        </div>
      )}
    </div>
  );
}
