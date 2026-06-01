import ErrorBoundary from "@/components/layout/ErrorBoundary";
import EscrowCreateForm from "@/components/escrow/EscrowCreateForm";

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-zinc-50 p-6 dark:bg-black">
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-zinc-950 dark:text-white">Create Escrow Link</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Generate a secure payment link for your buyer.
          </p>
        </div>
        <ErrorBoundary>
          <EscrowCreateForm />
        </ErrorBoundary>
      </div>
    </main>
  );
}
