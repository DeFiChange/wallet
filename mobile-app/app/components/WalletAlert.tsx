// import { Logging } from '@api'
import { Logging } from '@api';
import { translate } from '@translations';
import { Alert, AlertButton, AlertOptions, Platform } from 'react-native';

export interface CustomAlertOption {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  options?: AlertOptions;
}

/**
 * Alert that supports web and native.
 *
 * @param option Same param as react native's `Alert.alert()`.
 *
 * ## Web
 *
 * Using `window.alert()` for single button and `window.confirm()` for two buttons.
 *
 * Limitations:
 * - does not support Android-only's third button
 * - does not support custom button text
 * - single button will always has two buttons, in order to implement `onPress` callback
 *
 * ## Native
 *
 * Using react-native's `Alert`.
 *
 * @reference https://github.com/necolas/react-native-web/issues/1026#issuecomment-687572134
 */
export function WalletAlert(option: CustomAlertOption): void {
  if (Platform.OS !== 'web') {
    Alert.alert(option.title, option.message, option.buttons, option.options);
  } else if (option.buttons === undefined || option.buttons.length === 0) {
    window.alert([option.title, option.message].filter(Boolean).join('\n'));
  } else {
    const result = window.confirm([option.title, option.message].filter(Boolean).join('\n'));

    if (result) {
      const confirm = option.buttons.find(({ style }) => style !== 'cancel');
      confirm?.onPress?.();
    }

    const cancel = option.buttons.find(({ style }) => style === 'cancel');
    cancel?.onPress?.();
  }
}

export function WalletAlertErrorApi(apiResponseError: any): void {
  Logging.info(apiResponseError);

  // TODO: (thabrad) check why this throws an exeption
  //   [Unhandled promise rejection: Error: Invalid hook call.Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:]
  // at shared / contexts / NativeLoggingProvider.tsx: 18: 9 in useLogger
  // at mobile - app / app / components / WalletAlert.tsx: 57: 17 in WalletAlertErrorApi
  // -------------------------------
  // const logger = useLogger()
  // logger.info(apiResponseError)
  // -------------------------------

  const errorName = safeAnyUsageStringArrayJsonEmtpyString(apiResponseError?.error);
  const errorMsg = safeAnyUsageStringArrayJsonEmtpyString(apiResponseError?.message);

  WalletAlert({ title: errorName, message: errorMsg });
}

export function WalletAlertNotAvailableInCountry(service: string): void {
  WalletAlert({
    title: translate('screens/PortfolioScreen', 'Availability'),
    message: translate(
      'screens/PortfolioScreen',
      'Unfortunately, {{service}} service is not available in your country.',
      {
        service,
      },
    ),
  });
}

// TODO: (thabrad) move to a Utils lib
export function safeAnyUsageStringArrayJsonEmtpyString(data: any | undefined): string {
  if (data === undefined) {
    return '';
  } else if (typeof data === 'string') {
    return data;
  } else if (Array.isArray(data)) {
    return data.toString();
  } else {
    return JSON.stringify(data);
  }
}
