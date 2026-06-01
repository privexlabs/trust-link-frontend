import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PaymentForm from "../PaymentForm";
import useWallet from "@/hooks/useWallet";
import { submitPayment } from "@/lib/stellar/contract";

// Mock the hooks and lib functions
vi.mock("@/hooks/useWallet");
vi.mock("@/lib/stellar/contract");

describe("PaymentForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders disabled button when wallet is not connected", () => {
    (useWallet as any).mockReturnValue({
      status: "disconnected",
      publicKey: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
    });

    render(<PaymentForm />);
    
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText(/Connect Wallet to Pay/i)).toBeInTheDocument();
    expect(screen.getByText(/Wallet connection required/i)).toBeInTheDocument();
  });

  it("renders enabled button when wallet is connected", () => {
    (useWallet as any).mockReturnValue({
      status: "connected",
      publicKey: "GABC...",
      connect: vi.fn(),
      disconnect: vi.fn(),
    });

    render(<PaymentForm />);
    
    const button = screen.getByRole("button");
    expect(button).toBeEnabled();
    expect(screen.getByText(/Complete Payment/i)).toBeInTheDocument();
  });

  it("shows loading spinner and disables button during submission", async () => {
    (useWallet as any).mockReturnValue({
      status: "connected",
      publicKey: "GABC...",
    });

    // Make submitPayment stay in pending state
    (submitPayment as any).mockReturnValue(new Promise(() => {}));

    render(<PaymentForm />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Check for loading state (form handle logic sets loading=true)
    // We expect the button to be disabled and have a spinner (Loader2 has data-testid if we added it, but we can check for svg or just text if it changed)
    // In our implementation, text doesn't show when loading, only spinner.
    expect(button).toBeDisabled();
    // Lucide components don't have easy text content, but we can check for the svg or aria-busy if we added it.
    // Let's assume the button has no text when loading as per our code: {loading ? <Loader2... /> : <span>...</span>}
    expect(screen.queryByText(/Complete Payment/i)).not.toBeInTheDocument();
  });

  it("renders transaction hash on success", async () => {
    (useWallet as any).mockReturnValue({
      status: "connected",
      publicKey: "GABC...",
    });

    const mockHash = "test_hash_12345";
    (submitPayment as any).mockResolvedValue(mockHash);

    render(<PaymentForm />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Payment Confirmed/i)).toBeInTheDocument();
      expect(screen.getByText(mockHash)).toBeInTheDocument();
    });
    
    // Button should be disabled after success
    expect(button).toBeDisabled();
  });

  it("renders human-readable error message on failure", async () => {
    (useWallet as any).mockReturnValue({
      status: "connected",
      publicKey: "GABC...",
    });

    const errorMessage = "Insufficient XLM balance";
    (submitPayment as any).mockRejectedValue(new Error(errorMessage));

    render(<PaymentForm />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    // Button should be re-enabled to allow retry
    expect(button).toBeEnabled();
  });
});
