// Web3 utilities for real blockchain interaction
import { parseUnits, formatUnits } from 'viem';

export interface PaymentResult {
  txHash: string;
  status: 'success' | 'failed';
  gasUsed: string;
  gasFee: string;
}

// USDC contract address on Base Sepolia
const USDC_CONTRACT_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
// Recipient address for payments
const RECIPIENT_ADDRESS = '0x36F322fC85B24aB13263CFE9217B28f8E2b38381';

// ERC-20 Transfer function signature
const TRANSFER_FUNCTION_SIGNATURE = '0xa9059cbb';

export async function processUSDCPayment(
  amount: string,
  senderAddress: string
): Promise<PaymentResult> {
  if (!window.ethereum) {
    throw new Error('請安裝 MetaMask 或其他 Web3 錢包');
  }

  try {
    // Convert amount to USDC decimals (6 decimals)
    const amountInWei = parseUnits(amount, 6);
    
    // Encode transfer function call
    const transferData = TRANSFER_FUNCTION_SIGNATURE + 
      RECIPIENT_ADDRESS.slice(2).padStart(64, '0') + 
      amountInWei.toString(16).padStart(64, '0');

    // Send transaction
    const txHash = await (window.ethereum as any).request({
      method: 'eth_sendTransaction',
      params: [{
        from: senderAddress,
        to: USDC_CONTRACT_ADDRESS,
        data: transferData,
        gas: '0x186A0', // 100,000 gas limit
      }],
    });

    // Wait for transaction receipt
    let receipt = null;
    let attempts = 0;
    while (!receipt && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      receipt = await (window.ethereum as any).request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });
      attempts++;
    }

    if (!receipt) {
      throw new Error('交易確認超時');
    }

    return {
      txHash,
      status: receipt.status === '0x1' ? 'success' : 'failed',
      gasUsed: parseInt(receipt.gasUsed, 16).toString(),
      gasFee: formatUnits(BigInt(receipt.gasUsed) * BigInt(receipt.effectiveGasPrice || '0'), 18),
    };
  } catch (error: any) {
    throw new Error(`付款失敗: ${error.message}`);
  }
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

// Declare global types for Web3 wallets
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

// Check if user has paid for article by querying blockchain
export async function checkUSDCPayment(
  userAddress: string,
  recipientAddress: string,
  minimumAmount: string
): Promise<boolean> {
  try {
    const amountInWei = parseUnits(minimumAmount, 6);
    
    // Query Base Sepolia RPC for USDC transfer events
    const response = await fetch(`https://sepolia.base.org`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getLogs',
        params: [{
          fromBlock: '0x0',
          toBlock: 'latest',
          address: USDC_CONTRACT_ADDRESS,
          topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event signature
            '0x' + userAddress.slice(2).padStart(64, '0'), // from address
            '0x' + recipientAddress.slice(2).padStart(64, '0'), // to address
          ]
        }],
        id: 1
      })
    });

    const data = await response.json();
    
    if (data.result && data.result.length > 0) {
      // Check if any transfer amount is >= minimum required
      for (const log of data.result) {
        const transferAmount = BigInt(log.data);
        if (transferAmount >= amountInWei) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking USDC payment:', error);
    return false;
  }
}
