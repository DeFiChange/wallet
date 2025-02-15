// import React from 'react'
import { StackScreenProps } from '@react-navigation/stack';
import { StackActions } from '@react-navigation/native';
import {
  ThemedIcon,
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedTextBasic,
  ThemedView,
} from '@components/themed';
import { tailwind } from '@tailwind';
import { translate } from '@translations';
import { PortfolioParamList } from '../PortfolioNavigator';
import { Button } from '@components/Button';
import { FlatList } from 'react-native-gesture-handler';
import BankTransferIcon from '@assets/images/dfx_buttons/misc/BankTransfer.svg';
import React, { useCallback, useEffect, useState } from 'react';
import { InfoText } from '@components/InfoText';
import { View } from '@components';
import { TouchableOpacity } from 'react-native';
import { debounce } from 'lodash';
import * as Clipboard from 'expo-clipboard';
import { SepaInstantComponent } from '../components/SepaInstantComponent';
import { BuySuccessOverlay } from '../components/SepaInstantLayover';
import { useToast } from 'react-native-toast-notifications';

type Props = StackScreenProps<PortfolioParamList, 'BuyConfirmationScreen'>;

export function BuyConfirmationScreen({ route, navigation }: Props): JSX.Element {
  const [showTransferCompleteMessage, setShowTransferCompleteMessage] = useState(false);
  const buttonTitle = translate('screens/BuyConfirmationScreen', 'BANK TRANSFER COMPLETED');

  const buyPaymentInfo = route.params.buyPaymentInfo;

  const paymentInfoList: ListItemProps[] = [
    { title: 'IBAN', detail: buyPaymentInfo.iban },
    { title: 'SWIFT/BIC', detail: buyPaymentInfo.bic },
    { title: 'PURPOSE OF PAYMENT', detail: buyPaymentInfo.remittanceInfo },
    { title: 'BENEFICIARY', detail: buyPaymentInfo.name },
    { detail: `${buyPaymentInfo.street} ${buyPaymentInfo.number}` },
    { detail: `${buyPaymentInfo.zip} ${buyPaymentInfo.city}` },
    { detail: buyPaymentInfo.country },
  ];

  const transactionDetailList: ListItemProps[] = [
    { title: 'You are buying', detail: route.params.transactionDetails.token },
    { title: 'Your IBAN', detail: route.params.transactionDetails.iban },
    {
      title: 'Transaction Fee',
      detail:
        buyPaymentInfo.minFee > 0
          ? `${buyPaymentInfo.fee}% (min. ${buyPaymentInfo.minFee} ${route.params.transactionDetails.currency})`
          : `${buyPaymentInfo.fee}%`,
    },
  ];

  return (
    <ThemedScrollView style={tailwind('flex-col h-full text-lg')}>
      <View style={tailwind('mx-4')}>
        <BankTransferIcon style={tailwind('mt-4 self-center')} />

        <ThemedSectionTitle
          dark={tailwind('text-dfxred-500')}
          testID="network_title"
          text={translate('screens/BuyConfirmationScreen', 'PAYMENT INFORMATION')}
        />
        <ThemedView dark={tailwind('bg-dfxblue-800 rounded-md border border-dfxblue-900')}>
          <List list={paymentInfoList} copyIcon />
        </ThemedView>

        <InfoText
          testID="dfx_kyc_info"
          text={translate(
            'screens/BuyConfirmationScreen',
            'Please transfer the purchase amount using this information. The payment purpose is important and also that the payment is executed from your stored IBAN!',
          )}
          style={tailwind('mt-4')}
          noBorder
        />

        <ThemedSectionTitle testID="network_title" text={translate('screens/SendScreen', 'TRANSACTION DETAILS')} />
        <ThemedView dark={tailwind('rounded-md border-2 border-dfxblue-800')}>
          <List list={transactionDetailList} sepaInstant={route.params.buyPaymentInfo.sepaInstant} />
        </ThemedView>

        <Button
          fill="fill"
          label={buttonTitle}
          margin="m-8 mb-24"
          onPress={() => setShowTransferCompleteMessage(true)}
          testID={`button_finish_${buttonTitle}`}
          title={buttonTitle}
          style={tailwind('flex')}
        />
      </View>

      {showTransferCompleteMessage && (
        <BuySuccessOverlay onDismiss={() => navigation.dispatch(StackActions.popToTop())} />
      )}
    </ThemedScrollView>
  );
}

interface ListProps {
  list: ListItemProps[];
  copyIcon?: boolean;
  sepaInstant?: boolean;
}
function List({ list, copyIcon, sepaInstant }: ListProps): JSX.Element {
  return (
    <FlatList
      data={list}
      renderItem={({ item }) => (
        <ListItem title={item.title} detail={item.detail} copyIcon={copyIcon} sepaInstant={sepaInstant} />
      )}
      scrollEnabled={false}
    />
  );
}

interface ListItemProps {
  title?: string;
  detail: string;
  copyIcon?: boolean;
  sepaInstant?: boolean;
}
function ListItem({ title, detail, copyIcon, sepaInstant = false }: ListItemProps): JSX.Element {
  const [showToast, setShowToast] = useState(false);
  const toast = useToast();
  const TOAST_DURATION = 2000;

  const copyToClipboard = useCallback(
    debounce(() => {
      if (showToast) {
        return;
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), TOAST_DURATION);
    }, 500),
    [showToast],
  );

  useEffect(() => {
    if (showToast) {
      toast.show(translate('components/toaster', 'Copied'), {
        type: 'wallet_toast',
        placement: 'top',
        duration: TOAST_DURATION,
      });
    } else {
      toast.hideAll();
    }
  }, [showToast]);

  return (
    <ThemedView dark={tailwind('flex px-4 border-b border-dfxblue-900', copyIcon ?? false ? ' py-2' : 'py-1')}>
      {/* TITLE Section ('IBAN' + SEPA instant?) */}
      {title != null && (
        <View style={tailwind('flex-row')}>
          <ThemedText dark={tailwind('text-xs text-dfxgray-400')}>
            {translate('screens/BuyConfirmationScreen', title)}
          </ThemedText>

          {title === 'Your IBAN' && sepaInstant && <SepaInstantComponent widget />}
        </View>
      )}

      {/* DETAIL Section ('DFX AG' + pasteIcon?) */}
      <View style={tailwind('flex-row')}>
        <ThemedTextBasic selectable style={tailwind('text-lg')}>
          {translate('screens/BuyConfirmationScreen', detail)}
        </ThemedTextBasic>

        {copyIcon === true && (
          <TouchableOpacity
            onPress={() => {
              copyToClipboard();
              Clipboard.setString(detail);
            }}
            style={tailwind('flex flex-1 flex-row justify-center text-center items-center')}
            testID="copy_button"
          >
            <View style={tailwind('flex-grow')} />
            <ThemedIcon
              dark={tailwind('text-dfxred-500')}
              iconType="MaterialIcons"
              light={tailwind('text-primary-500')}
              name="content-copy"
              size={18}
              style={tailwind('self-center')}
            />
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}
