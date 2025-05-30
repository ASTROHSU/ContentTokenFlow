import { IStorage } from './storage';

// Base Sepolia USDC contract address
const USDC_CONTRACT_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const RECIPIENT_ADDRESS = '0x36F322fC85B24aB13263CFE9217B28f8E2b38381';

interface BaseScanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
}

export class BlockchainVerifier {
  private apiKey: string;
  private baseUrl = 'https://api-sepolia.basescan.org/api';

  constructor() {
    this.apiKey = process.env.BASESCAN_API_KEY || '44UA8ZHR9S6PIYAJ5TXN392SRZ89XC72Q8';
    if (!this.apiKey) {
      throw new Error('BASESCAN_API_KEY is required');
    }
  }

  /**
   * Query USDC transactions to the recipient address
   */
  async getUSDCTransactions(fromAddress?: string, startBlock = 0): Promise<BaseScanTransaction[]> {
    const params = new URLSearchParams({
      module: 'account',
      action: 'tokentx',
      contractaddress: USDC_CONTRACT_ADDRESS,
      address: RECIPIENT_ADDRESS,
      startblock: startBlock.toString(),
      endblock: '99999999',
      sort: 'desc',
      apikey: this.apiKey
    });

    if (fromAddress) {
      // If we want to filter by sender, we'll need to check the results
    }

    try {
      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json();

      if (data.status !== '1') {
        console.error('BaseScan API error:', data.message);
        return [];
      }

      let transactions = data.result || [];

      // Filter by sender if specified
      if (fromAddress) {
        transactions = transactions.filter((tx: BaseScanTransaction) => 
          tx.from.toLowerCase() === fromAddress.toLowerCase()
        );
      }

      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  /**
   * Verify if a payment record has corresponding blockchain transaction
   */
  async verifyPayment(walletAddress: string, amount: string, txHash?: string): Promise<boolean> {
    const transactions = await this.getUSDCTransactions(walletAddress);
    
    // Convert amount to wei (USDC has 6 decimals)
    const expectedAmountWei = Math.floor(parseFloat(amount) * 1000000).toString();

    return transactions.some(tx => {
      const matches = (
        tx.from.toLowerCase() === walletAddress.toLowerCase() &&
        tx.to.toLowerCase() === RECIPIENT_ADDRESS.toLowerCase() &&
        tx.value === expectedAmountWei
      );

      // If txHash is provided, also match that
      if (txHash && matches) {
        return tx.hash.toLowerCase() === txHash.toLowerCase();
      }

      return matches;
    });
  }

  /**
   * Enhanced article access check with blockchain verification
   */
  async checkArticleAccessWithBlockchain(
    storage: IStorage, 
    articleId: number, 
    walletAddress?: string
  ): Promise<boolean> {
    if (!walletAddress) return false;

    // First, check if user has payment record in database
    const hasDbRecord = await storage.checkArticleAccess(articleId, walletAddress);
    
    if (!hasDbRecord) return false;

    // Get the payment record details
    const payments = await storage.getPaymentsByWallet(walletAddress);
    const articlePayment = payments.find((p: any) => 
      p.articleId === articleId && p.status === 'completed'
    );

    if (!articlePayment) return false;

    // Verify against blockchain
    const isVerified = await this.verifyPayment(
      walletAddress, 
      articlePayment.amount, 
      articlePayment.txHash || undefined
    );

    return isVerified;
  }
}

export const blockchainVerifier = new BlockchainVerifier();