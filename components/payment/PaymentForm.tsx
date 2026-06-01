"use client";

import { useState } from "react";
import useWallet from "@/hooks/useWallet";
import { submitPayment } from "@/lib/stellar/contract";
import { Loader2, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

interface PaymentFormProps {
  amount?: string;
  destination?: string;
  onSuccess?: (hash: string) => void;
}

export default function PaymentForm({ 
  amount = "50.00", 
  destination = "GC3...7X2" 
}: PaymentFormProps) {
  const { status } = useWallet();
  const [loading, setLoading] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "connected") return;

    setLoading(true);
    setError(null);
    setHash(null);

    try {
      const txHash = await submitPayment(amount, destination);
      setHash(txHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred during payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden group">
      {/* Subtle background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center space-x-4 mb-2">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Escrow Payment</h3>
            <p className="text-sm text-muted">Securely fund this transaction</p>
          </div>
        </div>

        <div className="p-4 bg-muted-bg rounded-2xl space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Amount</span>
            <span className="font-bold text-foreground">{amount} XLM</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Recipient</span>
            <span className="font-mono text-xs">{destination}</span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-2xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {hash && (
          <div className="p-4 bg-success/10 border border-success/20 text-success text-sm rounded-2xl flex items-start space-x-3 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Payment Confirmed</p>
              <p className="text-xs break-all opacity-80">{hash}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={status !== "connected" || loading || !!hash}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="text-base">
                {status === "connected" ? "Complete Payment" : "Connect Wallet to Pay"}
              </span>
            )}
          </button>
        </form>

        {status !== "connected" && !hash && (
          <p className="text-center text-xs text-warning animate-pulse font-medium">
            Wallet connection required to authorize payment
          </p>
        )}
      </div>
    </div>
  );
}
