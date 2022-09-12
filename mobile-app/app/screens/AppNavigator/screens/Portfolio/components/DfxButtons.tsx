import React, { useEffect, useState } from 'react'
import Popover, { PopoverPlacement } from 'react-native-popover-view'
import { tailwind } from '@tailwind'
import { StyleSheet, Linking, TouchableOpacity, TouchableOpacityProps, View, Platform, StatusBar } from 'react-native'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useDFXAPIContext } from '@shared-contexts/DFXAPIContextProvider'

import BuyIcon from '@assets/images/dfx_buttons/buttons/Buy_Icon.svg'
import SellIcon from '@assets/images/dfx_buttons/buttons/Sell_Icon.svg'
import BtcIcon from '@assets/images/dfx_buttons/crypto/Bitcoin_icon.svg'
import DfxIcon from '@assets/images/dfx_buttons/buttons/DFX_Icon.svg'
import DefichainIncomeIcon from '@assets/images/dfx_buttons/buttons/Defichain_Income_Icon.svg'
import DFItaxIcon from '@assets/images/dfx_buttons/buttons/DFItax_Icon.svg'
import MoreIcon from '@assets/images/dfx_buttons/buttons/More_Icon.svg'

// import BtnDobby from '@assets/images/dfx_buttons/btn_dobby.png'

import { ThemedActivityIndicator, ThemedProps, ThemedText } from '@components/themed'
import { PortfolioParamList } from '../PortfolioNavigator'
import { getUserDetail } from '@shared-api/dfx/ApiService'
import { DFXPersistence } from '@api/persistence/dfx_storage'
import { CryptoButtonGroupTabKey } from '../screens/ReceiveDTokenScreen'
import { SvgProps } from 'react-native-svg'
import { translate } from '@translations'

export function DfxButtons (): JSX.Element {
  const { address } = useWalletContext()
  const { openDfxServices } = useDFXAPIContext()
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>()

  const [isLoadingKycInfo, setIsLoadingKycInfo] = useState<boolean>()

  async function onOverviewButtonPress (): Promise<void> {
    const url = `https://defichain-income.com/address/${encodeURIComponent(address)}`
    await Linking.openURL(url)
  }

  async function onTaxButtonPress (): Promise<void> {
    const url = `https://dfi.tax/adr/${encodeURIComponent(address)}`
    await Linking.openURL(url)
  }

  async function onDobbyButtonPress (): Promise<void> {
    const url = `https://defichain-dobby.com/#/setup/${encodeURIComponent(address)}`
    await Linking.openURL(url)
  }

  // update loading, set isKInfo state & navigate accordingly
  const navigateAfterKycCheckTo = (isKyc: boolean, screen: string): void => {
    setIsLoadingKycInfo(false)
    isKyc ? navigation.navigate(screen) : navigation.navigate('UserDetails')
  }

  function checkUserProfile (screen: string): void {
    // start loading UserInfoCompleted/KycDataComplete --> (1) from STORE --> (2) from API + store result
    setIsLoadingKycInfo(true)

    void (async () => {
      // (1) from STORE
      const isUserDetailStored = await DFXPersistence.getUserInfoComplete(address)

      if (isUserDetailStored !== null && isUserDetailStored) {
        // if stored, navigate to Sell Screen
        navigateAfterKycCheckTo(true, screen)
      } else {
        // if not, retrieve from API
        void (async () => {
          // (2) from API
          const userDetail = await getUserDetail()
          userDetail.kycDataComplete = userDetail?.kycDataComplete ?? false

          // persist result to STORE
          await DFXPersistence.setUserInfoComplete(address, userDetail.kycDataComplete)

          // navigate based on BackendData result
          navigateAfterKycCheckTo(userDetail.kycDataComplete, screen)
        })()
      }
    })()
  }

  const buttons: Array<{ hide?: boolean, Svg: React.FC<SvgProps>, label: string, onPress: () => Promise<void>|void }> = [
    {
      Svg: BuyIcon,
      label: 'Buy',
      onPress: () => {
        // check kycData
        checkUserProfile('Buy')
      }
    },
    {
      Svg: SellIcon,
      label: 'Sell',
      onPress: () => {
        // check kycData
        checkUserProfile('Sell')
      }
    },
    {
      Svg: BtcIcon,
      label: 'Deposit Bitcoin',
      onPress: () => {
        // TODO: (thabrad) maybe will need to do kycCheck here in future
        navigation.navigate({
          name: 'ReceiveDTokenScreen',
          params: { crypto: CryptoButtonGroupTabKey.BTC },
          merge: true
        })
      }
    },
    {
      Svg: DfxIcon,
      label: 'Staking',
      onPress: openDfxServices
    },
    {
      Svg: DefichainIncomeIcon,
      label: 'Defichain Income',
      onPress: onOverviewButtonPress
    },
    {
      Svg: DFItaxIcon,
      label: 'DFI.Tax',
      onPress: onTaxButtonPress
    },
    {
      hide: true, // TODO(davidleomay)
      Svg: DFItaxIcon,
      label: 'Dobby',
      onPress: onDobbyButtonPress
    }
  ]

  const BUTTONS_SHOWN = 5
  const headerButtons = buttons.splice(BUTTONS_SHOWN - 1)

  return (
    <View style={tailwind('flex justify-center flex-row mt-3')}>
      <View style={tailwind('flex w-2')} />
      {buttons
        .filter((b) => !(b.hide ?? false))
        .map((b, i) => (b.Svg === BuyIcon || b.Svg === SellIcon) // loading spinner when loading userInfo
          ? (
            <SvgButton key={i} Svg={b.Svg} label={b.label} onPress={async () => await b.onPress()} loading={isLoadingKycInfo} />
          )
          : <SvgButton key={i} Svg={b.Svg} label={b.label} onPress={async () => await b.onPress()} />
      )}
      <PopoverView buttons={headerButtons} />
      <View style={tailwind('flex w-2')} />
    </View>
  )
}

interface SvgButtonProps extends TouchableOpacityProps {
  Svg: React.FC<SvgProps>
  label?: string
  // source: ImageSourcePropType
  loading?: boolean
}

export function SvgButton (props: SvgButtonProps): JSX.Element {
  const styles = StyleSheet.create({
    button: {
      aspectRatio: 1,
      flex: 2,
      marginBottom: 8
    }
  })

  return (
    <TouchableOpacity style={styles.button} {...props}>
      <View style={tailwind('mt-1 justify-center items-center')}>
        <props.Svg width={50} height={50} />
        <ThemedText
          style={tailwind('h-8 mt-1 text-center text-xs')}
        >
          {translate('screens/DfxButtons', props.label ?? '')}
        </ThemedText>
      </View>
      {(props.loading ?? false) && <ThemedActivityIndicator size='large' color='#65728a' style={tailwind('absolute inset-0 items-center justify-center')} />}
    </TouchableOpacity>
  )
}

interface PopoverViewProps extends ThemedProps {
  buttons: Array<{ hide?: boolean, Svg: React.FC<SvgProps>, label: string, onPress: () => Promise<void> | void }>
}

export function PopoverView (props: PopoverViewProps): JSX.Element {
  const offsetAndroidHeight = StatusBar.currentHeight !== undefined ? (StatusBar.currentHeight * -1) : 0
  const [showPopover, setShowPopover] = useState(false)

  // to fix memory leak error
  useEffect(() => {
    // May work on Web, but not officially supported, as per documentation, add condition to hide popover/tooltip
    if (Platform.OS === 'web') {
      setTimeout(() => setShowPopover(false), 2000)
    }
  }, [showPopover])

  return (
    <Popover
      verticalOffset={Platform.OS === 'android' ? offsetAndroidHeight : 0} // to correct tooltip poition on android
      placement={PopoverPlacement.AUTO}
      popoverStyle={tailwind('bg-dfxblue-800')}
      isVisible={showPopover}
      onRequestClose={() => setShowPopover(false)}
      from={(
        <View>
          <SvgButton key='xtra' Svg={MoreIcon} label='more' onPress={() => setShowPopover(true)} />
        </View>
      )}
    >
      <View style={tailwind('flex-row')}>
        {props.buttons
          .filter((btn) => !(btn.hide ?? false))
          .map((btn, i) =>
            <View key={`ov${i}`} style={tailwind('p-4')}>
              <SvgButton Svg={btn.Svg} label={btn.label} onPress={async () => await btn.onPress()} />
            </View>
        )}
      </View>
    </Popover>
  )
}
