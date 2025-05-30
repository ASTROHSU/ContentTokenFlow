import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WagmiProvider } from 'wagmi';
import { wagmiAdapter } from './lib/wagmi';
import { ReownWalletProvider } from "@/components/wallet-provider-reown";
import Home from "@/pages/home";
import Article from "@/pages/article";
import Dashboard from "@/pages/dashboard";
import Creator from "@/pages/creator";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/article/:id" component={Article} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/creator" component={Creator} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ReownWalletProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ReownWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
