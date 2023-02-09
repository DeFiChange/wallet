import { Button } from '@components/Button';
import { TokenData } from '@defichain/whale-api-client/dist/api/tokens';
import { StakingAction } from '@constants/LOCK/StakingAction';
import { StakingAnalyticsOutputDto, StakingOutputDto, StakingStrategy } from '@shared-api/dfx/ApiService';
import { RootState } from '@store';
import { tokenSelectorByDisplaySymbol, tokensSelector, WalletToken } from '@store/wallet';
import { tailwind } from '@tailwind';
import { translate } from '@translations';
import BigNumber from 'bignumber.js';
import { Text, TouchableOpacity, View } from 'react-native';
import NumberFormat from 'react-number-format';
import { useSelector } from 'react-redux';
import { ListItem, ListItemStyle } from './ListItem';
import { SymbolIcon } from '@components/SymbolIcon';
import { useState } from 'react';
import { useTokenPrice } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice';
import { RewardStrategy } from './RewardStrategy';
import { BottomSheetNavScreen } from '@components/BottomSheetWithNav';
import { useLockStakingContext } from '@contexts/LOCK/LockStakingContextProvider';

interface StakingCardProps {
  info: StakingOutputDto;
  analytics?: StakingAnalyticsOutputDto[];
  isLoading: boolean;
  openModal: (
    action: StakingAction,
    info: StakingOutputDto,
    token: WalletToken | TokenData,
    screens?: BottomSheetNavScreen[],
  ) => void;
  dismissModal: () => void;
}

export function StakingCard({ info, analytics, isLoading, openModal, dismissModal }: StakingCardProps): JSX.Element {
  const { editRewardRoutes } = useLockStakingContext();
  const token = useSelector((state: RootState) => tokenSelectorByDisplaySymbol(state.wallet, info.asset));
  const walletToken = useSelector((state: RootState) => tokensSelector(state.wallet)).find((t) =>
    info.balances.map((b) => b.asset).includes(t.displaySymbol),
  );
  const { getTokenPrice } = useTokenPrice();

  const addAction = info.strategy === StakingStrategy.MASTERNODE ? 'STAKE' : 'DEPOSIT';
  const removeAction = info.strategy === StakingStrategy.MASTERNODE ? 'UNSTAKE' : 'WITHDRAW';

  const [showsApy, setShowsApy] = useState(true);

  const getTotalBalance = (): number => {
    return BigNumber.sum(
      ...(info.balances?.map((b) => getTokenPrice(b.asset, new BigNumber(b.balance))) ?? [new BigNumber(0)]),
    ).toNumber();
  };

  function openModalWithScreens(screens: BottomSheetNavScreen[]): void {
    openModal(addAction, info, token, screens);
  }

  return (
    <>
      {/* card header */}
      <View style={tailwind('py-1')} />

      <View style={tailwind('border-b border-lockGray-100 pb-1.5')}>
        {info.balances.map((balance, index) => (
          <View key={index} style={tailwind('flex flex-col px-4')}>
            {info.strategy === StakingStrategy.LIQUIDITY_MINING && index === 0 && (
              <>
                <View style={tailwind('flex-col border-b border-lockGray-100 pt-1 pb-2.5')}>
                  <NumberFormat
                    value={getTotalBalance()}
                    decimalScale={2}
                    thousandSeparator
                    displayType="text"
                    renderText={(value) => (
                      <ListItem
                        id={0}
                        title={translate('LOCK/LockDashboardScreen', 'Total deposited')}
                        value={`≈${value} USDT`}
                        style={ListItemStyle.ACTIVE}
                        header
                      />
                    )}
                  />
                </View>
              </>
            )}
            <View
              style={tailwind('flex-row justify-between py-1', {
                'pt-2.5': info.strategy === StakingStrategy.LIQUIDITY_MINING && index === 0,
              })}
            >
              <View style={tailwind('flex-row')}>
                <SymbolIcon
                  symbol={
                    info.strategy === StakingStrategy.MASTERNODE ||
                    (info.strategy === StakingStrategy.LIQUIDITY_MINING && balance.asset === 'DFI')
                      ? '_UTXO'
                      : balance.asset // TODO (Krysh): we might have an issue here if starting with 'd' (BTC vs dBTC)
                  }
                  styleProps={tailwind('w-6 h-6')}
                />
                <Text
                  style={tailwind('text-base font-bold pl-1', {
                    'text-base font-medium': info.strategy === StakingStrategy.LIQUIDITY_MINING,
                  })}
                >
                  {translate(
                    'LOCK/LockDashboardScreen',
                    info.strategy === StakingStrategy.MASTERNODE ? 'DFI' : balance.asset,
                  )}
                </Text>
                {analytics?.find((a) => a.asset === balance.asset) !== undefined && (
                  <NumberFormat
                    value={
                      showsApy
                        ? analytics?.find((a) => a.asset === balance.asset)?.apy
                        : analytics?.find((a) => a.asset === balance.asset)?.apr
                    }
                    decimalScale={2}
                    displayType="text"
                    renderText={(value) => (
                      <TouchableOpacity onPress={() => setShowsApy(!showsApy)}>
                        <Text style={tailwind('text-lock-200 text-xs font-bold px-1 py-0.5')}>
                          {translate('LOCK/LockDashboardScreen', '{{value}}% {{text}}', {
                            value,
                            text: showsApy ? 'APY' : 'APR',
                          })}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
              <NumberFormat
                value={balance.balance ?? 0}
                thousandSeparator
                decimalScale={2}
                displayType="text"
                renderText={(value) => (
                  <Text style={tailwind('text-base font-medium')}>
                    {translate('LOCK/LockDashboardScreen', '{{amount}}', {
                      amount: value,
                    })}
                  </Text>
                )}
              />
            </View>
            {balance.pendingDeposits > 0 && (
              <NumberFormat
                value={balance.pendingDeposits}
                thousandSeparator
                decimalScale={2}
                displayType="text"
                renderText={(value) => (
                  <ListItem
                    id={0}
                    title={translate('LOCK/LockDashboardScreen', 'Pending Deposits')}
                    value={`+${value} ${balance.asset}`}
                    style={ListItemStyle.PENDING}
                  />
                )}
              />
            )}
            {balance.pendingWithdrawals > 0 && (
              <NumberFormat
                value={balance.pendingWithdrawals}
                thousandSeparator
                decimalScale={2}
                displayType="text"
                renderText={(value) => (
                  <ListItem
                    id={0}
                    title={translate('LOCK/LockDashboardScreen', 'Pending Withdrawals')}
                    value={`-${value} ${balance.asset}`}
                    style={ListItemStyle.PENDING}
                  />
                )}
              />
            )}
          </View>
        ))}
      </View>

      {/* card content / staking details */}
      <RewardStrategy openModal={openModalWithScreens} dismissModal={dismissModal} />
      <View style={tailwind('flex-row bg-lock-450 rounded-b-md justify-between')}>
        <Button
          label={translate('LOCK/LockDashboardScreen', addAction)}
          margin="m-3 "
          padding="p-1"
          onPress={() => walletToken != null && openModal(addAction, info, walletToken)}
          lock
          grow
          disabled={
            isLoading ||
            editRewardRoutes ||
            walletToken == null ||
            new BigNumber(walletToken.amount).isLessThanOrEqualTo(0)
          }
          isSubmitting={isLoading}
        />
        <Button
          label={translate('LOCK/LockDashboardScreen', removeAction)}
          margin="my-3 mr-3"
          padding="p-1"
          onPress={() => token != null && openModal(removeAction, info, token)}
          lock
          grow
          disabled={isLoading || editRewardRoutes || token == null || !info?.balances.some((b) => b.balance > 0)}
          isSubmitting={isLoading}
        />
      </View>
    </>
  );
}