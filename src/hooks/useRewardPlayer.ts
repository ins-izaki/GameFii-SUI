// src/hooks/useRewardPlayer.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import {
  useSignAndExecuteTransaction,
  useSuiClient,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import toast from "react-hot-toast";
import {
  PACKAGE_ID,
  GAME_VAULT_ID,
  ADMIN_CAP_ID,
  TREASURY_CAP_ID,
} from "../constants";

interface RewardPlayerArgs {
  recipient: string;
  score: number;
  amount: number;
}

export function useRewardPlayer() {
  const queryClient = useQueryClient();
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const mutation = useMutation({
    mutationKey: ["rewardPlayer"],
    mutationFn: async (args: RewardPlayerArgs) => {
      if (!currentAccount) {
        throw new Error("You must connect your wallet to reward a player.");
      }

      toast.loading("Preparing transaction...", { id: "reward-player" });

      const { recipient, score, amount } = args;
      const tx = new Transaction();

      const scaledAmount = BigInt(amount) * BigInt(10 ** 8);

      tx.moveCall({
        target: `${PACKAGE_ID}::suiflap_contract::reward_player`,
        arguments: [
          tx.object(ADMIN_CAP_ID),
          tx.object(TREASURY_CAP_ID),
          tx.object(GAME_VAULT_ID),
          // FIX: Specify 'address' type for the recipient
          tx.pure('address',recipient),
          // FIX: Specify 'u64' type for the score
          tx.pure('u64',score),
          // FIX: Specify 'u64' type for the amount
          tx.pure('u64',scaledAmount.toString()),
        ],
      });

      toast.loading("Waiting for your signature...", { id: "reward-player" });
      const { digest } = await signAndExecute({ transaction: tx });
      toast.loading("Executing transaction...", { id: "reward-player" });

      await suiClient.waitForTransaction({
        digest,
        options: { showEffects: true },
      });

      toast.success("Player rewarded successfully!", { id: "reward-player" });
    },
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: ['getScore', variables.recipient] });
      queryClient.refetchQueries({ queryKey: ['getBalance', variables.recipient] });
    },
    onError: (error) => {
      toast.error((error as Error).message, { id: "reward-player" });
    },
  });

  return mutation;
}