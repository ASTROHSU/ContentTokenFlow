import { blockchainVerifier } from './blockchain-verifier';

async function syncWithBlockchain() {
  try {
    console.log('Fetching USDC transactions from blockchain...');
    
    // Get all USDC transactions to the recipient address
    const transactions = await blockchainVerifier.getUSDCTransactions();
    
    console.log(`Total USDC transactions found: ${transactions.length}`);
    
    // Filter for 1.5 USDC payments (1500000 in wei, USDC has 6 decimals)
    const validPayments = transactions.filter(tx => tx.value === '1500000');
    
    console.log(`Valid 1.5 USDC payments: ${validPayments.length}`);
    
    // Get unique paying addresses (excluding creator)
    const uniquePayingAddresses = new Set(
      validPayments
        .map(tx => tx.from.toLowerCase())
        .filter(addr => addr !== '0x36f322fc85b24ab13263cfe9217b28f8e2b38381')
    );
    
    console.log(`Unique paying users (excluding creator): ${uniquePayingAddresses.size}`);
    console.log('Paying addresses:', Array.from(uniquePayingAddresses));
    
    const stats = {
      totalPayments: validPayments.filter(tx => 
        tx.from.toLowerCase() !== '0x36f322fc85b24ab13263cfe9217b28f8e2b38381'
      ).length,
      totalUSDC: (validPayments.filter(tx => 
        tx.from.toLowerCase() !== '0x36f322fc85b24ab13263cfe9217b28f8e2b38381'
      ).length * 1.5).toFixed(6),
      activeAgents: uniquePayingAddresses.size,
      totalArticles: 1
    };
    
    console.log('Blockchain-verified stats:', stats);
    
    return stats;
  } catch (error) {
    console.error('Error syncing with blockchain:', error);
    throw error;
  }
}

// Run the sync
syncWithBlockchain()
  .then(stats => {
    console.log('Sync completed successfully:', stats);
    process.exit(0);
  })
  .catch(error => {
    console.error('Sync failed:', error);
    process.exit(1);
  });