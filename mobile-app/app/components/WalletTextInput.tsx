import React, { forwardRef, useCallback, useState } from 'react';
import { Platform, TextInputProps, TouchableOpacity } from 'react-native';
import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import {
  ThemedView,
  ThemedText,
  ThemedTextInput,
  ThemedIcon,
  ThemedSectionTitle,
  ThemedTouchableOpacity,
  ThemedProps,
} from '@components/themed';
import { tailwind } from '@tailwind';
import { View } from '@components';
import { translate } from '@translations';

type WalletTextInputProps = React.PropsWithChildren<TextInputProps> & IWalletTextInputProps;
export type InputType = 'default' | 'numeric';

interface IWalletTextInputProps {
  inputType: InputType;
  title?: string;
  titleTestID?: string;
  valid?: boolean;
  inlineText?: {
    type: 'error' | 'helper';
    text?: string | JSX.Element;
  };
  displayClearButton?: boolean;
  onClearButtonPress?: () => void;
  displayFocusStyle?: boolean;
  containerStyle?: string;
  onBlur?: () => void;
  hasBottomSheet?: boolean;
  pasteButton?: {
    isPasteDisabled: boolean;
    onPasteButtonPress: () => void;
  };
  inputFooter?: React.ReactElement;
  displayTickIcon?: boolean;
  lock?: boolean;
}

export const WalletTextInput = forwardRef<any, WalletTextInputProps>(function (
  props: WalletTextInputProps,
  ref: React.Ref<any>,
): JSX.Element {
  const [isFocus, setIsFocus] = useState(false);
  const {
    title,
    titleTestID,
    valid = true,
    inlineText,
    displayClearButton = false,
    onClearButtonPress,
    editable = true,
    children,
    containerStyle,
    onBlur,
    hasBottomSheet,
    pasteButton,
    inputFooter,
    displayTickIcon,
    lock = false,
    ...otherProps
  } = props;

  const textInputComponents = {
    ios: TextInputIOS,
    default: TextInputDefault,
  };
  const TextInput =
    Platform.OS === 'ios' && hasBottomSheet === true ? textInputComponents.ios : textInputComponents.default;

  const hasClearButton = (): boolean => {
    return displayClearButton && onClearButtonPress !== undefined;
  };

  return (
    <ThemedView
      light={tailwind('bg-transparent')}
      dark={tailwind('bg-transparent')}
      style={tailwind(`${containerStyle ?? 'w-full flex-col'}`)}
    >
      {title !== undefined && (
        <View style={tailwind('flex flex-row justify-between items-center')}>
          <ThemedSectionTitle
            light={tailwind('text-gray-700')}
            dark={tailwind('text-gray-200')}
            testID={titleTestID}
            text={title}
            style={tailwind('text-base')}
          />
          {pasteButton?.onPasteButtonPress !== undefined && (
            <TouchableOpacity
              // eslint-disable-next-line
              onPress={pasteButton.onPasteButtonPress}
              disabled={pasteButton.isPasteDisabled}
            >
              <ThemedText
                style={tailwind('text-sm font-medium')}
                light={tailwind('text-primary-500', { 'text-gray-300': pasteButton.isPasteDisabled })}
                dark={tailwind('text-dfxred-500', { 'text-gray-700': pasteButton.isPasteDisabled })}
              >
                {translate('components/WalletTextInput', 'Paste')}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}
      <ThemedView
        light={tailwind('bg-white', {
          'border-error-500': !valid,
          'border-primary-300': valid && isFocus && !lock,
          'border-dfxgray-300': valid && !isFocus && !lock,
          'border-lockGray-100': valid && lock,
        })} // disabled border color is the same regardless of theme
        dark={tailwind('bg-white', {
          'border-darkerror-500': !valid,
          'bg-dfxblue-800': valid && !lock,
          'border-dfxred-500': valid && isFocus && !lock,
          'border-dfxblue-900': valid && !isFocus && !lock,
          'bg-white border-lockGray-100': valid && lock,
        })}
        style={tailwind(lock ? 'border rounded-md' : 'border rounded', 'flex-col w-full mt-2', {
          'mt-0': lock && props.multiline,
        })}
      >
        <ThemedView
          light={tailwind(`${editable ? 'bg-transparent' : 'bg-gray-200'}`)}
          dark={tailwind('bg-transparent')}
          style={[tailwind('flex-row items-center p-2 justify-between'), props.multiline === true && { minHeight: 54 }]}
        >
          <TextInput
            onFocus={() => setIsFocus(true)}
            onBlur={() => {
              if (onBlur !== undefined) {
                onBlur();
              }

              setIsFocus(false);
            }}
            ref={ref}
            editable={editable}
            {...otherProps}
            lock={props.lock}
          />
          {displayTickIcon === true && (
            <ThemedIcon
              size={18}
              name="check"
              iconType="MaterialIcons"
              light={tailwind('text-success-600')}
              dark={tailwind('text-darksuccess-600')}
            />
          )}
          {hasClearButton() && (
            <ClearButton
              onPress={onClearButtonPress}
              testID={props.testID !== undefined ? `${props.testID}_clear_button` : undefined}
              lock={lock}
            />
          )}
          {children}
        </ThemedView>
        <View>{inputFooter}</View>
      </ThemedView>
      {inlineText?.type === 'error' && !valid && (
        <ThemedText
          light={tailwind('text-error-500')}
          dark={tailwind('text-darkerror-500')}
          style={tailwind('text-sm my-1')}
          testID={props.testID !== undefined ? `${props.testID}_error` : undefined}
        >
          {inlineText?.text}
        </ThemedText>
      )}
      {inlineText?.type === 'helper' && typeof inlineText?.text === 'string' && (
        <ThemedText
          light={tailwind('text-error-500')}
          dark={tailwind('text-darkerror-500')}
          style={tailwind('text-sm my-1')}
          testID={props.testID !== undefined ? `${props.testID}_error` : undefined}
        >
          {inlineText?.text}
        </ThemedText>
      )}

      {inlineText?.type === 'helper' && typeof inlineText?.text !== 'string' && inlineText?.text}
    </ThemedView>
  );
});

export function ClearButton(props: {
  onPress?: () => void;
  testID?: string;
  iconThemedProps?: ThemedProps;
  lock?: boolean;
}): JSX.Element {
  return (
    <ThemedTouchableOpacity
      testID={props.testID}
      light={tailwind('bg-transparent')}
      dark={tailwind('bg-transparent')}
      style={tailwind('relative py-0.5 px-2')}
      onPress={props.onPress}
    >
      <ThemedView
        light={tailwind('bg-dfxblue-800')}
        dark={tailwind('bg-blue-100')}
        style={tailwind('top-2 left-3 rounded-full absolute w-9/12 h-4 -z-1', { 'w-5/12': Platform.OS === 'web' })}
      />
      <ThemedIcon
        iconType="MaterialIcons"
        name="cancel"
        size={28}
        light={tailwind('text-gray-100', { 'text-lock-200': props.lock })}
        dark={tailwind('text-dfxblue-900', { 'text-lock-200': props.lock })}
        {...props.iconThemedProps}
      />
    </ThemedTouchableOpacity>
  );
}

const TextInputDefault = forwardRef((props: WalletTextInputProps, ref: React.Ref<any>) => {
  const { inputType, ...otherProps } = props;
  return <ThemedTextInput keyboardType={inputType} ref={ref} {...otherProps} lock={props.lock} />;
});

const TextInputIOS = forwardRef((props: WalletTextInputProps, ref: React.Ref<any>) => {
  const { inputType, onBlur, onFocus, ...otherProps } = props;
  const { shouldHandleKeyboardEvents } = useBottomSheetInternal();
  const handleOnFocus = useCallback(
    (e) => {
      shouldHandleKeyboardEvents.value = true;

      if (onFocus !== undefined) {
        onFocus(e);
      }
    },
    [shouldHandleKeyboardEvents],
  );
  const handleOnBlur = useCallback(() => {
    shouldHandleKeyboardEvents.value = true;

    if (onBlur !== undefined) {
      onBlur();
    }
  }, [shouldHandleKeyboardEvents]);

  return (
    <ThemedTextInput
      keyboardType={inputType}
      ref={ref}
      onBlur={handleOnBlur}
      onFocus={handleOnFocus}
      {...otherProps}
      lock={props.lock}
    />
  );
});
