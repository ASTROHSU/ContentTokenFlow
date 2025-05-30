import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { baseSepolia } from 'viem/chains'

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = '7ffef3652004d8473b8bad24baf75848'

// 2. Set up Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [baseSepolia]
})

// 3. Create the modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [baseSepolia],
  projectId,
  metadata: {
    name: '區塊勢 for AI',
    description: '說鬼話的區塊鏈內容',
    url: 'https://mywebsite.com',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  }
})

export { wagmiAdapter }