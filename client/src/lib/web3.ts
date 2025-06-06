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
    console.log(`Checking payment from ${userAddress} to ${recipientAddress} for ${minimumAmount} USDC`);
    
    // Use Basescan API to query USDC transfers from user to recipient
    const basescanUrl = `https://api-sepolia.basescan.org/api` +
      `?module=account` +
      `&action=tokentx` +
      `&contractaddress=${USDC_CONTRACT_ADDRESS}` +
      `&address=${userAddress}` +
      `&startblock=0` +
      `&endblock=latest` +
      `&sort=desc` +
      `&apikey=${import.meta.env.VITE_BASESCAN_API_KEY}`;
    
    const response = await fetch(basescanUrl);
    const data = await response.json();
    
    console.log('Basescan API response:', data);
    
    if (data.status === '1' && data.result && data.result.length > 0) {
      console.log(`Found ${data.result.length} USDC transaction(s)`);
      
      // Check for transfers to the recipient address
      for (const tx of data.result) {
        if (tx.to.toLowerCase() === recipientAddress.toLowerCase()) {
          const transferAmount = BigInt(tx.value);
          const transferAmountInUSDC = Number(transferAmount) / 1000000;
          console.log(`Transfer found: ${transferAmountInUSDC} USDC to ${tx.to} (required: ${minimumAmount})`);
          
          if (transferAmount >= amountInWei) {
            console.log('Payment verified via Basescan!');
            return true;
          }
        }
      }
    } else {
      console.log('No USDC transfers found via Basescan');
    }
    
    return false;
  } catch (error) {
    console.error('Error checking USDC payment via Basescan:', error);
    return false;
  }
}
