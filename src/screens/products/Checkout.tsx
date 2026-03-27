import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AppHeader from '../../components/AppHeader'
import { Images } from '../../common/Images'

const Checkout = () => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FDFDFB' }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >

                <AppHeader
                    title="Checkout"
                    leftIcon={Images.backIcon}
                />




            </ScrollView>
        </SafeAreaView>
    )
}

export default Checkout