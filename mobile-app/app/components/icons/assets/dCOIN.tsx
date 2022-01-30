import * as React from 'react'
import Svg, { ClipPath, Defs, G, Path, SvgProps, Rect } from 'react-native-svg'

export function dCOIN (props: SvgProps): JSX.Element {
  return (
    <Svg
      height={32}
      width={32}
      viewBox='0 0 32 32'
      {...props}
    >
      <G clipPath='url(#clip0_1462_4427)'>
        <Path
          fillRule='evenodd' clipRule='evenodd'
          d='M16.5 0C7.663 0 0.5 7.163 0.5 16C0.5 24.837 7.663 32 16.5 32C25.338 32 32.5 24.837 32.5 16C32.5 7.163 25.338 0 16.5 0Z'
          fill='#2150F5'
        />
        <Path
          d='M9.93777 14.7605H11.4966C11.4966 14.479 11.475 14.1795 11.4317 13.862C11.3956 13.5372 11.2982 13.2377 11.1394 12.9635C10.9806 12.682 10.7389 12.4511 10.4141 12.2706C10.0965 12.0902 9.65992 12 9.10421 12C8.51964 12 8.05415 12.101 7.70773 12.3031C7.36132 12.498 7.09429 12.7722 6.90665 13.1258C6.72623 13.4795 6.60715 13.9053 6.54941 14.4032C6.49889 14.894 6.47363 15.4317 6.47363 16.0162C6.47363 16.608 6.49889 17.1493 6.54941 17.6401C6.60715 18.1308 6.72623 18.553 6.90665 18.9066C7.09429 19.2603 7.36132 19.5309 7.70773 19.7185C8.05415 19.9062 8.51964 20 9.10421 20C9.61662 20 10.0316 19.9206 10.3491 19.7618C10.6739 19.6031 10.9229 19.383 11.0961 19.1015C11.2765 18.82 11.3992 18.4917 11.4642 18.1164C11.5291 17.7411 11.5616 17.3442 11.5616 16.9256H10.0027C10.0027 17.3442 9.97747 17.6834 9.92695 17.9432C9.87643 18.1958 9.80787 18.3942 9.72126 18.5386C9.63466 18.6757 9.53002 18.7695 9.40733 18.82C9.29186 18.8633 9.16556 18.885 9.02844 18.885C8.86245 18.885 8.7145 18.8525 8.58459 18.7876C8.46191 18.7154 8.35726 18.5819 8.27066 18.387C8.19127 18.1849 8.12993 17.9035 8.08662 17.5426C8.05054 17.1818 8.0325 16.7091 8.0325 16.1245C8.0325 15.576 8.04693 15.1141 8.0758 14.7388C8.10467 14.3563 8.15518 14.0496 8.22735 13.8187C8.29952 13.5805 8.39695 13.4109 8.51964 13.3099C8.64955 13.2016 8.81193 13.1475 9.00679 13.1475C9.36042 13.1475 9.60218 13.2774 9.73209 13.5372C9.86921 13.7898 9.93777 14.1976 9.93777 14.7605Z'
          fill='white'
        />
        <Path
          d='M13.8946 16.0162C13.8946 15.4966 13.9054 15.0564 13.927 14.6955C13.9559 14.3347 14.0064 14.0388 14.0786 13.8078C14.158 13.5769 14.2662 13.4109 14.4034 13.3099C14.5477 13.2016 14.7353 13.1475 14.9663 13.1475C15.1972 13.1475 15.3813 13.2016 15.5184 13.3099C15.6627 13.4109 15.771 13.5769 15.8432 13.8078C15.9225 14.0388 15.9731 14.3347 15.9947 14.6955C16.0236 15.0564 16.038 15.4966 16.038 16.0162C16.038 16.5359 16.0236 16.9797 15.9947 17.3478C15.9731 17.7086 15.9225 18.0045 15.8432 18.2355C15.771 18.4592 15.6627 18.6252 15.5184 18.7334C15.3813 18.8345 15.1972 18.885 14.9663 18.885C14.7353 18.885 14.5477 18.8345 14.4034 18.7334C14.2662 18.6252 14.158 18.4592 14.0786 18.2355C14.0064 18.0045 13.9559 17.7086 13.927 17.3478C13.9054 16.9797 13.8946 16.5359 13.8946 16.0162ZM12.3357 16.0162C12.3357 16.608 12.361 17.1493 12.4115 17.6401C12.4692 18.1308 12.5883 18.553 12.7687 18.9066C12.9564 19.2603 13.2234 19.5309 13.5698 19.7185C13.9162 19.9062 14.3817 20 14.9663 20C15.5509 20 16.0164 19.9062 16.3628 19.7185C16.7092 19.5309 16.9726 19.2603 17.153 18.9066C17.3407 18.553 17.4598 18.1308 17.5103 17.6401C17.568 17.1493 17.5969 16.608 17.5969 16.0162C17.5969 15.4317 17.568 14.894 17.5103 14.4032C17.4598 13.9053 17.3407 13.4795 17.153 13.1258C16.9726 12.7722 16.7092 12.498 16.3628 12.3031C16.0164 12.101 15.5509 12 14.9663 12C14.3817 12 13.9162 12.101 13.5698 12.3031C13.2234 12.498 12.9564 12.7722 12.7687 13.1258C12.5883 13.4795 12.4692 13.9053 12.4115 14.4032C12.361 14.894 12.3357 15.4317 12.3357 16.0162Z'
          fill='white'
        />
        <Path d='M18.6368 19.8809H20.1957V12.1516H18.6368V19.8809Z' fill='white' />
        <Path
          d='M23.1966 12.1516H21.3996V19.8809H22.8286V14.4682H22.8502L24.7555 19.8809H26.5309V12.1516H25.1019V17.4452H25.0802L23.1966 12.1516Z'
          fill='white'
        />
      </G>
      <Defs>
        <ClipPath id='clip0_1462_4427'>
          <Rect width='32' height='32' fill='white' transform='translate(0.5)' />
        </ClipPath>
      </Defs>

    </Svg>
  )
}