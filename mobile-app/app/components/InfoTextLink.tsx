import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { StyleProp, TextStyle, TouchableOpacity, ViewStyle } from 'react-native'
import { ThemedIcon, ThemedText, ThemedTextV2, ThemedTouchableOpacityV2 } from './themed'

interface InfoTextLinkProps {
  onPress: () => void
  text: string
  testId?: string
  containerStyle?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

export function InfoTextLink (props: InfoTextLinkProps): JSX.Element {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={[tailwind('flex-row items-end justify-start'), props.containerStyle]}
      testID={props.testId}
    >
      <ThemedIcon
        dark={tailwind('text-darkprimary-500')}
        iconType='MaterialIcons'
        light={tailwind('text-primary-500')}
        name='help'
        size={16}
      />

      <ThemedText
        dark={tailwind('text-darkprimary-500')}
        light={tailwind('text-primary-500')}
        style={[tailwind('ml-1 text-xs font-medium px-1'), props.textStyle]}
      >
        {translate('components/InfoTextLink', props.text)}
      </ThemedText>
    </TouchableOpacity>
  )
}

export function InfoTextLinkV2 (props: InfoTextLinkProps): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      onPress={props.onPress}
      style={[tailwind('flex-row items-end justify-start'), props.containerStyle]}
      testID={props.testId}
    >
      <ThemedIcon
        dark={tailwind('text-mono-dark-v2-900')}
        light={tailwind('text-mono-light-v2-900')}
        iconType='MaterialIcons'
        name='help'
        size={16}
      />
      <ThemedTextV2
        style={[tailwind('ml-1 text-xs font-medium-v2 px-1'), props.textStyle]}
      >
        {translate('components/InfoTextLink', props.text)}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  )
}
