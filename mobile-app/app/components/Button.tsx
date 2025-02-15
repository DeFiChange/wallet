import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useThemeContext } from '@shared-contexts/ThemeProvider';
import { tailwind } from '@tailwind';
import { Text } from './Text';
import { ThemedActivityIndicator } from '@components/themed';

export type ButtonColorType = 'primary' | 'secondary';
export type ButtonFillType = 'fill' | 'outline' | 'flat';

interface ButtonProps extends React.PropsWithChildren<TouchableOpacityProps> {
  color?: ButtonColorType;
  fill?: ButtonFillType;
  label?: string;
  margin?: string;
  padding?: string;
  title?: string;
  isSubmitting?: boolean;
  submittingLabel?: string;
  lock?: boolean;
  grow?: boolean;
}

export function Button(props: ButtonProps): JSX.Element {
  const {
    label,
    submittingLabel,
    color = 'primary',
    fill = 'fill',
    margin = 'm-4 mt-8',
    padding = 'p-3',
    isSubmitting = false,
    lock = false,
    grow = false,
  } = props;
  const { isLight } = useThemeContext();
  const themedColor = isLight ? `${color}` : `dark${color}`;

  const disabledStyle = lock ? 'bg-gray-200' : isLight ? 'bg-gray-200 border-0' : 'bg-dfxgray-400 border-0';
  const disabledText = lock ? 'text-white' : isLight ? 'text-dfxgray-400' : 'text-dfxgray-500';

  const buttonColor = lock ? 'bg-lock-200' : isLight ? `bg-${themedColor}-50` : 'bg-dfxred-500';
  const buttonStyle = `${fill === 'fill' ? buttonColor : 'bg-transparent'}`;
  const buttonText = isLight ? `text-${themedColor}-500` : `${fill === 'fill' ? 'text-white' : 'text-dfxred-500'}`;

  const textStyle = `${props.disabled === true ? disabledText : buttonText} ${isSubmitting ? 'ml-2' : ''}`;
  const text = isSubmitting ? submittingLabel ?? label : label;

  return (
    <TouchableOpacity
      {...props}
      style={tailwind(
        `${margin} ${padding} rounded flex-row justify-center ${buttonStyle} ${
          props.disabled === true ? disabledStyle : ''
        }`,
        { 'flex-grow': grow },
        { 'bg-lock-500': lock && fill === 'fill' && color === 'secondary' },
        { 'border-1.5 border-lock-400 bg-transparent': lock && fill === 'outline' && color === 'secondary' },
        { 'border-0 bg-transparent': lock && fill === 'flat' && color === 'primary' },
      )}
    >
      {text !== undefined && (
        <>
          {isSubmitting && <ThemedActivityIndicator lock={props.lock} />}
          <Text
            style={tailwind(
              `${textStyle} font-bold text-center`,
              { 'text-lock-100': lock && fill === 'fill' && color === 'secondary' },
              {
                'text-lock-200 font-medium text-base': fill === 'outline' && color === 'secondary',
              },
              { 'text-lock-200 text-base font-medium': lock && fill === 'flat' && color === 'primary' },
            )}
          >
            {text}
          </Text>
        </>
      )}

      {props.children}
    </TouchableOpacity>
  );
}
