import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        // TODO: Update with your deployed contract address
        suiflapGame: "0x0",
        collectionId: "0x0",
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        // replacce with your deployed contract address
        suiflapGame:
          "0xf40d5d7c9c3a928641cba364f599a7abb4cd3643048893ffc1ceab5bf13d12b1",
        // replacce with your collection id
        collectionId:
          "",
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        // TODO: Update with your deployed contract address
        suiflapGame: "0x0",
        collectionId: "0x0",
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };