import { NavigationProp, useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import { View } from '@components/index';
import { CREATE_STEPS, CreateWalletStepIndicator, RESTORE_STEPS } from '@components/CreateWalletStepIndicator';
import { PinTextInput } from '@components/PinTextInput';
import { ThemedScrollView, ThemedText, ThemedTouchableOpacity } from '@components/themed';
import { tailwind } from '@tailwind';
import { translate } from '@translations';
import { WalletParamList } from '../../WalletNavigator';

type Props = StackScreenProps<WalletParamList, 'PinCreation'>;

export function PinCreation({ route }: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<WalletParamList>>();
  const { pinLength, words, type } = route.params;
  const [newPin, setNewPin] = useState('');
  const goToPasscodeFaq = (): void => {
    navigation.navigate('PasscodeFaq');
  };

  useEffect(() => {
    if (newPin.length !== pinLength) {
      return;
    }

    setNewPin('');
    navigation.navigate({
      name: 'PinConfirmation',
      params: { words, pin: newPin, type },
      merge: true,
    });
  }, [newPin]);

  return (
    <ThemedScrollView
      dark={tailwind('bg-dfxblue-900')}
      light={tailwind('bg-white')}
      style={tailwind('w-full flex-1 flex-col')}
      contentContainerStyle={tailwind('items-center')}
      testID="screen_create_pin"
    >
      <CreateWalletStepIndicator
        current={1}
        steps={type === 'create' ? CREATE_STEPS : RESTORE_STEPS}
        style={tailwind('py-4 px-1')}
      />

      <View style={tailwind('px-6 py-4 mb-12 flex items-center')}>
        <ThemedText style={tailwind('text-center font-semibold')}>
          {translate('screens/PinCreation', `Well done! Your wallet is ${type === 'create' ? 'created' : 'restored'}.`)}
        </ThemedText>
        <ThemedText light={tailwind('text-gray-500')} dark={tailwind('text-dfxgray-300')} style={tailwind('text-xs')}>
          {translate('screens/PinCreation', 'Create new passcode')}
        </ThemedText>
      </View>

      <PinTextInput cellCount={6} onChange={setNewPin} testID="pin_input" value={newPin} />

      <ThemedTouchableOpacity
        onPress={goToPasscodeFaq}
        light={tailwind('border-0')}
        dark={tailwind('border-0')}
        style={tailwind('w-4/5 pt-6')}
        testID="passcode_faq_link"
      >
        <ThemedText
          style={tailwind('text-center text-sm font-semibold')}
          light={tailwind('text-primary-500')}
          dark={tailwind('text-dfxred-500')}
        >
          {translate('screens/PinCreation', 'Learn more about passcode')}
        </ThemedText>
      </ThemedTouchableOpacity>
    </ThemedScrollView>
  );
}
