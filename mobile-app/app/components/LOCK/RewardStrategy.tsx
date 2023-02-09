import { BottomSheetToken, BottomSheetTokenList, TokenType } from '@components/BottomSheetTokenList';
import { BottomSheetNavScreen } from '@components/BottomSheetWithNav';
import { Button } from '@components/Button';
import { IconButton } from '@components/IconButton';
import { ThemedIcon, ThemedView } from '@components/themed';
import { RewardStrategyType } from '@constants/LOCK/RewardStrategyType';
import { useLockStakingContext } from '@contexts/LOCK/LockStakingContextProvider';
import { ButtonGroup } from '@screens/AppNavigator/screens/Dex/components/ButtonGroup';
import { RewardRouteDto, StakingStrategy } from '@shared-api/dfx/ApiService';
import { useWalletContext } from '@shared-contexts/WalletContext';
import { RootState } from '@store';
import { allTokens, AssociatedToken } from '@store/wallet';
import { tailwind } from '@tailwind';
import { translate } from '@translations';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { EditButton } from './EditButton';
import { ListItem, ListItemStyle } from './ListItem';
import { RewardRouteDelete } from './modals/RewardRouteDelete';
import { RewardStrategyInfo } from './modals/RewardStrategyInfo';

interface RewardStrategyProps {
  openModal: (screens: BottomSheetNavScreen[]) => void;
  dismissModal: () => void;
}

export function RewardStrategy({ openModal, dismissModal }: RewardStrategyProps): JSX.Element {
  const {
    info,
    editRewardRoutes,
    setEditRewardRoutes,
    saveRewardRoutes,
    activeStrategyType,
    setActiveStrategyType,
    rewardRoutes,
    isSubmitting,
  } = useLockStakingContext();
  const { control, setValue, formState, reset } = useForm({ mode: 'onChange' });
  const watcher = useWatch({ control });
  const [showsRewardStrategy, setShowsRewardStrategy] = useState(false);
  const [editableRewardRoutes, setEditableRewardRoutes] = useState<RewardRouteDto[]>();
  const tokens = useSelector((state: RootState) => allTokens(state.wallet));
  const { address } = useWalletContext();

  const buttonGroup = [
    {
      id: RewardStrategyType.DFI,
      label: translate('LOCK/LockDashboardScreen', 'DFI rewards'),
      handleOnPress: () => setActiveStrategyType(RewardStrategyType.DFI),
    },
    {
      id: RewardStrategyType.DUSD,
      label: translate('LOCK/LockDashboardScreen', 'dUSD rewards'),
      handleOnPress: () => setActiveStrategyType(RewardStrategyType.DUSD),
    },
  ];

  function shouldShowAdditionalElements(): boolean {
    return info?.strategy === StakingStrategy.LIQUIDITY_MINING;
  }

  function isEditAvailable(): boolean {
    return info?.strategy === StakingStrategy.MASTERNODE;
  }

  const filteredRewardRoutes = useMemo(() => {
    return (editableRewardRoutes ? editableRewardRoutes : rewardRoutes)?.filter((r) => !r.isReinvest) ?? [];
  }, [editableRewardRoutes, rewardRoutes]);

  const reinvestPercent = useMemo(() => {
    return new BigNumber(1)
      .minus(
        filteredRewardRoutes.length > 0
          ? BigNumber.sum(...filteredRewardRoutes.map((r) => new BigNumber(r.rewardPercent ?? 0)))
          : 0,
      )
      .multipliedBy(100)
      .toNumber();
  }, [filteredRewardRoutes, watcher]);

  function getReinvestAsset(): string | undefined {
    return info?.strategy === StakingStrategy.LIQUIDITY_MINING ? activeStrategyType : info?.asset;
  }

  useEffect(() => {
    setEditableRewardRoutes(editRewardRoutes ? rewardRoutes : undefined);
    reset();
  }, [editRewardRoutes]);

  const listItems = useCallback(() => {
    return [
      ...filteredRewardRoutes.map((route) => ({
        title: route.displayLabel,
        value: route.rewardPercent ? '' + route.rewardPercent * 100 : undefined,
        style: editRewardRoutes ? ListItemStyle.ACTIVE_ICON_EDIT : ListItemStyle.ACTIVE_ICON,
        onPress: () => openDelete(route),
      })),
      {
        title: translate('LOCK/LockDashboardScreen', 'Reinvest, {{asset}}', { asset: getReinvestAsset() }),
        value: '' + reinvestPercent,
        style: reinvestPercent < 0 ? ListItemStyle.ACTIVE_INVALID : ListItemStyle.ACTIVE,
        onPress: undefined,
      },
    ];
  }, [editRewardRoutes, filteredRewardRoutes, editableRewardRoutes, activeStrategyType, reinvestPercent]);

  function openDelete(route: RewardRouteDto): void {
    openModal([
      {
        stackScreenName: 'RewardRouteDelete',
        component: RewardRouteDelete({
          route,
          onConfirm: () => {
            setEditableRewardRoutes(editableRewardRoutes?.filter((r) => r.targetAsset !== route.targetAsset));
            reset();
            dismissModal();
          },
          onCancel: dismissModal,
        }),
        option: {
          header: () => null,
          headerBackTitleVisible: false,
        },
      },
    ]);
  }

  function openInfo(): void {
    openModal([
      {
        stackScreenName: 'RewardStrategyInfo',
        component: RewardStrategyInfo(),
        option: {
          header: () => {
            return (
              <ThemedView
                light={tailwind('bg-white border-0')}
                dark={tailwind('bg-white border-0')}
                style={tailwind('flex flex-row justify-between items-center px-4 py-2 border-b', {
                  'py-3.5 border-t -mb-px': Platform.OS === 'android',
                })} // border top on android to handle 1px of horizontal transparent line when scroll past header
              >
                <Text style={tailwind('text-base font-medium text-black')}>
                  {translate('LOCK/LockDashboardScreen', 'Why are there rewards in DFI and dUSD?')}
                </Text>
                <TouchableOpacity onPress={() => dismissModal()}>
                  <ThemedIcon
                    iconType="MaterialIcons"
                    name="close"
                    size={20}
                    light={tailwind('text-black')}
                    dark={tailwind('text-black')}
                  />
                </TouchableOpacity>
              </ThemedView>
            );
          },
          headerBackTitleVisible: false,
        },
      },
    ]);
  }

  function openTokenList(): void {
    openModal([
      {
        stackScreenName: 'RewardRouteToken',
        component: BottomSheetTokenList({
          lock: true,
          simple: true,
          tokens: getBottomSheetToken(tokens, filteredRewardRoutes),
          tokenType: TokenType.BottomSheetToken,
          headerLabel: translate('LOCK/LockDashboardScreen', 'Select your payout asset'),
          onCloseButtonPress: dismissModal,
          onTokenPress: (item) => {
            dismissModal();
            setTimeout(() => {
              setEditableRewardRoutes(
                editableRewardRoutes?.concat({
                  displayLabel: item.token.displaySymbol,
                  targetAsset: item.token.symbol,
                  targetAddress: address,
                  targetBlockchain: 'DeFiChain',
                  isReinvest: false,
                }),
              );
            }, 500);
          },
        }),
        option: {
          header: () => null,
          headerBackTitleVisible: false,
        },
      },
    ]);
  }

  function submit(): void {
    saveRewardRoutes(editableRewardRoutes ?? [], reinvestPercent / 100);
    reset();
  }

  return (
    <View style={tailwind('px-4 py-2 flex flex-col')}>
      <View style={tailwind('flex-row justify-between')}>
        <View style={tailwind('flex-row')}>
          <Text style={tailwind('text-base font-bold')}>
            {translate('LOCK/LockDashboardScreen', 'Reward strategy')}
          </Text>
          {shouldShowAdditionalElements() && (
            <View style={tailwind('p-0.5')}>
              <IconButton
                iconName="info-outline"
                iconType="MaterialIcons"
                iconSize={16}
                onPress={() => openInfo()}
                lock
                outline
              />
            </View>
          )}
        </View>
        <View style={tailwind('py-1')}>
          <IconButton
            iconName={showsRewardStrategy ? 'chevron-up' : 'chevron-down'}
            iconType="MaterialCommunityIcons"
            iconSize={20}
            onPress={() => setShowsRewardStrategy(!showsRewardStrategy)}
            disabled={editRewardRoutes}
            lock
          />
        </View>
      </View>

      {editRewardRoutes && (
        <View style={tailwind('py-2')}>
          <Button
            label={translate('LOCK/LockDashboardScreen', '+ ADD ASSET')}
            onPress={openTokenList}
            margin="m-0"
            padding="p-2"
            color="primary"
            fill="flat"
            lock
            grow
          />
        </View>
      )}

      {showsRewardStrategy && shouldShowAdditionalElements() && (
        <View style={tailwind('py-1')}>
          <ButtonGroup
            buttons={buttonGroup}
            activeButtonGroupItem={activeStrategyType}
            testID="reward_strategy_button_group"
            lock
            inline
          />
        </View>
      )}
      {showsRewardStrategy && (
        <>
          {listItems().map((item, index) => (
            <ListItem
              key={index}
              id={index}
              title={item.title}
              value={item.value}
              style={item.style}
              onPress={item.onPress}
              control={control}
              onPercentChange={async (name, id, percentage) => {
                const route = filteredRewardRoutes?.[id];
                if (route) route.rewardPercent = Number(percentage) / 100;
                setValue(name, percentage, { shouldValidate: true });
              }}
              showsPercent
            />
          ))}
          <View style={tailwind('py-2')}>
            {editRewardRoutes ? (
              <Button
                label={translate('LOCK/LockDashboardScreen', 'SAVE')}
                onPress={submit}
                margin="m-0"
                padding="p-1.5"
                lock
                grow
                disabled={!formState.isValid || reinvestPercent < 0}
                isSubmitting={isSubmitting}
              />
            ) : (
              <EditButton onPress={() => setEditRewardRoutes(true)} disabled={!isEditAvailable()} />
            )}
          </View>
        </>
      )}
    </View>
  );
}

function getBottomSheetToken(tokens: AssociatedToken, rewardRoutes: RewardRouteDto[]): BottomSheetToken[] {
  // TODO (Krysh) as soon as targetAddress or bank account can be used, remove this filter
  const alreadyAddedTokens = rewardRoutes.map((r) => r.targetAsset);
  return Object.values(tokens)
    .filter((t) => !alreadyAddedTokens.includes(t.symbol))
    .map((t) => ({
      tokenId: t.id,
      available: new BigNumber(0),
      token: {
        name: t.name,
        displaySymbol: t.displaySymbol,
        symbol: t.symbol,
        isLPS: t.isLPS,
      },
    }));
}