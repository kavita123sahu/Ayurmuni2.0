import React from 'react';

import {

  View,

  Text,

  TouchableOpacity,

  StyleSheet,

  ImageSourcePropType,

} from 'react-native';

import { Fonts } from '../common/Fonts';

import { Colors } from '../common/Colors';

import TablerIcon, { TablerIconName } from './TablerIcon';



interface HeaderProps {

  title: string;

  subtitle?: string;

  onBack?: () => void;

  backIcon?: ImageSourcePropType;

  onSearchPress?: () => void;

  onRefreshPress?: () => void;

  rightIconName?: TablerIconName;

  onRightPress?: () => void;

}



const Header: React.FC<HeaderProps> = ({

  title,

  subtitle,

  onBack,

  onSearchPress,

  onRefreshPress,

  rightIconName,

  onRightPress,

}) => {

  const hasRightActions = !!(onRefreshPress || onSearchPress || rightIconName);



  return (

    <View style={styles.shell}>

      {onBack ? (

        <TouchableOpacity

          style={styles.iconBtn}

          onPress={onBack}

          activeOpacity={0.75}

        >

          <TablerIcon name="arrow-left" size={20} color={Colors.primaryColor} />

        </TouchableOpacity>

      ) : (

        <View style={styles.iconPlaceholder} />

      )}



      <View style={styles.titleBlock}>

        <Text style={styles.title} numberOfLines={1}>

          {title}

        </Text>

        {subtitle ? (

          <Text style={styles.subtitle} numberOfLines={1}>

            {subtitle}

          </Text>

        ) : null}

      </View>



      {hasRightActions ? (

        <View style={styles.rightActions}>

          {/* {onRefreshPress ? (

            <TouchableOpacity

              style={styles.iconBtn}

              onPress={onRefreshPress}

              activeOpacity={0.75}

            >

              <TablerIcon name="refresh" size={20} color={Colors.primaryColor} />

            </TouchableOpacity>

          ) : null} */}

          {onSearchPress ? (

            <TouchableOpacity

              style={styles.iconBtn}

              onPress={onSearchPress}

              activeOpacity={0.75}

            >

              <TablerIcon name="search" size={20} color={Colors.primaryColor} />

            </TouchableOpacity>

          ) : null}

          {rightIconName ? (

            <TouchableOpacity

              style={styles.iconBtn}

              onPress={onRightPress}

              activeOpacity={0.75}

            >

              <TablerIcon name={rightIconName} size={20} color={Colors.primaryColor} />

            </TouchableOpacity>

          ) : null}

        </View>

      ) : (

        <View style={styles.iconPlaceholder} />

      )}

    </View>

  );

};



export default Header;



const styles = StyleSheet.create({

  shell: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 10,

    paddingVertical: 8,

    paddingHorizontal: 2,

  },

  iconBtn: {

    width: 40,

    height: 40,

    borderRadius: 12,

    backgroundColor: '#F1F5F9',

    borderWidth: 1,

    borderColor: '#E2E8F0',

    justifyContent: 'center',

    alignItems: 'center',

  },

  iconPlaceholder: {

    width: 40,

    height: 40,

  },

  rightActions: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 6,

  },

  titleBlock: {

    flex: 1,

    justifyContent: 'center',

    minWidth: 0,

  },

  title: {

    fontSize: 17,

    lineHeight: 22,

    fontFamily: Fonts.PoppinsSemiBold,

    color: '#0F172A',

  },

  subtitle: {

    marginTop: 1,

    fontSize: 12,

    lineHeight: 16,

    color: '#64748B',

    fontFamily: Fonts.PoppinsMedium,

  },

});


