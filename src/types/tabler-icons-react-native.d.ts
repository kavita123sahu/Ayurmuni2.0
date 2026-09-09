declare module '@tabler/icons-react-native/*' {
  import type { ComponentType } from 'react';
  import type { SvgProps } from 'react-native-svg';

  export type TablerIconProps = SvgProps & {
    size?: number | string;
    color?: string;
    stroke?: number | string;
    strokeWidth?: number | string;
  };

  const Icon: ComponentType<TablerIconProps>;
  export default Icon;
}
