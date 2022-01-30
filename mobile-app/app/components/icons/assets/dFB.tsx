import * as React from 'react'
import Svg, { Path, SvgProps } from 'react-native-svg'

export function dFB (props: SvgProps): JSX.Element {
  return (
    <Svg
      height={32}
      width={32}
      viewBox='0 0 32 32'
      {...props}
    >
      <Path
        fillRule='evenodd' clipRule='evenodd'
        d='M16 0C7.163 0 0 7.163 0 16C0 24.837 7.163 32 16 32C24.838 32 32 24.837 32 16C32 7.163 24.838 0 16 0Z'
        fill='#4460A0'
      />
      <Path d='M9.33301 12V20H11.0921V16.6947H14.4423V15.3277H11.0921V13.479H14.9577V12H9.33301Z' fill='white' />
      <Path
        d='M17.7831 15.2381V13.3669H19.4302C19.5871 13.3669 19.7364 13.3819 19.8784 13.4118C20.0278 13.4342 20.1585 13.479 20.2705 13.5462C20.3826 13.6134 20.4722 13.7068 20.5394 13.8263C20.6067 13.9458 20.6403 14.099 20.6403 14.2857C20.6403 14.6218 20.5394 14.8646 20.3378 15.014C20.1361 15.1634 19.8784 15.2381 19.5646 15.2381H17.7831ZM16.024 12V20H19.9008C20.2593 20 20.6067 19.9552 20.9428 19.8655C21.2864 19.7759 21.5889 19.6377 21.8504 19.451C22.1193 19.2642 22.3322 19.0252 22.489 18.7339C22.6459 18.4351 22.7243 18.084 22.7243 17.6807C22.7243 17.1802 22.6011 16.7544 22.3546 16.4034C22.1155 16.0448 21.7495 15.7946 21.2565 15.6527C21.6151 15.4809 21.884 15.2605 22.0632 14.9916C22.25 14.7227 22.3434 14.3866 22.3434 13.9832C22.3434 13.6097 22.2799 13.296 22.1529 13.042C22.0334 12.788 21.8616 12.5864 21.6375 12.437C21.4134 12.2801 21.1445 12.1681 20.8307 12.1008C20.517 12.0336 20.1697 12 19.7887 12H16.024ZM17.7831 18.6331V16.437H19.6991C20.08 16.437 20.3863 16.5266 20.6179 16.7059C20.8494 16.8777 20.9652 17.169 20.9652 17.5798C20.9652 17.789 20.9279 17.9608 20.8532 18.0952C20.7859 18.2297 20.6926 18.338 20.573 18.4202C20.4535 18.4949 20.3153 18.5509 20.1585 18.5882C20.0016 18.6181 19.8373 18.6331 19.6655 18.6331H17.7831Z'
        fill='white'
      />
    </Svg>
  )
}