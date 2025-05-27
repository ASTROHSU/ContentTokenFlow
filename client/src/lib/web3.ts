// Web3 utilities for blockchain interaction simulation

export interface PaymentResult {
  txHash: string;
  status: 'success' | 'failed';
  gasUsed: string;
  gasFee: string;
}

export async function simulatePayment(
  amount: string,
  recipient: string
): Promise<PaymentResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
  
  // Simulate occasional failures
  if (Math.random() < 0.05) {
    throw new Error('Transaction failed: Insufficient gas fee');
  }
  
  return {
    txHash: '0x' + Math.random().toString(16).substr(2, 64),
    status: 'success',
    gasUsed: (21000 + Math.floor(Math.random() * 50000)).toString(),
    gasFee: (Math.random() * 0.5 + 0.1).toFixed(4),
  };
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatUSDC(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(num);
}

// Declare global types for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}
