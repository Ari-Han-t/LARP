"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function SettingsClient({ provider, isConnected }: { provider: string, isConnected: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    // signIn handles the redirect to the provider
    await signIn(provider, { callbackUrl: '/dashboard/settings' });
  };

  if (isConnected) {
    return (
      <button 
        disabled
        className="px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg font-medium border border-neutral-200"
      >
        Connected
      </button>
    );
  }

  return (
    <button 
      onClick={handleConnect}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Connect Account
    </button>
  );
}
