import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import * as React from 'react'
import { useCallback } from 'react'
import { Alert, Platform, ScrollView, TouchableOpacity } from 'react-native'
import { useDispatch } from 'react-redux'
import { Logging } from '../../../../api'
import { MnemonicWords } from '../../../../api/wallet/mnemonic_words'
import { Text } from '../../../../components'
import { SectionTitle } from '../../../../components/SectionTitle'
import { useNetworkContext } from '../../../../contexts/NetworkContext'
import { useWalletPersistenceContext } from '../../../../contexts/WalletPersistenceContext'
import { EnvironmentNetwork, getEnvironment, isPlayground } from '../../../../environment'
import { authentication, Authentication } from '../../../../store/authentication'
import { ocean } from '../../../../store/ocean'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { SettingsParamList } from './SettingsNavigator'

type Props = StackScreenProps<SettingsParamList, 'SettingsScreen'>

export function SettingsScreen ({ navigation }: Props): JSX.Element {
  const networks = getEnvironment().networks
  const dispatch = useDispatch()
  const walletContext = useWalletPersistenceContext()
  const isEncrypted = walletContext.wallets[0].type === 'MNEMONIC_ENCRYPTED'

  const revealRecoveryWords = useCallback(() => {
    if (!isEncrypted) {
      // TODO: alert(mnemonic phrase only get encrypted and stored if for encrypted type)
      return
    }

    const auth: Authentication<string[]> = {
      message: translate('screens/Setting', 'To continue downloading your recovery words, we need you to enter your passcode.'),
      consume: async passphrase => await MnemonicWords.decrypt(passphrase),
      onAuthenticated: async (words) => {
        navigation.navigate({ name: 'RecoveryWordsScreen', params: { words }, merge: true })
      },
      onError: e => Logging.error(e)
    }
    dispatch(authentication.actions.prompt(auth))
  }, [walletContext.wallets[0]])

  const changePasscode = useCallback(() => {
    if (walletContext.wallets[0].type !== 'MNEMONIC_ENCRYPTED') {
      return
    }

    const auth: Authentication<string[]> = {
      message: translate('screens/Setting', 'To update your passcode, we need you to enter your current passcode.'),
      consume: async passphrase => await MnemonicWords.decrypt(passphrase),
      onAuthenticated: async words => {
        navigation.navigate({
          name: 'ChangePinScreen', params: { words, pinLength: 6 }, merge: true
        })
      },
      onError: (e) => {
        dispatch(ocean.actions.setError(e))
      }
    }

    dispatch(authentication.actions.prompt(auth))
  }, [walletContext.wallets[0]])

  return (
    <ScrollView style={tailwind('flex-1 bg-gray-100 pb-8')}>
      <SectionTitle text={translate('screens/Settings', 'NETWORK')} testID='network_title' />
      {
        networks.map((network, index) => (
          <RowNetworkItem key={index} network={network} />
        ))
      }
      <SectionTitle text={translate('screens/Settings', 'SECURITY')} testID='security_title' />
      <SecurityRow testID='view_recovery_words' label='Recovery Words' onPress={revealRecoveryWords} />
      {
        isEncrypted && <SecurityRow testID='view_change_passcode' label='Change Passcode' onPress={changePasscode} />
      }
      <RowNavigateItem pageName='AboutScreen' title='About' />
      <RowExitWalletItem />
    </ScrollView>
  )
}

function RowNetworkItem (props: { network: EnvironmentNetwork }): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()
  const { network, updateNetwork } = useNetworkContext()

  const onPress = useCallback(async () => {
    if (props.network === network) {
      if (isPlayground(props.network)) {
        navigation.navigate('Playground')
      }
    } else {
      await updateNetwork(props.network)
    }
  }, [network])

  return (
    <TouchableOpacity
      testID={`button_network_${props.network}`}
      style={tailwind('flex flex-row p-4 pr-2 bg-white items-center justify-between border-b border-gray-200')}
      onPress={onPress}
    >
      <Text style={tailwind('font-medium')}>
        {props.network}
      </Text>

      {
        props.network === network &&
        (
          <MaterialIcons
            testID={`button_network_${props.network}_check`} size={24} name='check'
            style={tailwind('text-primary')}
          />
        )
      }
    </TouchableOpacity>
  )
}

function RowExitWalletItem (): JSX.Element {
  const { clearWallets } = useWalletPersistenceContext()

  async function onExitWallet (): Promise<void> {
    if (Platform.OS === 'web') {
      await clearWallets()
    } else {
      Alert.alert(
        translate('screens/Settings', 'Are you sure you want to unlink your wallet?'),
        translate('screens/Settings', 'You will need to use your recovery words the next time you want to get back to your wallet.'),
        [
          {
            text: translate('screens/Settings', 'Cancel'),
            style: 'cancel'
          },
          {
            text: translate('screens/Settings', 'Unlink Wallet'),
            onPress: async () => await clearWallets(),
            style: 'destructive'
          }
        ]
      )
    }
  }

  return (
    <TouchableOpacity
      testID='setting_exit_wallet'
      onPress={onExitWallet} style={tailwind('flex bg-white flex-row p-4 mt-8 items-center')}
    >
      <MaterialIcons
        name='exit-to-app'
        style={[tailwind('self-center text-primary mr-2'), { transform: [{ scaleX: -1 }] }]}
        size={24}
      />
      <Text style={tailwind('font-medium text-primary')}>
        {translate('screens/Settings', 'UNLINK WALLET')}
      </Text>
    </TouchableOpacity>
  )
}

function SecurityRow ({ testID, label, onPress }: { testID: string, label: string, onPress: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      testID={testID}
      style={tailwind('flex bg-white p-4 pr-2 flex-row items-center justify-between border-b border-gray-200')}
      onPress={onPress}
    >
      <Text style={tailwind('font-medium')}>
        {translate('screens/Settings', label)}
      </Text>
      <MaterialIcons
        name='chevron-right'
        style={[tailwind('text-black')]}
        size={24}
      />
    </TouchableOpacity>
  )
}

function RowNavigateItem ({ pageName, title }: { pageName: string, title: string }): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()
  return (
    <TouchableOpacity
      testID={`setting_navigate_${title}`}
      onPress={() => {
        navigation.navigate(pageName)
      }} style={tailwind('flex bg-white flex-row p-4 pr-2 mt-4 items-center')}
    >
      <Text style={tailwind('font-medium flex-grow')}>
        {translate('screens/Settings', title)}
      </Text>
      <MaterialIcons name='chevron-right' size={24} />
    </TouchableOpacity>
  )
}
