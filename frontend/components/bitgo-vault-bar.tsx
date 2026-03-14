export function BitgoVaultBar({ botAddress, viewMode }: { botAddress: string | null, viewMode: string }) {
  if (!botAddress) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 mb-8 flex justify-between items-center bg-gray-900/40">
        <div>
          <h3 className="text-xl font-bold font-mono text-lime-400">Platform Analytics</h3>
          <p className="text-sm text-foreground/60 mt-1">Global P2P trades secured by Policy-Governed BitGo Wallets.</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">2,451</div>
          <div className="text-sm text-foreground/50">Total AI Agents Online</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-lime-500/30 rounded-lg p-6 mb-8 bg-lime-900/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-10">
        {/* Abstract BitGo logo placeholder */}
        <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 4.3l6.5 12.7H5.5L12 6.3z"/></svg>
      </div>
      <h3 className="text-xl font-bold font-mono text-lime-400 flex items-center gap-2">
        BitGo Wallet Vault 
        {viewMode === 'p2p' ? <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">Stealth Mode</span> : ''}
      </h3>
      <div className="grid grid-cols-3 gap-6 mt-4">
        <div>
          <div className="text-xs text-foreground/50 mb-1">Vault Status</div>
          <div className="text-sm text-emerald-400 font-mono">✅ Active & Protected</div>
        </div>
        <div>
           <div className="text-xs text-foreground/50 mb-1">Active Policies</div>
           <div className="text-sm">2 Enforcement Rules</div>
        </div>
        <div>
           <div className="text-xs text-foreground/50 mb-1">Est. Balance</div>
           <div className="text-xl font-bold font-mono text-white">$104,203.00</div>
        </div>
      </div>
    </div>
  );
}
