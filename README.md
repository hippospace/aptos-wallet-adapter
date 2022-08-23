# aptos-wallet-adapter

This is a mono-repo consist of the wallet adapter itself, a simple web app with essential functionalities to demonstrate the implementation of the wallet adapter and an e2e auto integration testers based on puppeteer.

## Packages

### aptos-wallet-adapter

React `WalletProvider` supporting loads of aptos wallets.

Supports:

- [Aptos official wallet](https://github.com/aptos-labs/aptos-core/releases/tag/wallet-v0.1.1)
- [Martian wallet](https://martianwallet.xyz/)
- [Fewcha wallet](https://fewcha.app/)
- [Hippo wallet](https://github.com/hippospace/hippo-wallet)
- [Hippo web wallet](https://hippo-wallet-test.web.app/)
- [Pontem Wallet](https://pontem.network/pontem-wallet)

**Please refer to the readme within aptos-wallet-adapter pacakages**

### wallet-tester

Simple create react app application demonstrates the essesntial functions of the adapters.

### wallet-nextjs

Next JS implementation of the **wallet-tester** with the exact same functionalities demonstrated.

### auto-tester

Automatically testing suites based on puppeteer to run E2E integration tests against the **wallet-tester** or **wallet-nextjs**
