"use client";

import useWallet from "@/hooks/useWallet";

function truncatePublicKey(publicKey: string) {
  if (publicKey.length <= 12) {
    return publicKey;
  }
  return `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`;
}

export default function WalletConnectButton() {
  const { status, publicKey, connect, disconnect, error } = useWallet();

  if (status === "not-installed") {
    return (
      <button
        type="button"
        onClick={() => window.open("https://freighter.app", "_blank")}
        className="rounded-full bg-warning px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-all flex items-center justify-center space-x-2"
      >
        <span>Install Freighter</span>
      </button>
    );
  }

  const buttonText =
    status === "connecting"
      ? "Connecting..."
      : status === "connected" && publicKey
      ? truncatePublicKey(publicKey)
      : "Connect Wallet";

  return (
    <button
      type="button"
      onClick={status === "connected" ? disconnect : connect}
      className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center space-x-2 min-w-[160px]"
      disabled={status === "connecting"}
      aria-busy={status === "connecting"}
    >
      <span>{buttonText}</span>
      {status === "error" && error ? <span className="sr-only"> Error: {error}</span> : null}
    </button>
  );
}
