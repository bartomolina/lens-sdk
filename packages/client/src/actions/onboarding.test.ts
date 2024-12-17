import { account } from '@lens-protocol/metadata';
import { assertOk, never } from '@lens-protocol/types';
import { describe, expect, it } from 'vitest';

import { type Account, Role } from '@lens-protocol/graphql';
import { uri } from '@lens-protocol/types';
import { loginAsOnboardingUser, signer, signerWallet } from '../../testing-utils';
import { handleWith } from '../viem';
import { createAccountWithUsername, fetchAccount } from './account';

const walletClient = signerWallet();
const metadata = account({
  name: 'John Doe',
  bio: 'A test account',
});

describe('Given an onboarding user', () => {
  describe('When switching to the newly created account', () => {
    it.skip('Then it should be authenticated', { timeout: 60000 }, async () => {
      let newAccount: Account | null = null;

      // Login as onboarding user
      const sessionClient = await loginAsOnboardingUser()
        .andThen((sessionClient) =>
          // Create an account with username
          createAccountWithUsername(sessionClient, {
            username: { localName: `testname${Date.now()}` },
            metadataUri: uri(`data:application/json,${JSON.stringify(metadata)}`),
          })
            // Sign if necessary
            .andThen(handleWith(walletClient))

            // Wait for the transaction to be mined
            .andThen(sessionClient.waitForTransaction)

            // Fetch the account
            .andThen((txHash) => fetchAccount(sessionClient, { txHash }))

            .andTee((account) => {
              newAccount = account ?? never('Account not found');
            })

            // Switch to the newly created account
            .andThen((account) =>
              sessionClient.switchAccount({
                account: account?.address ?? never('Account not found'),
              }),
            ),
        )
        .match(
          (value) => value,
          (error) => {
            throw error;
          },
        );

      const user = await sessionClient.getAuthenticatedUser();
      assertOk(user);

      expect(user.value).toMatchObject({
        role: Role.AccountOwner,
        account: newAccount!.address.toLowerCase(),
        owner: signer.toLowerCase(),
      });
    });
  });
});
