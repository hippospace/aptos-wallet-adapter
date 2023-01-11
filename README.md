# Official adapter

Note that Aptos Labs has an official implementation of wallet adapter [here](https://github.com/aptos-labs/aptos-wallet-adapter).

# aptos-wallet-adapter

This is a mono-repo consist of the wallet adapter itself, a simple web app with essential functionalities to demonstrate the implementation of the wallet adapter and an e2e auto integration testers based on puppeteer.

## Packages

### [Aptos-wallet-adapter](https://github.com/hippospace/aptos-wallet-adapter/tree/main/packages/aptos-wallet-adapter)

React `WalletProvider` supporting loads of aptos wallets.

Supports:

- [Petra wallet](https://petra.app/)
- [Martian wallet](https://martianwallet.xyz/)
- [Fewcha wallet](https://fewcha.app/)
- [Pontem Wallet](https://pontem.network/pontem-wallet)
- [Spika wallet](https://spika.app)
- [Rise wallet](https://risewallet.io/)
- [HyperPay wallet](https://www.hyperpay.io/)
- [Fletch wallet](http://fletchwallet.io/)
- [Spika web wallet](https://spika.app)
- [Aptos snap](https://chrome.google.com/webstore/detail/metamask-flask-developmen/ljfoeinjpaedjfecbmggjgodbgkmjkjk)
- [Bitkeep wallet](https://bitkeep.com/)
- [TokenPocket wallet](https://tokenpocket.pro)
- [Blocto wallet](https://portto.com/download)
- [Nightly Wallet](https://nightly.app/download)
- [OpenBlock Wallet](https://openblock.com)
- [Spacecy wallet](https://spacecywallet.com/)
- [MSafe wallet](https://app.m-safe.io)

**Please refer to the readme within aptos-wallet-adapter pacakages**

### [Wallet-tester](https://github.com/hippospace/aptos-wallet-adapter/tree/main/packages/wallet-tester)

Simple create react app application demonstrates the essesntial functions of the adapters.

### [Wallet-nextjs](https://github.com/hippospace/aptos-wallet-adapter/tree/main/packages/wallet-nextjs)

Next JS implementation of the **wallet-tester** with the exact same functionalities demonstrated.

### [Auto-tester](https://github.com/hippospace/aptos-wallet-adapter/tree/main/packages/auto-tester)

Automatically testing suites based on puppeteer to run E2E integration tests against the **wallet-tester** or **wallet-nextjs**

### Wallets Functionalities Audit
| Wallet  | Support Network Change | Support Account Change       |
|---------|------------------------|------------------------------|
| Petra   | T                      | T                            |
| Martian | T                      | T                            |
| Pontem  | T                      | T                            |
| Rise    | T                      | T                            |
| Fewcha  | F                      | F                            |
| Coin98  | F(cannot test)         | F(cannot test)               |
| Blocto  | F(cannot test)         | F(cannot test)               |
| BitKeep | F                      | F                            |
| Spacecy | T                      | T                            |
| MSafe   | T(cannot test)         | T(cannot test)               |
