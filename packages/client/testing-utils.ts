import { chains } from '@lens-network/sdk/viem';
import { evmAddress } from '@lens-protocol/types';
import { http, type Account, type Transport, type WalletClient, createWalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { PublicClient, testnet } from './src';

const pk = privateKeyToAccount(import.meta.env.PRIVATE_KEY);
const account = evmAddress(import.meta.env.TEST_ACCOUNT);
const app = evmAddress(import.meta.env.TEST_APP);

export const signer = evmAddress(pk.address);

export function loginAsAccountOwner() {
  const client = PublicClient.create({
    environment: testnet,
    origin: 'http://example.com',
  });

  return client.login({
    accountOwner: {
      account,
      owner: signer,
      app,
    },
    signMessage: (message) => pk.signMessage({ message }),
  });
}

export function loginAsOnboardingUser() {
  const client = PublicClient.create({
    environment: testnet,
    origin: 'http://example.com',
  });

  return client.login({
    onboardingUser: {
      wallet: signer,
      app,
    },
    signMessage: (message) => pk.signMessage({ message }),
  });
}

export function signerWallet(): WalletClient<Transport, chains.LensNetworkChain, Account> {
  return createWalletClient({
    account: privateKeyToAccount(import.meta.env.PRIVATE_KEY),
    chain: chains.testnet,
    transport: http(),
  });
}
