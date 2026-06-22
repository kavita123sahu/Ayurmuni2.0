import { View, Text, StyleSheet, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Images } from '../../common/Images'
import AppHeader from '../../components/AppHeader'
import TopSellingList from '../../components/TopSellingList'
import { topSelling } from '../../common/DataInterface'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../common/Colors'
import { useHomeData } from '../../hooks/UseHomeData'
import { WishlistSkeleton } from '../../simmerScreen/ShimmerHook'
import EmptyState from '../../components/EmptyState'
import *as _PRODUCT_SERVICES from '../../services/ProductServices'
const Wishlist = (props: any) => {



    const [wishlistData, setWishlistData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = async () => {
        try {
            setLoading(true);

            const res = await _PRODUCT_SERVICES.getProduct();
            console.log("resporduct", res);

            const Data = res?.data?.results || [];
            const wishlistItems = Data.filter((item: any) => item?.is_wishlist_item === true);
            console.log("wishlistItems", wishlistItems);

            setWishlistData(wishlistItems);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

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
                    ) : wishlistData?.length > 0 ? (
                        <TopSellingList
                            data={wishlistData}
                            fav={false}
                            isGrid={true}
                          
                            navigation={props.navigation}
                            setProductData={() => setWishlistData}
                        />
                    ) : (
                        <EmptyState
                            imageSize={15}

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
