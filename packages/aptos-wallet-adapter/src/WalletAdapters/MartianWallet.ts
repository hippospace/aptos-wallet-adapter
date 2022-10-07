import { MaybeHexString, Types } from 'aptos';
import {
  WalletAccountChangeError,
  WalletDisconnectionError,
  WalletGetNetworkError,
  WalletNetworkChangeError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletSignAndSubmitMessageError,
  WalletSignMessageError,
  WalletSignTransactionError
} from '../WalletProviders/errors';
import {
  AccountKeys,
  BaseWalletAdapter,
  NetworkInfo,
  scopePollingDetectionStrategy,
  SignMessagePayload,
  SignMessageResponse,
  WalletAdapterNetwork,
  WalletName,
  WalletReadyState
} from './BaseAdapter';

interface ConnectMartianAccount {
  address: MaybeHexString;
  method: string;
  publicKey: MaybeHexString;
  status: number;
}

interface MartianAccount {
  address: MaybeHexString;
  publicKey: MaybeHexString;
  authKey: MaybeHexString;
  isConnected: boolean;
}
interface IMartianWallet {
  connect: () => Promise<ConnectMartianAccount>;
  account(): Promise<MartianAccount>;
  isConnected(): Promise<boolean>;
  generateTransaction(sender: MaybeHexString, payload: any, options?: any): Promise<any>;
  signAndSubmitTransaction(transaction: Types.TransactionPayload): Promise<Types.HexEncodedBytes>;
  signTransaction(transaction: Types.TransactionPayload): Promise<Uint8Array>;
  signMessage(message: SignMessagePayload): Promise<SignMessageResponse>;
  disconnect(): Promise<void>;
  getChainId(): Promise<{ chainId: number }>;
  network(): Promise<WalletAdapterNetwork>;
  onAccountChange: (listenr: (newAddress: string) => void) => void;
  onNetworkChange: (listenr: (network: string) => void) => void;
}

interface MartianWindow extends Window {
  martian?: IMartianWallet;
}

declare const window: MartianWindow;

export const MartianWalletName = 'Martian' as WalletName<'Martian'>;

export interface MartianWalletAdapterConfig {
  provider?: IMartianWallet;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class MartianWalletAdapter extends BaseWalletAdapter {
  name = MartianWalletName;

  url = 'https://chrome.google.com/webstore/detail/martian-wallet/efbglgofoippbgcjepnhiblaibcnclgk';

  icon =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUyIiBoZWlnaHQ9IjM1MiIgdmlld0JveD0iMCAwIDM1MiAzNTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNTIiIGhlaWdodD0iMzUyIiByeD0iODciIGZpbGw9IiMxRjFGMUYiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNjkuNzAxIDg5LjA4NDFDMTU5LjUwOCA4OS44MzA5IDE1MC41NDcgOTIuMDAxNCAxNDEuMDc2IDk2LjAxNjlDMTM5LjQyNCA5Ni43MTc0IDEzMy43MDIgOTkuNjAzNyAxMzIuMTE2IDEwMC41MzdDMTI4LjEzMSAxMDIuODgxIDEyMy4wNDMgMTA2LjQ5NiAxMTkuNTg2IDEwOS40NEMxMTYuOTc1IDExMS42NjUgMTExLjIxNiAxMTcuNDUyIDEwOS4yMDIgMTE5Ljg3NkMxMDUuMDg1IDEyNC44MzIgMTAxLjA4OCAxMzAuODg2IDk4LjQzODQgMTM2LjE3OUM5Ny45OTQyIDEzNy4wNjYgOTcuNTYzNSAxMzcuODE3IDk3LjQ4MTMgMTM3Ljg0OEM5Ny4zOTkzIDEzNy44OCA5Ny4zMzIgMTM3Ljk5NSA5Ny4zMzIgMTM4LjEwNUM5Ny4zMzIgMTM4LjIxNCA5Ni43Njg1IDEzOS42MDggOTYuMDc5NiAxNDEuMkM5NC42OTc1IDE0NC4zOTYgOTIuOTE3NiAxNDkuNDk2IDkxLjk5MjUgMTUyLjkwOUM4OS42MjY3IDE2MS42NCA4OC41NDA3IDE3Mi40OTUgODkuMTgxMSAxODEuMDExQzkwLjM4ODggMTk3LjA3MSA5NS4xODY2IDIxMS4xMiAxMDMuODUzIDIyMy45NzVDMTEwLjE0NyAyMzMuMzExIDExOC4zMzYgMjQxLjQxMyAxMjcuOTk1IDI0Ny44NjFDMTM4LjkzNiAyNTUuMTYzIDE1MS45NzEgMjU5LjkxIDE2NS41MzIgMjYxLjUyOUMxNjkuMjQ3IDI2MS45NzIgMTc3LjczMSAyNjIuMTQ2IDE4MS43NjIgMjYxLjg2MUMxOTguMDkzIDI2MC43MDYgMjEzLjYxNiAyNTQuOTk0IDIyNi43OCAyNDUuMjk3QzI0NC4wODIgMjMyLjU1MiAyNTYuMDc2IDIxMy43OTcgMjYwLjMzMiAxOTIuODM0QzI2MS42MDEgMTg2LjU4MiAyNjIuMDA2IDE4Mi4zNTUgMjYyIDE3NS40MDdDMjYxLjk5NiAxNzAuMzM3IDI2MS45NDYgMTY5LjI5NSAyNjEuNTQxIDE2NS44MjlDMjU5LjcwNSAxNTAuMTQyIDI1NC4wNTkgMTM1Ljg4OCAyNDQuNzgzIDEyMy41MjdDMjM4LjkwMyAxMTUuNjg5IDIzMC45OTIgMTA4LjI0OCAyMjMuMDk4IDEwMy4xMjlDMjE4LjQ4NSAxMDAuMTM2IDIxNi4xNzggOTguODU1NSAyMTEuNjYxIDk2Ljc3NzRDMjAyLjMzOCA5Mi40ODc5IDE5Mi4zNzYgODkuOTA5MSAxODIuMTg3IDg5LjE0NzlDMTgwLjA0MiA4OC45ODc2IDE3MS42MDYgODguOTQ0NSAxNjkuNzAxIDg5LjA4NDFaTTE4My4wMjUgMTAzLjY1N0MxODkuNTAzIDEwNC4zNDggMTk2LjI4NCAxMDYuMDM0IDIwMi4zNiAxMDguNDY0TDIwNC4zNTYgMTA5LjI2MkwyMDQuMzU2IDExMC44MjJDMjA0LjM1NyAxMTYuODk2IDIwMC4zNDQgMTIyLjMwNyAxOTQuMzMzIDEyNC4zMzRMMTkyLjcyIDEyNC44NzhMMTczLjUyMyAxMjQuOTg3QzE1NS4yODkgMTI1LjA5IDE1MS45OTQgMTI1LjE3NSAxNDcuNjE2IDEyNS42NTdDMTM3LjY3NiAxMjYuNzUyIDEyOS44NzIgMTI4LjI2NSAxMjEuMzAyIDEzMC43NjFDMTIwLjA1IDEzMS4xMjUgMTE4LjkxNyAxMzEuNDI0IDExOC43ODUgMTMxLjQyNEMxMTguNDY0IDEzMS40MjQgMTE4LjkwOSAxMzAuNzkxIDEyMC43NTIgMTI4LjYyMkMxMjQuNDgzIDEyNC4yMzMgMTMwLjczMiAxMTguNTk4IDEzNC43MDYgMTE2LjA0MUMxMzUuMTI2IDExNS43NyAxMzUuNTA4IDExNS41MDkgMTM1LjU1NSAxMTUuNDZDMTM1LjYwMiAxMTUuNDExIDEzNi4yNTEgMTE0Ljk3OSAxMzYuOTk5IDExNC41MDFDMTQyLjI2MyAxMTEuMTMxIDE0OC4wMzYgMTA4LjQ0MSAxNTQuMDcyIDEwNi41NDNDMTU5LjY1OCAxMDQuNzg3IDE2NC44MTQgMTAzLjg3MiAxNzIuMTY0IDEwMy4zMzFDMTczLjg3NCAxMDMuMjA2IDE4MC43MjMgMTAzLjQxMSAxODMuMDI1IDEwMy42NTdaTTIxOS4xMzMgMTE4LjAyMkMyMjIuNzUxIDEyMC43NzkgMjI5LjQ5OSAxMjcuMTM2IDIyOS40OTkgMTI3Ljc4N0MyMjkuNDk5IDEyOC42MDYgMjI2Ljc1IDEzMy40OTMgMjI0Ljc4NCAxMzYuMTY4QzIxOC4wMzIgMTQ1LjM1NSAyMDcuOTIxIDE1MS41NTYgMTk2Ljc5NyAxNTMuMzMyQzE5My45NDUgMTUzLjc4OCAxOTEuOTk0IDE1My44MzUgMTc1LjczMiAxNTMuODQ1QzE1NS4zOTYgMTUzLjg1NyAxNTIuNTc3IDE1My45NjYgMTQ1LjA2OCAxNTUuMDI4QzEzMS4xNjkgMTU2Ljk5NCAxMTguMDA0IDE2MS4zODUgMTA1Ljc3IDE2OC4xMzdDMTA0Ljc1NyAxNjguNjk1IDEwMy44ODUgMTY5LjEwOCAxMDMuODMxIDE2OS4wNTRDMTAzLjY1IDE2OC44NzMgMTA0LjMxMyAxNjMuOTY5IDEwNC44OTUgMTYxLjE4MkMxMDUuNTE0IDE1OC4yMTggMTA2LjU0MiAxNTQuNDE0IDEwNy4zMTEgMTUyLjI0N0wxMDcuNzg2IDE1MC45MDlMMTA5LjQ4MSAxNTAuMTU2QzEyMC45OTQgMTQ1LjA0MiAxMzQuODA4IDE0MS4zODIgMTQ3LjQ0NyAxNDAuMDk3QzE1NC4yNTggMTM5LjQwNSAxNTUuMTY2IDEzOS4zNzggMTczLjk0OCAxMzkuMzA0QzE4NC45MTIgMTM5LjI2MSAxOTMuMTE2IDEzOS4xNiAxOTMuOTMgMTM5LjA2QzE5NS4yOCAxMzguODkyIDE5Ny44NDYgMTM4LjI4NyAxOTkuNDEgMTM3Ljc2NkMxOTkuODQxIDEzNy42MjIgMjAxLjE4OCAxMzcuMDI1IDIwMi40MDMgMTM2LjQzOUMyMDkuNTU2IDEzMi45ODcgMjE0LjkxIDEyNi43OTggMjE3LjM1OCAxMTkuMTU0QzIxNy43OTIgMTE3Ljc5OCAyMTguMDU3IDExNy4yMDQgMjE4LjE4NCAxMTcuM0MyMTguMjg3IDExNy4zNzggMjE4LjcxNCAxMTcuNzAzIDIxOS4xMzMgMTE4LjAyMlpNMjM5LjM5OSAxNDEuODI1QzI0MC42NzggMTQ0LjAyMyAyNDIuODA1IDE0OS4xNjMgMjQ0LjA5MSAxNTMuMTZDMjQ1LjE0MSAxNTYuNDI2IDI0NS4yMTggMTU2LjgxOCAyNDQuODk5IDE1Ny4zMDVDMjQ0LjQ1MyAxNTcuOTg1IDIzOC45OTEgMTYzLjUxMSAyMzcuMzc3IDE2NC45MTZDMjI5LjUxNCAxNzEuNzU2IDIyMC4yNTIgMTc2Ljg4MiAyMTAuNTc1IDE3OS43NUMyMDUuNzczIDE4MS4xNzMgMjAxLjM0NCAxODIuMDAxIDE5NS42MjMgMTgyLjU0NkMxOTQuNjk4IDE4Mi42MzQgMTg1Ljk0NSAxODIuNzE2IDE3Ni4xNzIgMTgyLjcyOUMxNTUuMDkgMTgyLjc1NSAxNTMuODA5IDE4Mi44MTEgMTQ2LjU5NyAxODQuMDAxQzEzMy44MDkgMTg2LjExMiAxMjAuNjg1IDE5MS43MDYgMTEwLjA5NCAxOTkuNTZDMTA5LjIwNSAyMDAuMjE5IDEwOC4zNjggMjAwLjc2NyAxMDguMjM1IDIwMC43NzdDMTA3Ljk1NCAyMDAuNzk4IDEwNy4zODIgMTk5LjIxOCAxMDYuMjQ0IDE5NS4yNzZDMTA1LjQyOSAxOTIuNDUyIDEwNC4yNDggMTg2LjgxNCAxMDQuMzMxIDE4Ni4xNEMxMDQuMzcxIDE4NS44MTkgMTA0Ljg5NyAxODUuNDAxIDEwNi43NiAxODQuMjExQzExNy42NTkgMTc3LjI0NiAxMjkuNDk5IDE3Mi40ODcgMTQxLjkyNSAxNzAuMDc1QzE0NS4zODMgMTY5LjQwNCAxNDUuOTMxIDE2OS4zMjIgMTQ5Ljk5NSAxNjguODY1QzE1NSAxNjguMzAyIDE1Ni42NjQgMTY4LjI2MSAxNzcuMDA2IDE2OC4yMDVDMTk1LjY3MiAxNjguMTUzIDE5NS44ODMgMTY4LjE0NCAyMDAuODc0IDE2Ny4xNzRDMjA4LjYzNiAxNjUuNjY3IDIxNi4yMDcgMTYyLjQ3MyAyMjIuNjI4IDE1Ny45OThDMjI4LjUzMyAxNTMuODgyIDIzNC40MDMgMTQ3Ljg5MiAyMzcuOTcgMTQyLjM0QzIzOC40MDMgMTQxLjY2NiAyMzguODA3IDE0MS4xMTIgMjM4Ljg2OCAxNDEuMTA5QzIzOC45MjkgMTQxLjEwNiAyMzkuMTY4IDE0MS40MjggMjM5LjM5OSAxNDEuODI1Wk0yNDcuNjc1IDE3Ni44MDhDMjQ3LjY3MiAxODEuNTQ5IDI0Ni43NTUgMTg4LjE3NyAyNDUuMzU5IDE5My41MzNDMjQ0Ljk1NyAxOTUuMDc3IDI0NC44NDcgMTk1LjMwOCAyNDQuMzggMTk1LjU5QzI0NC4wOSAxOTUuNzY2IDI0My4zMTggMTk2LjIzOCAyNDIuNjY0IDE5Ni42NDFDMjMwLjUzNCAyMDQuMTA4IDIxNi40MTUgMjA5LjEzNyAyMDMuMTIxIDIxMC43MjVDMjAxLjUxMSAyMTAuOTE3IDE5OS41NDQgMjExLjE2MyAxOTguNzUgMjExLjI3MUMxOTcuNzcgMjExLjQwNCAxOTAuNzU0IDIxMS41MDcgMTc2LjkyMSAyMTEuNTkxQzE2NS43MDkgMjExLjY1OCAxNTYuMzA2IDIxMS43NTYgMTU2LjAyNSAyMTEuODA3QzE1NS43NDUgMjExLjg1OSAxNTQuNzkgMjExLjk4OSAxNTMuOTAyIDIxMi4wOTdDMTQzLjc3MiAyMTMuMzI1IDEzMy4yMDggMjE3Ljg1OSAxMjUuMTU2IDIyNC40MzRDMTI0LjQzNiAyMjUuMDIyIDEyMy43NzIgMjI1LjUwMyAxMjMuNjggMjI1LjUwM0MxMjMuMTkxIDIyNS41MDMgMTE4LjA5MiAyMTkuMjc5IDExNS44OSAyMTUuOTk0QzExNC45NDQgMjE0LjU4MiAxMTQuNzM2IDIxNC4xNjEgMTE0Ljg5IDIxMy45NzJDMTE1LjIyNyAyMTMuNTU4IDExOS40MjggMjEwLjM5MSAxMjEuMiAyMDkuMjE1QzEyNy40NDEgMjA1LjA3NCAxMzQuMTA1IDIwMS45NjQgMTQwLjk5MSAxOTkuOThDMTQ1LjAwMyAxOTguODI0IDE0Ny45NDkgMTk4LjIyNyAxNTMuMDM3IDE5Ny41NDJDMTU1LjMzMiAxOTcuMjMzIDE1OC42NjcgMTk3LjE3NSAxODAuMTQ4IDE5Ny4wNzJDMTk1Ljg1OCAxOTYuOTk2IDE5Ny4xMiAxOTYuOTQ2IDIwMi4zMTggMTk2LjE5N0MyMTQuNzAxIDE5NC40MTIgMjI2LjYyNyAxODkuODU3IDIzNy4zOTggMTgyLjc5N0MyMzkuNTQ4IDE4MS4zODggMjQzLjcxMiAxNzguMjU2IDI0NS43MjIgMTc2LjUzNUMyNDYuNjU2IDE3NS43MzUgMjQ3LjQ3OCAxNzUuMDc4IDI0Ny41NDggMTc1LjA3NEMyNDcuNjE4IDE3NS4wNyAyNDcuNjc1IDE3NS44NSAyNDcuNjc1IDE3Ni44MDhaTTIzNC40MjUgMjE3LjEyOUMyMzQuNDI1IDIxNy4yOTQgMjMyLjIxOCAyMjAuMTc1IDIzMC42MTYgMjIyLjEwMkMyMjguODg1IDIyNC4xODUgMjIzLjkyOSAyMjkuMTM0IDIyMS44NjYgMjMwLjg0MUMyMTAuMzQ3IDI0MC4zNzEgMTk3LjE0MSAyNDUuOTA2IDE4Mi4yNzIgMjQ3LjQzNUMxNzkuMjIyIDI0Ny43NDggMTcxLjA4OSAyNDcuNjk4IDE2OC4xMDQgMjQ3LjM0NkMxNjAuNTU1IDI0Ni40NTggMTUzLjk3MiAyNDQuNzYzIDE0Ny40NDcgMjQyLjAyOEMxNDUuOTEzIDI0MS4zODUgMTQxLjgxNCAyMzkuMzc5IDE0MC41MDMgMjM4LjYyOUMxMzcuODA3IDIzNy4wODkgMTM0Ljg3MyAyMzUuMjExIDEzNC44NzggMjM1LjAzMUMxMzQuODg4IDIzNC42ODQgMTM5LjY4MSAyMzEuNjU0IDE0Mi4xOTUgMjMwLjQwN0MxNDYuMDU3IDIyOC40OSAxNDkuNDU3IDIyNy4zOTcgMTU0LjM5IDIyNi40ODdDMTU2LjMxMiAyMjYuMTMyIDE1Ni45MTEgMjI2LjExOSAxNzYuNDExIDIyNi4wMDFDMTg3LjQzNiAyMjUuOTM0IDE5Ni44MDEgMjI1LjgzNSAxOTcuMjIxIDIyNS43OEMxOTcuNjQyIDIyNS43MjUgMTk5LjAxOCAyMjUuNTk3IDIwMC4yNzkgMjI1LjQ5NEMyMDUuMTI2IDIyNS4xIDIxMS44NDMgMjIzLjk3NiAyMTYuOTU5IDIyMi43MDRDMjE5LjYzOSAyMjIuMDM4IDIyNC4xNTggMjIwLjc5NCAyMjQuNjU3IDIyMC41ODZDMjI0Ljg0NCAyMjAuNTA4IDIyNi4wMjkgMjIwLjA5MiAyMjcuMjkgMjE5LjY2MkMyMjguNTUxIDIxOS4yMzEgMjMwLjYxNSAyMTguNDY2IDIzMS44NzcgMjE3Ljk2MUMyMzQuMzIzIDIxNi45ODIgMjM0LjQyNSAyMTYuOTQ5IDIzNC40MjUgMjE3LjEyOVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';

  protected _provider: IMartianWallet | undefined;

  protected _network: WalletAdapterNetwork;

  protected _chainId: string;

  protected _api: string;

  protected _timeout: number;

  protected _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  protected _connecting: boolean;

  protected _wallet: MartianAccount | null;

  constructor({
    // provider,
    // network = WalletAdapterNetwork.Testnet,
    timeout = 10000
  }: MartianWalletAdapterConfig = {}) {
    super();

    this._provider = typeof window !== 'undefined' ? window.martian : undefined;
    this._network = undefined;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (typeof window !== 'undefined' && this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.martian) {
          this._readyState = WalletReadyState.Installed;
          this.emit('readyStateChange', this._readyState);
          return true;
        }
        return false;
      });
    }
  }

  get publicAccount(): AccountKeys {
    return {
      publicKey: this._wallet?.publicKey || null,
      address: this._wallet?.address || null,
      authKey: this._wallet?.authKey || null
    };
  }

  get network(): NetworkInfo {
    return {
      name: this._network,
      api: this._api,
      chainId: this._chainId
    };
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get connected(): boolean {
    return !!this._wallet?.isConnected;
  }

  get readyState(): WalletReadyState {
    return this._readyState;
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (
        !(
          this._readyState === WalletReadyState.Loadable ||
          this._readyState === WalletReadyState.Installed
        )
      )
        throw new WalletNotReadyError();
      this._connecting = true;

      const provider = this._provider || window.martian;
      const isConnected = await provider?.isConnected();
      if (isConnected) {
        await provider?.disconnect();
      }
      const response = await provider?.connect();

      if (!response) {
        throw new WalletNotConnectedError('No connect response');
      }

      const walletAccount = await provider?.account();
      if (walletAccount) {
        this._wallet = {
          ...walletAccount,
          isConnected: true
        };

        try {
          const name = await provider?.network();
          const { chainId } = await provider?.getChainId();
          const api = null;

          this._network = name;
          this._chainId = chainId.toString();
          this._api = api;
        } catch (error: any) {
          const errMsg = error.message;
          this.emit('error', new WalletGetNetworkError(errMsg));
          throw error;
        }
      }
      this.emit('connect', this._wallet?.address || '');
    } catch (error: any) {
      this.emit('error', new Error(error));
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet;
    const provider = this._provider || window.martian;
    if (wallet) {
      this._wallet = null;

      try {
        await provider?.disconnect();
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      }
    }

    this.emit('disconnect');
  }

  async signTransaction(
    transactionPyld: Types.TransactionPayload,
    options?: any
  ): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.martian;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const tx = await provider.generateTransaction(wallet.address || '', transactionPyld, options);
      if (!tx) throw new Error('Cannot generate transaction');
      const response = await provider?.signTransaction(tx);

      if (!response) {
        throw new Error('No response');
      }
      return response;
    } catch (error: any) {
      this.emit('error', new WalletSignTransactionError(error));
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transactionPyld: Types.TransactionPayload,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.martian;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const tx = await provider.generateTransaction(wallet.address || '', transactionPyld, options);
      if (!tx) throw new Error('Cannot generate transaction');
      const response = await provider?.signAndSubmitTransaction(tx);

      if (!response) {
        throw new Error('No response');
      }
      return { hash: response };
    } catch (error: any) {
      this.emit('error', new WalletSignAndSubmitMessageError(error));
      throw error;
    }
  }

  async signMessage(msgPayload: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.martian;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      if (typeof msgPayload !== 'object' || !msgPayload.nonce) {
        throw new WalletSignMessageError('Invalid signMessage Payload');
      }
      const response = await provider?.signMessage(msgPayload);
      if (response) {
        return response;
      } else {
        throw new Error('Sign Message failed');
      }
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletSignMessageError(errMsg));
      throw error;
    }
  }

  async onAccountChange(): Promise<void> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.martian;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      await provider?.onAccountChange((newAccount: string) => {
        console.log('account Changed >>>', newAccount);
        this._wallet = {
          ...this._wallet,
          address: newAccount
        };
        this.emit('accountChange', newAccount);
      });
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletAccountChangeError(errMsg));
      throw error;
    }
  }

  async onNetworkChange(): Promise<void> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.martian;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const handleNetworkChange = async (newNetwork: WalletAdapterNetwork) => {
        console.log('network Changed >>>', newNetwork);
        this._network = newNetwork;
        this.emit('networkChange', this._network);
      };
      await provider?.onNetworkChange(handleNetworkChange);
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletNetworkChangeError(errMsg));
      throw error;
    }
  }
}
