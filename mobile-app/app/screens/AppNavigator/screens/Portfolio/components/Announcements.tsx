import { ThemedText, ThemedView } from '@components/themed';
import { tailwind } from '@tailwind';
import { useGetAnnouncementsQuery } from '@store/website';
import { AnnouncementChannel, AnnouncementData } from '@shared-types/website';
import { satisfies } from 'semver';
import { useLanguageContext } from '@shared-contexts/LanguageProvider';
import { openURL } from '@api/linking';
import { Platform, TouchableOpacity } from 'react-native';
import { nativeApplicationVersion } from 'expo-application';
import { translate } from '@translations';
import { useDisplayAnnouncement } from '../hooks/DisplayAnnouncement';
import { useEffect, useState } from 'react';
import { useApiStatus } from '@hooks/useApiStatus';
import { blockChainIsDownContent, useDeFiChainStatus } from '../hooks/DeFiChainStatus';
import { IconProps } from '@expo/vector-icons/build/createIconSet';
import { useThemeContext } from '@shared-contexts/ThemeProvider';
import { MaterialIcons } from '@expo/vector-icons';
import { useServiceProviderContext } from '@contexts/StoreServiceProvider';

export function Announcements({ channel }: { channel?: AnnouncementChannel }): JSX.Element {
  const { data: announcements, isSuccess } = useGetAnnouncementsQuery({});

  const { language } = useLanguageContext();
  const { hiddenAnnouncements, hideAnnouncement } = useDisplayAnnouncement();

  const { blockchainStatusAnnouncement, oceanStatusAnnouncement } = useDeFiChainStatus();

  const { isCustomUrl } = useServiceProviderContext();

  const { isBlockchainDown } = useApiStatus();

  const customServiceProviderIssue: AnnouncementData[] = [
    {
      lang: {
        en: 'We have detected issues with your custom endpoint that is affecting your connection. You are advised to check on the status of your custom endpoint provider',
        de: 'Wir haben Probleme mit deinem benutzerdefinierten Endpunkt festgestellt, die deine Verbindung beeinträchtigen. Wir empfehlen, den Status deines benutzerdefinierten Endpunktanbieters zu überprüfen.',
        'zh-Hans': '我们侦测到您目前使用的自定义终端点会影响到您的连接问题。建议您与供应者检查其连接状态。 ',
        'zh-Hant': '我們偵測到您目前使用的自定義終端點會影響到您的連接問題。 建議您與供應者檢查其連接狀態。',
        fr: "Nous avons détecté des problèmes avec votre point de terminaison personnalisé qui affectent votre connexion. Nous vous conseillons de vérifier le statut de votre fournisseur de point d'accès personnalisé.",
        es: 'We have detected issues with your custom endpoint that is affecting your connection. You are advised to check on the status of your custom endpoint provider',
        it: 'We have detected issues with your custom endpoint that is affecting your connection. You are advised to check on the status of your custom endpoint provider',
      },
      version: '0.0.0',
      type: 'EMERGENCY',
    },
  ];

  const [emergencyMsgContent, setEmergencyMsgContent] = useState<AnnouncementData[] | undefined>();

  const emergencyAnnouncement = findDisplayedAnnouncementForVersion(
    '0.0.0',
    language,
    hiddenAnnouncements,
    emergencyMsgContent,
  );
  const blockchainIsDownAnnouncement = findDisplayedAnnouncementForVersion(
    '0.0.0',
    language,
    hiddenAnnouncements,
    blockchainStatusAnnouncement,
  );
  const oceanIsDownAnnouncement = findDisplayedAnnouncementForVersion(
    '0.0.0',
    language,
    hiddenAnnouncements,
    oceanStatusAnnouncement,
  );
  const announcement = findDisplayedAnnouncementForVersion(
    nativeApplicationVersion ?? '0.0.0',
    language,
    hiddenAnnouncements,
    announcements,
  );
  const channelAnnouncement = findDisplayedAnnouncementForVersion(
    nativeApplicationVersion ?? '0.0.0',
    language,
    hiddenAnnouncements,
    announcements,
    channel,
  );

  /*
    Display priority:
    1. Emergencies - Custom Provider/Blockchain Issue
    2. Outages - Blockchain API
    3. Outages - Ocean API
    4. Other announcements
  */
  const announcementToDisplay =
    channel != null
      ? channelAnnouncement
      : emergencyAnnouncement ?? blockchainIsDownAnnouncement ?? oceanIsDownAnnouncement ?? announcement;

  useEffect(() => {
    // To display warning message in Announcement banner when blockchain is down for > 45 mins
    if (isBlockchainDown && !isCustomUrl) {
      return setEmergencyMsgContent(blockChainIsDownContent);
    } else if (isBlockchainDown && isCustomUrl) {
      return setEmergencyMsgContent(customServiceProviderIssue);
    } else {
      return setEmergencyMsgContent(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBlockchainDown]);

  if (!isSuccess || announcementToDisplay === undefined) {
    return <></>;
  }

  return (
    <AnnouncementBanner
      announcement={announcementToDisplay}
      hideAnnouncement={hideAnnouncement}
      testID="announcements_banner"
    />
  );
}

interface AnnouncementBannerProps {
  hideAnnouncement?: (id: string) => void;
  announcement: Announcement;
  testID: string;
}

export function AnnouncementBanner({ hideAnnouncement, announcement, testID }: AnnouncementBannerProps): JSX.Element {
  const { isLight } = useThemeContext();
  const icons: { [key in AnnouncementData['type']]: IconProps<any>['name'] } = {
    EMERGENCY: 'warning',
    OTHER_ANNOUNCEMENT: 'campaign',
    OUTAGE: 'warning',
    SCAN: 'campaign',
  };
  const isOtherAnnouncement = announcement.type === undefined || announcement.type === 'OTHER_ANNOUNCEMENT';

  return (
    <ThemedView
      testID={testID}
      style={tailwind('px-4 py-3 flex-row items-center')}
      light={tailwind({
        'bg-primary-700': isOtherAnnouncement,
        'bg-warning-100': !isOtherAnnouncement,
      })}
      dark={tailwind('bg-dfxblue-900')}
    >
      {announcement.id !== undefined && (
        <MaterialIcons
          style={tailwind([
            'mr-1',
            {
              'text-dfxblue-500': !isLight || isOtherAnnouncement,
              'text-gray-900': !(!isLight || isOtherAnnouncement),
            },
          ])}
          iconType="MaterialIcons"
          name="close"
          size={18}
          onPress={() => {
            if (announcement.id === undefined) {
              return;
            }
            if (hideAnnouncement !== undefined) {
              hideAnnouncement(announcement.id);
            }
          }}
          testID="close_announcement"
        />
      )}

      <MaterialIcons
        style={tailwind([
          'mr-2.5',
          {
            'text-warning-600': isLight,
            'text-dfxblue-500': !isLight,
          },
        ])}
        iconType="MaterialIcons"
        name={icons[announcement.type ?? 'OTHER_ANNOUNCEMENT']}
        size={icons[announcement.type ?? 'OTHER_ANNOUNCEMENT'] === 'warning' ? 24 : 28}
      />
      <ThemedText
        style={tailwind('text-xs flex-auto text-white')}
        dark={tailwind('text-dfxblue-500')}
        testID="announcements_text"
      >
        {`${announcement.content} `}
      </ThemedText>
      {announcement.url !== undefined && announcement.url.length !== 0 && (
        <TouchableOpacity onPress={async () => await openURL(announcement.url)} style={tailwind('ml-2 py-1')}>
          <ThemedText
            style={tailwind('text-sm font-medium')}
            light={tailwind({
              'text-white': isOtherAnnouncement,
              'text-warning-600': !isOtherAnnouncement,
            })}
            dark={tailwind({
              'text-white': isOtherAnnouncement,
              'text-dfxblue-500': !isOtherAnnouncement,
            })}
          >
            {translate('components/Announcements', 'DETAILS')}
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

export interface Announcement {
  content: string;
  url: string;
  id?: string;
  type: AnnouncementData['type'];
  channel?: AnnouncementChannel;
}

export function findDisplayedAnnouncementForVersion(
  version: string,
  language: string,
  hiddenAnnouncements: string[],
  announcements?: AnnouncementData[],
  channel?: AnnouncementChannel,
): Announcement | undefined {
  if (announcements === undefined || announcements.length === 0) {
    return;
  }

  const activeAnnouncements = [];
  for (const announcement of announcements) {
    const lang: any = announcement.lang;
    const platformUrl: any = announcement.url;

    if (
      ((Platform.OS !== 'ios' && Platform.OS !== 'android') || satisfies(version, announcement.version)) &&
      getDisplayAnnouncement(hiddenAnnouncements, announcement)
    ) {
      activeAnnouncements.push({
        content: lang[language] ?? lang.en,
        url: platformUrl !== undefined ? platformUrl[Platform.OS] : undefined,
        id: announcement.id,
        type: announcement.type,
        channel: announcement.channel,
      });
    }
  }
  if (activeAnnouncements.length < 1) {
    return undefined;
  }

  if (channel != null) {
    // return first active corresponding channel announcement
    return activeAnnouncements.find((announcement) => announcement.channel === channel);
  } else {
    // return first active general announcement
    return activeAnnouncements.find((announcement) => announcement.channel === undefined);
  }
}

function getDisplayAnnouncement(hiddenAnnouncements: string[], announcement: AnnouncementData): boolean {
  if (announcement === undefined) {
    return false;
  }

  if (hiddenAnnouncements.length > 0 && announcement.id !== undefined) {
    return !hiddenAnnouncements.includes(announcement.id);
  }

  return true;
}
