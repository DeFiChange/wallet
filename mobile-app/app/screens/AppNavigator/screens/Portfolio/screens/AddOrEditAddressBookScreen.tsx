import { MnemonicStorage } from '@api/wallet/mnemonic_storage';
import { View } from '@components';
import { HeaderTitle } from '@components/HeaderTitle';
import { SubmitButtonGroup } from '@components/SubmitButtonGroup';
import { ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed';
import { WalletTextInput } from '@components/WalletTextInput';
import { fromAddress } from '@defichain/jellyfish-address';
import { useWalletAddress } from '@hooks/useWalletAddress';
import { useAppDispatch } from '@hooks/useAppDispatch';
import { StackScreenProps } from '@react-navigation/stack';
import { useLogger } from '@shared-contexts/NativeLoggingProvider';
import { useNetworkContext } from '@shared-contexts/NetworkContext';
import { useWalletNodeContext } from '@shared-contexts/WalletNodeProvider';
import { RootState } from '@store';
import { authentication, Authentication } from '@store/authentication';
import { userPreferences } from '@store/userPreferences';
import { tailwind } from '@tailwind';
import { translate } from '@translations';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { PortfolioParamList } from '../PortfolioNavigator';

type Props = StackScreenProps<PortfolioParamList, 'AddOrEditAddressBookScreen'>;

export function AddOrEditAddressBookScreen({ route, navigation }: Props): JSX.Element {
  const { title, onSaveButtonPress, address, addressLabel, isAddNew } = route.params;
  const [labelInput, setLabelInput] = useState(addressLabel?.label);
  const [addressInput, setAddressInput] = useState<string | undefined>(address);
  const { networkName } = useNetworkContext();
  const addressBook = useSelector((state: RootState) => state.userPreferences.addressBook);
  const [labelInputErrorMessage, setLabelInputErrorMessage] = useState('');
  const [addressInputErrorMessage, setAddressInputErrorMessage] = useState('');
  const { fetchWalletAddresses } = useWalletAddress();
  const [walletAddress, setWalletAddress] = useState<string[]>([]);

  const validateLabelInput = (input: string): boolean => {
    if (input !== undefined && input.trim().length > 40) {
      setLabelInputErrorMessage('Address label is too long (max 40 characters)');
      return false;
    }
    if (input.trim() === '') {
      setLabelInputErrorMessage('Please enter an address label');
      return false;
    }
    setLabelInputErrorMessage('');
    return true;
  };

  const onQrButtonPress = (): void => {
    navigation.navigate({
      name: 'BarCodeScanner',
      params: {
        onQrScanned: (value) => {
          setAddressInput(value);
        },
      },
      merge: true,
    });
  };

  const validateAddressInput = (input: string): boolean => {
    const decodedAddress = fromAddress(input, networkName);
    if (decodedAddress === undefined) {
      setAddressInputErrorMessage('Please enter a valid address');
      return false;
    }
    if (
      (addressBook?.[input.trim()] !== undefined && (isAddNew || (!isAddNew && input.trim() !== address))) ||
      walletAddress.includes(input.trim())
    ) {
      // check for unique address when adding new, or only when new address is different from current during edit
      // or when address exists in local address
      setAddressInputErrorMessage('This address already exists in your address book, please enter a different address');
      return false;
    }
    setAddressInputErrorMessage('');
    return true;
  };

  const isSaveDisabled = (): boolean => {
    if (!isAddNew && address === addressInput && addressLabel?.label === labelInput) {
      return true;
    }
    if (
      addressInput === undefined ||
      labelInput === undefined ||
      labelInputErrorMessage !== '' ||
      addressInputErrorMessage !== ''
    ) {
      return true;
    }
    return false;
  };

  // Passcode prompt
  const dispatch = useAppDispatch();
  const {
    data: { type: encryptionType },
  } = useWalletNodeContext();
  const isEncrypted = encryptionType === 'MNEMONIC_ENCRYPTED';
  const logger = useLogger();
  const handleSubmit = async (): Promise<void> => {
    if (
      !isEncrypted ||
      addressInput === undefined ||
      labelInput === undefined ||
      !validateLabelInput(labelInput) ||
      !validateAddressInput(addressInput)
    ) {
      return;
    }

    const auth: Authentication<string[]> = {
      consume: async (passphrase) => await MnemonicStorage.get(passphrase),
      onAuthenticated: async () => {
        const editedAddress = {
          [addressInput]: {
            address: addressInput,
            label: labelInput,
            isMine: false,
            isFavourite: addressLabel?.isFavourite,
          },
        };

        if (!isAddNew && address !== undefined && address !== addressInput.trim()) {
          // delete current address if changing to a new address during edit
          dispatch(userPreferences.actions.deleteFromAddressBook(address));
        }
        dispatch(userPreferences.actions.addToAddressBook(editedAddress));
        onSaveButtonPress(addressInput);
        navigation.pop();
      },
      onError: (e) => logger.error(e),
      title: translate('screens/Settings', 'Sign to save address'),
      message: translate('screens/Settings', 'Enter passcode to continue'),
      loading: translate('screens/Settings', 'Verifying access'),
    };
    dispatch(authentication.actions.prompt(auth));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle text={translate('screens/AddOrEditAddressBookScreen', title)} />,
    });
  }, [navigation]);

  useEffect(() => {
    // validate on QR scan
    if (addressInput === undefined) {
      return;
    }
    validateAddressInput(addressInput);
  }, [addressInput]);

  useEffect(() => {
    let isSubscribed = true;
    void fetchWalletAddresses().then((walletAddress) => {
      if (isSubscribed) {
        setWalletAddress(walletAddress);
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, [fetchWalletAddresses]);

  return (
    <ThemedView style={tailwind('p-4 pt-6 flex-1')}>
      <View style={tailwind('mb-6')}>
        <WalletTextInput
          value={addressInput}
          autoCapitalize="none"
          multiline
          inputType="default"
          displayClearButton={addressInput !== '' && addressInput !== undefined}
          onChangeText={(text: string) => {
            setAddressInput(text);
            validateAddressInput(text);
          }}
          onClearButtonPress={() => {
            setAddressInput('');
            validateAddressInput('');
          }}
          placeholder={translate('screens/AddOrEditAddressBookScreen', 'Wallet address')}
          style={tailwind('w-6/12 flex-grow')}
          valid={addressInputErrorMessage === ''}
          inlineText={{
            type: 'error',
            text: translate('screens/AddOrEditAddressBookScreen', addressInputErrorMessage),
          }}
          title={translate('screens/AddOrEditAddressBookScreen', 'Enter address')}
          testID="address_book_address_input"
        >
          <ThemedTouchableOpacity
            dark={tailwind('bg-dfxblue-800 border-gray-400')}
            light={tailwind('bg-white border-gray-300')}
            onPress={onQrButtonPress}
            style={tailwind('w-9 p-1.5 border rounded')}
            testID="qr_code_button"
          >
            <ThemedIcon
              dark={tailwind('text-dfxred-500')}
              iconType="MaterialIcons"
              light={tailwind('text-primary-500')}
              name="qr-code-scanner"
              size={24}
            />
          </ThemedTouchableOpacity>
        </WalletTextInput>
      </View>
      <WalletTextInput
        value={labelInput}
        inputType="default"
        displayClearButton={labelInput !== '' && labelInput !== undefined}
        onChangeText={(text: string) => {
          setLabelInput(text);
          validateLabelInput(text);
        }}
        onClearButtonPress={() => {
          setLabelInput('');
          validateLabelInput('');
        }}
        placeholder={translate('screens/AddOrEditAddressBookScreen', 'Address label')}
        style={tailwind('h-9 w-6/12 flex-grow')}
        valid={labelInputErrorMessage === ''}
        inlineText={{
          type: 'error',
          text: translate('screens/AddOrEditAddressBookScreen', labelInputErrorMessage),
        }}
        title={translate('screens/AddOrEditAddressBookScreen', 'Enter address label')}
        testID="address_book_label_input"
      />
      <ThemedText
        style={tailwind('text-xs mt-1')}
        light={tailwind('text-gray-500')}
        dark={tailwind('text-dfxgray-400')}
      >
        {translate('screens/AddOrEditAddressBookScreen', 'Required field, max. 40 characters')}
      </ThemedText>

      <View style={tailwind('mt-4 -mx-4')}>
        <SubmitButtonGroup
          isDisabled={isSaveDisabled()}
          isCancelDisabled={false}
          label={translate('screens/AddOrEditAddressBookScreen', 'CONTINUE')}
          displayCancelBtn={false}
          onSubmit={handleSubmit}
          title="save_address_label"
        />
      </View>
    </ThemedView>
  );
}
