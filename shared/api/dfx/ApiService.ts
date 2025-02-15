import { History } from './models/History';
import { getEnvironment } from '@environment';
import { AuthResponse, SignMessageResponse } from './models/ApiDto';
import { Asset } from './models/Asset';
import {
  BuyPaymentInfoDto,
  BuyRoute,
  BuyRouteDto,
  fromBuyRouteDto,
  GetBuyPaymentInfoDto,
  toBuyRouteDto,
} from './models/BuyRoute';
import { CfpResult } from './models/CfpResult';
import { Country } from './models/Country';
import { Fiat } from './models/Fiat';
import { Language } from './models/Language';
import {
  fromSellRouteDto,
  GetSellPaymentInfoDto,
  SellData,
  SellPaymentInfoDto,
  SellRoute,
  SellRouteDto,
  toSellRouteDto,
} from './models/SellRoute';
import {
  Blockchain,
  fromUserDetailDto,
  fromUserDto,
  KycInfo,
  NewUser,
  toUserDto,
  User,
  UserDetail,
  UserDetailDto,
  UserDetailRequestDto,
  UserDto,
} from './models/User';
import { ApiDomain, AuthService, Credentials, Session } from './AuthService';
import { RoutesDto, fromRoutesDto, Routes } from './models/Route';
import { KycData, KycDataTransferDto, toKycDataDto } from './models/KycData';
import { HistoryType } from './models/HistoryType';
import { CryptoRoute } from './models/CryptoRoute';
import {
  BankAccount,
  BankAccountData,
  BankAccountDto,
  fromBankAccountDto,
  toBankAccountDto,
} from './models/BankAccount';
import { noop } from 'lodash';
import { getReleaseChannel } from '@api/releaseChannel';
import { Logging } from '@api';

const DfxBaseUrl = getEnvironment(getReleaseChannel()).dfx.apiUrl;
const AuthUrl = 'auth';
const UserUrl = 'user';
const KycUrl = 'kyc';
const BankAccountUrl = 'bankAccount';
const BuyUrl = 'buy';
const PaymentInfosUrl = 'paymentInfos';
const RouteUrl = 'route';
const SellUrl = 'sell';
const CryptoRouteUrl = 'cryptoRoute';
const HistoryUrl = 'history';
const AssetUrl = 'asset';
const FiatUrl = 'fiat';
const LanguageUrl = 'language';
const BankTxUrl = 'bankTx';
const StatisticUrl = 'statistic';

// ------------------------------------------------------
// -----------------LOCK - API---------------------------
// ------------------------------------------------------
const LockBaseUrl = getEnvironment(getReleaseChannel()).lock.apiUrl;
const LOCKanalytics = 'analytics/staking/filter';
const LOCKKycUrl = 'kyc';
const LOCKStakingUrl = 'staking';
const LOCKBalanceUrl = 'staking/balance';
const LOCKAssetUrl = 'asset';
const LOCKHistoryUrl = 'analytics/history/compact';

export enum StakingStrategy {
  MASTERNODE = 'Masternode',
  LIQUIDITY_MINING = 'LiquidityMining',
}

export interface LockSignMessageResponse {
  message: string;
  blockchains: Blockchain;
}

export interface NewLockUser {
  address: string;
  signature: string;
  blockchain: Blockchain;
  walletName: 'DFX';
}

export interface StakingAnalyticsOutputDto {
  apy: number;
  apr: number;
  tvl: number;
  asset: string;
  strategy: StakingStrategy;
}

export interface LockKYC {
  mail: string;
  language: string;
  kycStatus: string;
  kycLink: string;
}

export interface LockUserDto {
  address: string;
  blockchain: Blockchain;
  mail: string;
  phone: string;
  language: string;
  kycStatus: 'NA' | 'Light' | 'Full';
  kycLink: string;
}

export interface StakingBalanceOutput {
  asset: string;
  balance: number;
  blockchain: Blockchain;
  strategy: StakingStrategy;
}

export interface StakingBalance {
  asset: string;
  balance: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
}

export interface RewardRoute {
  id: number;
  label: string;
  rewardPercent: number;
  targetAsset: string;
  targetAddress: string;
  targetBlockchain: string;
}

export interface RewardRouteDto {
  label?: string;
  rewardPercent?: number;
  targetAsset: string;
  targetAddress: string;
  targetBlockchain: string;

  displayLabel: string;
  internalId: string;
}

export enum StakingStatus {
  CREATED = 'Created',
  ACTIVE = 'Active',
  BLOCKED = 'Blocked',
}

export interface StakingMinimalDeposit {
  asset: string;
  amount: number;
}

export interface StakingOutputDto {
  id: number;
  status: StakingStatus;
  asset: string;
  depositAddress: string;
  minimalDeposits: StakingMinimalDeposit[];
  fee: number;
  balances: StakingBalance[];
  strategy: StakingStrategy;
  rewardRoutes: RewardRoute[];
}

export interface CreateDepositDto {
  asset: string;
  amount: number;
  txId: string;
}

export interface WithdrawalDraftOutputDto {
  id: number;
  signMessage: string;
}

export enum TransactionTarget {
  MASTERNODE = 'Masternode',
  LIQUIDITY_MINING = 'LiquidityMining',
  WALLET = 'Wallet',
  EXTERNAL = 'External',
}

export enum TransactionType {
  DEPOSIT = 'Deposit',
  WITHDRAWAL = 'Withdrawal',
  REWARD = 'Reward',
}

export enum TransactionStatus {
  WAITING_FOR_BALANCE = 'WaitingForBalance',
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  FAILED = 'Failed',
}

export interface TransactionDto {
  inputAmount: number;
  inputAsset: string;
  outputAmount: number;
  outputAsset: string;
  feeAmount: number;
  feeAsset: string;
  amountInEur: number;
  amountInChf: number;
  amountInUsd: number;
  txId: string;
  date: string;
  type: TransactionType;
  status: TransactionStatus;
  source: TransactionTarget;
  target: TransactionTarget;
  targetAddress: string;
}

// --- AUTH --- //
export const LOCKsignIn = async (credentials?: Credentials): Promise<string> => {
  return await fetchFromLOCK<AuthResponse>(`${AuthUrl}/sign-in`, 'POST', credentials, { withoutJWT: true }).then(
    (resp) => {
      return resp.accessToken;
    },
  );
};

export const LOCKsignUp = async (user: NewLockUser): Promise<string> => {
  return await fetchFromLOCK<AuthResponse>(`${AuthUrl}/sign-up`, 'POST', user, { withoutJWT: true }).then((resp) => {
    return resp.accessToken;
  });
};

export const LOCKgetSignMessage = async (address: string): Promise<LockSignMessageResponse> => {
  return await fetchFromLOCK<LockSignMessageResponse>(`${AuthUrl}/sign-message`, 'GET', undefined, {
    withoutJWT: true,
    queryParams: { address },
  });
};

// --- KYC --- //
export const LOCKpostKyc = async (): Promise<LockKYC> => {
  return await fetchFromLOCK<LockKYC>(LOCKKycUrl, 'POST');
};

// --- USER --- //
export const LOCKgetUser = async (): Promise<LockUserDto> => {
  return await fetchFromLOCK<LockUserDto>(UserUrl);
};

// --- STAKING --- //
export const LOCKgetAllAnalytics = async (): Promise<StakingAnalyticsOutputDto[]> => {
  return await fetchFromLOCK<StakingAnalyticsOutputDto[]>(LOCKanalytics, undefined, undefined, {
    queryParams: { blockchain: 'DeFiChain' },
    withoutJWT: true,
  }).then((analytics) => analytics.map(fromAnalyticsDto));
};

const fromAnalyticsDto = (analytics: StakingAnalyticsOutputDto): StakingAnalyticsOutputDto => {
  return {
    ...analytics,
    apr: round(analytics.apr * 100, 1),
    apy: round(analytics.apy * 100, 1),
    tvl: round(analytics.tvl, 0),
  };
};

const round = (amount: number, decimals: number): number =>
  Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);

export const LOCKgetAllStaking = async (): Promise<StakingOutputDto[]> => {
  return await Promise.all(Object.values(StakingStrategy).map(LOCKgetStaking));
};

export const LOCKgetStaking = async (strategy: StakingStrategy): Promise<StakingOutputDto> => {
  return await fetchFromLOCK<StakingOutputDto>(LOCKStakingUrl, undefined, undefined, {
    queryParams: { strategy, blockchain: 'DeFiChain' },
  });
};

export const LOCKdeposit = async (stakingId: number, deposit: CreateDepositDto): Promise<StakingOutputDto> => {
  return await fetchFromLOCK<StakingOutputDto>(`${LOCKStakingUrl}/${stakingId}/deposit`, 'POST', deposit);
};

export const LOCKwithdrawal = async (
  stakingId: number,
  amount: number,
  asset: string,
): Promise<WithdrawalDraftOutputDto> => {
  return await fetchFromLOCK<WithdrawalDraftOutputDto>(`${LOCKStakingUrl}/${stakingId}/withdrawal`, 'POST', {
    amount,
    asset,
  });
};

export const LOCKwithdrawalDrafts = async (stakingId: number): Promise<WithdrawalDraftOutputDto[]> => {
  return await fetchFromLOCK<WithdrawalDraftOutputDto[]>(`${LOCKStakingUrl}/${stakingId}/withdrawal/drafts`);
};

export const LOCKwithdrawalSign = async (
  stakingId: number,
  withdrawal: WithdrawalDraftOutputDto,
): Promise<StakingOutputDto> => {
  return await fetchFromLOCK<StakingOutputDto>(
    `${LOCKStakingUrl}/${stakingId}/withdrawal/${withdrawal.id}/sign`,
    'PATCH',
    { signature: withdrawal.signMessage },
  );
};

export const LOCKrewardRoutes = async (
  stakingId: number,
  rewardRoutes: RewardRouteDto[],
): Promise<StakingOutputDto> => {
  return await fetchFromLOCK<StakingOutputDto>(`${LOCKStakingUrl}/${stakingId}/reward-routes`, 'PUT', rewardRoutes);
};

export const LOCKgetAssets = async (): Promise<Asset[]> => {
  return await fetchFromLOCK<Asset[]>(`${LOCKAssetUrl}`, 'GET');
};

export const LOCKgetBalance = async (address: string): Promise<StakingBalanceOutput[]> => {
  return await fetchFromLOCK<StakingBalanceOutput[]>(`${LOCKBalanceUrl}?userAddress=${address}`, 'GET', undefined, {
    withoutJWT: true,
  });
};

export const LOCKgetTransactions = async (address: string): Promise<TransactionDto[]> => {
  return await fetchFromLOCK<TransactionDto[]>(`${LOCKHistoryUrl}?userAddress=${address}&type=json`, 'GET');
};

const fetchFromLOCK = async <T>(
  url: string,
  method: RestType = 'GET',
  data?: any,
  options?: {
    withoutJWT?: boolean;
    noJson?: boolean;
    queryParams?: Object | string[][] | Record<string, string> | URLSearchParams;
    apiDomain?: ApiDomain;
  },
): Promise<T> => {
  return await fetchFrom<T>(url, method, data, { ...options, apiDomain: ApiDomain.LOCK });
};

// ------------------------------------------------------
// ------------------------------------------------------
// ------------------------------------------------------
// ------------------------------------------------------

// --- AUTH --- //
export const signIn = async (credentials?: Credentials): Promise<string> => {
  return await fetchFrom<AuthResponse>(`${AuthUrl}/signIn`, 'POST', credentials, { withoutJWT: true }).then((resp) => {
    return resp.accessToken;
  });
};

export const signUp = async (user: NewUser): Promise<string> => {
  return await fetchFrom<AuthResponse>(`${AuthUrl}/signUp`, 'POST', user, { withoutJWT: true }).then((resp) => {
    return resp.accessToken;
  });
};

export const getSignMessage = async (address: string): Promise<string> => {
  return await fetchFrom<SignMessageResponse>(`${AuthUrl}/signMessage`, 'GET', undefined, {
    withoutJWT: true,
    queryParams: { address },
  }).then((resp) => {
    return resp.message;
  });
};

// --- USER --- //
export const getUser = async (): Promise<User> => {
  return await fetchFrom<UserDto>(UserUrl).then(fromUserDto);
};

export const getUserDetail = async (): Promise<UserDetail> => {
  return await fetchFrom<UserDetailDto>(`${UserUrl}/detail`).then(fromUserDetailDto);
};

export const putUser = async (user: User | UserDetailRequestDto): Promise<UserDetail> => {
  return await fetchFrom<UserDetailDto>(UserUrl, 'PUT', toUserDto(user as User)).then(fromUserDetailDto);
};

export const updateRefFee = async (fee: number): Promise<void> => {
  return await fetchFrom(UserUrl, 'PUT', { refFeePercent: fee });
};

// --- KYC --- //
export const transferKyc = async (walletName: string): Promise<void> => {
  const wallet: KycDataTransferDto = { walletName };
  return await fetchFrom(`${KycUrl}/transfer`, 'PUT', wallet);
};

export const putKycData = async (data: KycData): Promise<KycInfo> => {
  return await fetchFrom(`${KycUrl}/data`, 'POST', toKycDataDto(data));
};

export const getCountries = async (): Promise<Country[]> => {
  return await fetchFrom<Country[]>(`${KycUrl}/countries`).then((countries) =>
    countries.sort((a, b) => (a.name > b.name ? 1 : -1)),
  );
};

// --- ACCOUNTS --- //
export const getBankAccounts = async (): Promise<BankAccount[]> => {
  return await fetchFrom<BankAccountDto[]>(BankAccountUrl).then((dtoList) =>
    dtoList.map((dto) => fromBankAccountDto(dto)),
  );
};

export const postBankAccount = async (bankAccount: BankAccountData): Promise<BankAccount> => {
  return await fetchFrom<BankAccountDto>(BankAccountUrl, 'POST', toBankAccountDto(bankAccount)).then(
    fromBankAccountDto,
  );
};

export const putBankAccount = async (bankAccount: BankAccountData, id: BankAccount['id']): Promise<BankAccount> => {
  return await fetchFrom<BankAccountDto>(`${BankAccountUrl}/${id}`, 'PUT', toBankAccountDto(bankAccount)).then(
    fromBankAccountDto,
  );
};

// --- PAYMENT ROUTES --- //
export const getRoutes = async (): Promise<Routes> => {
  return await fetchFrom<RoutesDto>(RouteUrl).then(fromRoutesDto);
};

export const getBuyRoutes = async (): Promise<BuyRoute[]> => {
  return await fetchFrom<BuyRouteDto[]>(BuyUrl).then((dtoList) => dtoList.map((dto) => fromBuyRouteDto(dto)));
};

export const postBuyRoute = async (route: BuyRoute): Promise<BuyRoute> => {
  return await fetchFrom<BuyRouteDto>(BuyUrl, 'POST', toBuyRouteDto(route)).then(fromBuyRouteDto);
};

export const putBuyRoute = async (route: BuyRoute): Promise<BuyRoute> => {
  return await fetchFrom<BuyRouteDto>(`${BuyUrl}/${route.id}`, 'PUT', toBuyRouteDto(route)).then(fromBuyRouteDto);
};

export const buyWithPaymentInfos = async (payentInfos: GetBuyPaymentInfoDto): Promise<BuyPaymentInfoDto> => {
  return await fetchFrom<BuyPaymentInfoDto>(`${BuyUrl}/${PaymentInfosUrl}`, 'PUT', payentInfos); //, toBuyRouteDto(route)).then(fromBuyRouteDto)
};

export const sellWithPaymentInfos = async (payentInfos: GetSellPaymentInfoDto): Promise<SellPaymentInfoDto> => {
  return await fetchFrom<SellPaymentInfoDto>(`${SellUrl}/${PaymentInfosUrl}`, 'PUT', payentInfos); //, toBuyRouteDto(route)).then(fromBuyRouteDto)
};

export const getSellRoutes = async (): Promise<SellRoute[]> => {
  return await fetchFrom<SellRouteDto[]>(SellUrl).then((dtoList) => dtoList.map((dto) => fromSellRouteDto(dto)));
};

export const postSellRoute = async (route: SellData): Promise<SellRoute> => {
  return await fetchFrom<SellRouteDto>(SellUrl, 'POST', toSellRouteDto(route)).then(fromSellRouteDto);
};

export const putSellRoute = async (route: SellRoute): Promise<SellRoute> => {
  return await fetchFrom<SellRouteDto>(`${SellUrl}/${route.id}`, 'PUT', toSellRouteDto(route)).then(fromSellRouteDto);
};

export const getCryptoRoutes = async (): Promise<CryptoRoute[]> => {
  return await fetchFrom<CryptoRoute[]>(CryptoRouteUrl);
};

export const postCryptoRoute = async (route: CryptoRoute): Promise<CryptoRoute> => {
  return await fetchFrom<CryptoRoute>(CryptoRouteUrl, 'POST', route);
};

export const putCryptoRoute = async (route: CryptoRoute): Promise<CryptoRoute> => {
  return await fetchFrom<CryptoRoute>(`${CryptoRouteUrl}/${route.id}`, 'PUT', route);
};

export const getHistory = async (types: HistoryType[]): Promise<History[]> => {
  return await fetchFrom<History[]>(`HistoryUrl${toHistoryQuery(types)}`);
};

export const createHistoryCsv = async (types: HistoryType[]): Promise<number> => {
  return await fetchFrom(`${HistoryUrl}/csv${toHistoryQuery(types)}`, 'POST');
};

const toHistoryQuery = (types?: HistoryType[]): string => (types != null ? '?' + Object.values(types).join('&') : '');

// --- PAYMENT --- //
export const postSepaFiles = async (files: File[]): Promise<void> => {
  return await postFiles(BankTxUrl, files);
};

// --- STATISTIC --- //
export const getCfpResults = async (voting: string): Promise<CfpResult[]> => {
  return await fetchFrom(`${StatisticUrl}/cfp/${voting}`);
};

// --- MASTER DATA --- //
export const getAssets = async (): Promise<Asset[]> => {
  return await fetchFrom<Asset[]>(AssetUrl);
};

export const getFiats = async (): Promise<Fiat[]> => {
  return await fetchFrom<Fiat[]>(FiatUrl);
};

export const getLanguages = async (): Promise<Language[]> => {
  return await fetchFrom<Language[]>(LanguageUrl);
};

// --- HELPERS --- //
const postFiles = async (url: string, files: File[]): Promise<void> => {
  const formData = new FormData();
  files.forEach((value, index) => {
    formData.append('files', value);
  });
  return await fetchFrom(url, 'POST', formData, { noJson: true });
};

type RestType = 'GET' | 'PUT' | 'POST' | 'PATCH';

const fetchFrom = async <T>(
  url: string,
  method: RestType = 'GET',
  data?: any,
  options?: {
    withoutJWT?: boolean;
    noJson?: boolean;
    queryParams?: Object | string[][] | Record<string, string> | URLSearchParams;
    apiDomain?: ApiDomain;
  },
): Promise<T> => {
  // QueryParams object conversion helper
  url += options?.queryParams != null ? `?${new URLSearchParams(options?.queryParams).toString()}` : '';

  const BaseUrl = options?.apiDomain === ApiDomain.LOCK ? LockBaseUrl : DfxBaseUrl;

  // console.log('URL--> ', `${BaseUrl}/${url}`)
  // console.log('METHOD --> ', method)
  // ;(data != null) && console.log('data --> ', data)
  Logging.info(`fetch ${method} ${url}`);
  return await AuthService.Session(options?.withoutJWT, options?.apiDomain)
    .then((session) => buildInit(method, session, data, options?.noJson))
    .then(async (init) => await fetch(`${BaseUrl}/${url}`, init))
    .then(async (response) => {
      if (response.ok) {
        return await response
          .json()
          .then()
          .catch(() => noop());
      }
      return await response.json().then((body) => {
        throw body;
      });
    })
    .catch((error) => {
      // console.log(error)
      if (error.statusCode === 401) {
        AuthService.deleteSession().catch(() => 'You shall not pass!');
      }

      throw error;
    });
};

const buildInit = (method: RestType, session: Session, data?: any, noJson?: boolean): RequestInit => ({
  method: method,
  headers: {
    ...(noJson !== undefined && noJson ? undefined : { 'Content-Type': 'application/json' }),
    Authorization: session.accessToken !== undefined ? 'Bearer ' + session.accessToken : '',
  },
  body: noJson !== undefined && noJson ? data : JSON.stringify(data),
});
