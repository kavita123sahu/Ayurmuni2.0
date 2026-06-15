import { View, Text, StyleSheet, StatusBar } from 'react-native'
import React from 'react'
import { Images } from '../../common/Images'
import AppHeader from '../../components/AppHeader'
import TopSellingList from '../../components/TopSellingList'
import { topSelling } from '../../common/DataInterface'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../common/Colors'
import { useHomeData } from '../../hooks/UseHomeData'
import { WishlistSkeleton } from '../../simmerScreen/ShimmerHook'
import EmptyState from '../../components/EmptyState'

const Wishlist = (props: any) => {

    const {
        loading,
        refreshing,
        categories,
        SuggestDoctor,
        productData,
        setProductData,
        onRefresh,
    } = useHomeData();


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


            <View style={{ flex: 1, paddingTop: 20, paddingHorizontal: 15, backgroundColor: '#FDFDFB' }}>

                {
                    loading ? (
                        <WishlistSkeleton />
                    ) : productData?.length > 0 ? (
                        <TopSellingList
                            data={productData}
                            fav={false}
                            isGrid={true}
                            navigation={props.navigation}
                            setProductData={setProductData}
                        />
                    ) : (
                        <EmptyState
                            imageSize={25}
                            image={Images.wishlist}
                            title="Wishlist is Empty"
                            subtitle="No products added to wishlist yet."
                        />
                    )
                }

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
