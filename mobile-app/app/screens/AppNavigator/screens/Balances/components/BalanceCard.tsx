import {
  ThemedView,
  ThemedTouchableOpacity,
  ThemedIcon,
  ThemedText
} from '@components/themed'
import { BalanceParamList } from '../BalancesNavigator'
import { BalanceRowToken } from '../BalancesScreen'
import { StackNavigationProp } from '@react-navigation/stack'
import { View } from '@components'
import { translate } from '@translations'
import { tailwind } from '@tailwind'
import { ButtonGroup } from '../../Dex/components/ButtonGroup'
import { RootState } from '@store'
import { useSelector } from 'react-redux'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { EmptyBalances } from './EmptyBalances'
import { TokenNameText } from '@screens/AppNavigator/screens/Balances/components/TokenNameText'
import { TokenAmountText } from '@screens/AppNavigator/screens/Balances/components/TokenAmountText'
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { getNativeIcon } from '@components/icons/assets'
import { TouchableOpacity } from 'react-native'
import { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { TokenBreakdownPercentage } from './TokenBreakdownPercentage'
import { TokenBreakdownDetails } from './TokenBreakdownDetails'
import { LockedBalance, useTokenLockedBalance } from '../hooks/TokenLockedBalance'

export enum ButtonGroupTabKey {
  AllTokens = 'ALL_TOKENS',
  LPTokens = 'LP_TOKENS',
  Crypto = 'CRYPTO',
  dTokens = 'd_TOKENS'
}

interface BalanceCardProps {
  filteredTokens: BalanceRowToken[]
  navigation: StackNavigationProp<BalanceParamList>
  buttonGroupOptions?: {
    onButtonGroupPress: (key: ButtonGroupTabKey) => void
    activeButtonGroup: string
    setActiveButtonGroup: (key: ButtonGroupTabKey) => void
  }
}

export function BalanceCard ({
  filteredTokens,
  navigation,
  buttonGroupOptions
}: BalanceCardProps): JSX.Element {
  const buttonGroup = [
    {
      id: ButtonGroupTabKey.AllTokens,
      label: translate('screens/BalancesScreen', 'All tokens'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.AllTokens)
    },
    {
      id: ButtonGroupTabKey.LPTokens,
      label: translate('screens/BalancesScreen', 'LP tokens'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.LPTokens)
    },
    {
      id: ButtonGroupTabKey.Crypto,
      label: translate('screens/BalancesScreen', 'Crypto'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.Crypto)
    },
    {
      id: ButtonGroupTabKey.dTokens,
      label: translate('screens/BalancesScreen', 'dTokens'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.dTokens)
    }
  ]
  const onButtonGroupChange = (buttonGroupTabKey: ButtonGroupTabKey): void => {
    if (buttonGroupOptions !== undefined) {
      buttonGroupOptions.setActiveButtonGroup(buttonGroupTabKey)
      buttonGroupOptions.onButtonGroupPress(buttonGroupTabKey)
    }
  }

  const { hasFetchedToken } = useSelector((state: RootState) => (state.wallet))
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)

  if (isCollapsed) {
    // display value in increasing order
    filteredTokens.sort((a, b) => new BigNumber(a.usdAmount).minus(new BigNumber(b.usdAmount)).toNumber())
  } else {
    // display value in decreasing order
    filteredTokens.sort((a, b) => new BigNumber(b.usdAmount).minus(new BigNumber(a.usdAmount)).toNumber())
  }

  return (
    <ThemedView>
      {
        // filter tab
        buttonGroupOptions !== undefined &&
        (
          <>
            <View style={tailwind('p-4')}>
              <ButtonGroup
                buttons={buttonGroup}
                activeButtonGroupItem={buttonGroupOptions.activeButtonGroup}
                modalStyle={tailwind('font-medium text-xs text-center py-0.5')}
                testID='balance_button_group'
              />
            </View>
            {/*  dropdown arrow (sorting) appears when there are tokens */}
            {
              filteredTokens.length > 0 && hasFetchedToken &&
                <View testID='your_assets_dropdown_arrow'>
                  <DropdownArrow isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                </View>
            }
          </>
        )
      }
      <View testID='card_balance_row_container'>
        {filteredTokens.map((item) => (
          <View key={item.symbol} style={tailwind('p-4 pt-1.5 pb-1.5')}>
            <BalanceItemRow
              onPress={() => navigation.navigate({
                name: 'TokenDetail',
                params: { token: item },
                merge: true
              })}
              token={item}
            />
          </View>
        ))}
      </View>
      {
        !hasFetchedToken &&
          <SkeletonLoader row={4} screen={SkeletonLoaderScreen.Balance} />
      }
      {
        // display empty balance component
        filteredTokens.length === 0 && hasFetchedToken &&
          <EmptyBalances />
      }
    </ThemedView>
  )
}

function BalanceItemRow ({
  token,
  onPress
}: { token: BalanceRowToken, onPress: () => void }): JSX.Element {
  const Icon = getNativeIcon(token.displaySymbol)
  const testID = `balances_row_${token.id}`
  const { isBalancesDisplayed } = useDisplayBalancesContext()
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false)
  const onBreakdownPress = (): void => {
    setIsBreakdownExpanded(!isBreakdownExpanded)
  }
  const lockedToken = useTokenLockedBalance({ symbol: token.symbol }) as LockedBalance ?? { amount: new BigNumber(0), tokenValue: new BigNumber(0) }
  const { hasFetchedToken } = useSelector((state: RootState) => (state.wallet))
  const collateralTokens = useSelector((state: RootState) => state.loans.collateralTokens)

  const hasLockedBalance = useMemo((): boolean => {
    return collateralTokens.some(collateralToken => collateralToken.token.displaySymbol === token.displaySymbol)
  }, [token])

  return (
    <ThemedView
      dark={tailwind('bg-gray-800')}
      light={tailwind('bg-white')}
      style={tailwind('p-4 pb-0 rounded-lg')}
    >
      <ThemedTouchableOpacity
        onPress={onPress}
        dark={tailwind('border-0')}
        light={tailwind('border-0')}
        style={tailwind('flex-row justify-between items-center mb-4')}
        testID={testID}
      >
        <View style={tailwind('flex-row items-center flex-grow')}>
          <Icon testID={`${testID}_icon`} />
          <TokenNameText displaySymbol={token.displaySymbol} name={token.name} testID={testID} />
          <TokenAmountText
            tokenAmount={lockedToken.amount.plus(token.amount).toFixed(8)}
            usdAmount={lockedToken.tokenValue.plus(token.usdAmount)}
            testID={testID}
            isBalancesDisplayed={isBalancesDisplayed}
          />
        </View>
      </ThemedTouchableOpacity>

      {hasLockedBalance &&
        (
          <>
            <TokenBreakdownPercentage
              symbol={token.symbol}
              availableAmount={new BigNumber(token.amount)}
              onBreakdownPress={onBreakdownPress}
              isBreakdownExpanded={isBreakdownExpanded}
              lockedAmount={lockedToken.amount}
              testID={token.displaySymbol}
            />
            {isBreakdownExpanded && (
              <ThemedView
                light={tailwind('border-t border-gray-100')}
                dark={tailwind('border-t border-gray-700')}
                style={tailwind('pt-2 pb-4')}
              >
                <TokenBreakdownDetails
                  hasFetchedToken={hasFetchedToken}
                  lockedAmount={lockedToken.amount}
                  lockedValue={lockedToken.tokenValue}
                  availableAmount={new BigNumber(token.amount)}
                  availableValue={token.usdAmount}
                  testID={token.displaySymbol}
                />
              </ThemedView>
            )}
          </>
        )}
    </ThemedView>
  )
}

function DropdownArrow ({
  isCollapsed,
  setIsCollapsed
}: { isCollapsed: boolean, setIsCollapsed: (isCollapsed: boolean) => void }): JSX.Element {
  return (
    <View style={tailwind('px-4 flex flex-row items-center')}>
      <ThemedText
        style={tailwind('text-xs text-gray-400 pr-1')}
        onPress={() => setIsCollapsed(!isCollapsed)}
      >
        {translate('screens/BalancesScreen', 'YOUR ASSETS')}
      </ThemedText>
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-xs')}
        onPress={() => setIsCollapsed(!isCollapsed)}
      >
        {translate('screens/BalancesScreen', `(From ${!isCollapsed ? 'highest' : 'lowest'} value)`)}
      </ThemedText>
      <TouchableOpacity
        onPress={() => setIsCollapsed(!isCollapsed)}
        style={tailwind('flex flex-row pt-1')}
        testID='toggle_sorting_assets'
      >
        <ThemedIcon
          light={tailwind('text-primary-500')}
          dark={tailwind('text-darkprimary-500')}
          iconType='MaterialIcons'
          name={!isCollapsed ? 'expand-more' : 'expand-less'}
          size={22}
        />
      </TouchableOpacity>
    </View>
  )
}