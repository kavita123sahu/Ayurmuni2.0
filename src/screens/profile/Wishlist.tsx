import { View, Text, StyleSheet, StatusBar } from 'react-native'
import React from 'react'
import { Images } from '../../common/Images'
import AppHeader from '../../components/AppHeader'
import TopSellingList from '../../components/TopSellingList'
import { topSelling } from '../../common/DataInterface'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../common/Colors'

const Wishlist = (props: any) => {
    return (


        <SafeAreaView style={styles.container}>

            <StatusBar barStyle={'dark-content'} backgroundColor={'#FFFFFF'} />

            <AppHeader
                title="My Wishlist"
                leftIcon={Images.backIcon}
                onLeftPress={() => props.navigation.goBack()}
                // rightIcon={Images.Bell}
                onRightPress={() => console.log('Search clicked')}
            />

            
            <View style={{ flex: 1, paddingTop: 20, paddingHorizontal: 20 , backgroundColor:'#FDFDFB'}}>
                <TopSellingList data={topSelling} fav={false}  isGrid={true} navigation={props.navigation} />
            </View>


        </SafeAreaView>

    )
}

export default Wishlist


const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 16,
        backgroundColor: '#FFFFFF',
        // paddingBottom: 100
    }
})
