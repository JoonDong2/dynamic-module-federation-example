import type {
  CompositeNavigationProp,
  RouteProp as OriginRoutProp,
} from '@react-navigation/native';
import type { AlphabetStackParamList } from './alphabet';
import type { NumberStackParamList } from './number';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { EmojiStackParamList } from './emoji';

export type TabParamList = {
  'alphabet:Main': undefined;
  'number:Main': undefined;
  'emoji:Main': undefined;
};

export type RootStackParamList = AlphabetStackParamList &
  NumberStackParamList &
  EmojiStackParamList;

export type NavigationProp<TabName extends keyof TabParamList> =
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, TabName>,
    StackNavigationProp<RootStackParamList>
  >;

export type RouteProp<ScreenName extends keyof RootStackParamList> =
  OriginRoutProp<RootStackParamList, ScreenName>;
