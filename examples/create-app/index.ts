import 'viem/window';

import { chains } from '@lens-network/sdk/viem';
import { PublicClient, testnet as protocolTestnet } from '@lens-protocol/client';
import { createApp, fetchApp } from '@lens-protocol/client/actions';
import { handleWith } from '@lens-protocol/client/viem';
import { Platform, app } from '@lens-protocol/metadata';
import { StorageClient, testnet as storageTestnet } from '@lens-protocol/storage-node-client';
import { type Address, createWalletClient, custom } from 'viem';

const chain = chains.testnet;

// hoist account
const [address] = (await window.ethereum!.request({ method: 'eth_requestAccounts' })) as [Address];

const walletClient = createWalletClient({
  account: address,
  chain,
  transport: custom(window.ethereum!),
});

const client = PublicClient.create({
  environment: protocolTestnet,
});

const sessionClient = await client
  .login({
    builder: {
      address: walletClient.account.address,
    },
    signMessage: async (message) => walletClient.signMessage({ message }),
  })
  .match(
    (result) => result,
    (error) => {
      throw error;
    },
  );

const storageClient = StorageClient.create(storageTestnet);

const metadata = app({
  name: 'My App',
  url: 'https://example.com',
  description: 'My app description',
  platforms: [Platform.WEB],
  developer: 'me@example.com',
});

const { uri } = await storageClient.uploadAsJson(metadata);

const created = await createApp(sessionClient, {
  metadataUri: uri,
  verification: false, // will become optional soon
})
  .andThen(handleWith(walletClient))
  .andThen(sessionClient.waitForTransaction)
  .andThen((txHash) => fetchApp(sessionClient, { txHash }))
  .match(
    (result) => result,
    (error) => {
      throw error;
    },
  );

export default [`<h2>${created?.metadata?.name}</h2>`, `<p>Address: ${await created?.address}</p>`];
