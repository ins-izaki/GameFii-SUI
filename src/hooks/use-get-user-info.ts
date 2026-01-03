// src/hooks/useGetUserInfo.ts
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui.js/client";
import { useState, useEffect, useCallback } from "react";
import { COIN_TYPE, SUI_NETWORK } from "../constants";

const suiClient = new SuiClient({ url: SUI_NETWORK });

export function useUserBalance() {
  const wallet = useCurrentAccount();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!wallet?.address) {
      setBalance(null);
      return;
    }

    setLoading(true);
    try {
      const balanceData = await suiClient.getBalance({
        owner: wallet.address,
        coinType: COIN_TYPE, // <-- It uses your SLAP token type here
      });
      // The contract specifies 8 decimals
      const formattedBalance = Number(BigInt(balanceData.totalBalance)) / 10 ** 8;
      setBalance(formattedBalance);
    } catch (err) {
      console.error("Error fetching balance:", err);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [wallet?.address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, refetch: fetchBalance };
}