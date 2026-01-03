// src/hooks/useUserScore.ts
import { useState, useEffect, useCallback } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import {
  PACKAGE_ID,
  GAME_VAULT_ID,
} from '../constants';

export function useUserScore() {
  // 1. Get the current account and suiClient instance from Dapp Kit
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  // 2. Manage state manually with useState
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3. Define the function to fetch the data
  const fetchScore = useCallback(async () => {
    // Don't fetch if the user isn't connected
    if (!currentAccount) {
      setScore(0); // Default to 0 if not connected
      return;
    }

    setLoading(true);
    setError(null);

    try {
        // @ts-ignore
      const response = await suiClient.moveCall({
        target: `${PACKAGE_ID}::suiflap_contract::get_score`,
        arguments: [GAME_VAULT_ID, currentAccount.address],
      });

      // @ts-ignore
      if (response.results && response.results.length > 0) {
        // Parse the raw byte array into a number
        const rawScoreData = response.results[0].returnValues[0];
        const dataView = new DataView(new Uint8Array(rawScoreData).buffer);
        const finalScore = Number(dataView.getBigUint64(0, true)); // true for little-endian
        setScore(finalScore);
      } else {
        setScore(0); // Set score to 0 if there's no return value
      }
    } catch (e) {
      console.error("Failed to fetch score:", e);
      setError("Failed to fetch score.");
      setScore(0);
    } finally {
      setLoading(false);
    }
  }, [currentAccount, suiClient]); // Dependencies for the fetch function

  // 4. Use useEffect to call the fetch function when the component mounts
  // or when the user's address changes.
  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  // 5. Return the state and a function to allow manual refetching
  return { score, loading, error, refetch: fetchScore };
}