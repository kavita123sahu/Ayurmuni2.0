import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, FlatList, Image, StatusBar } from 'react-native';
import SectionHeader from '../../components/SectionHeader';
import SearchBar from '../../components/SearchBar';
import Header from '../../components/Header';
import { Images } from '../../common/Images';
import StyleCard from '../../components/StyleCard';
import { Ionicons } from '../../common/Vector';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const DATA = [
    {
        id: '1',
        type: 'featured',
        title: 'Morning Vitality Flow',
        subtitle: '12/20 mins remaining',
        progress: 30,
    },
    {
        id: '2',
        type: 'practice',
        title: 'Mindful Breathing',
        subtitle: 'Beginner • 5 min',
        progress: 40,
    },
    {
        id: '3',
        type: 'practice',
        title: 'Hatha Foundations',
        subtitle: 'Beginner • 10 min',
        progress: 25,
    },
];

const MENTORS = [
    {
        id: '1',
        name: 'Muskan Yadav',
        role: 'Vinyasa Specialist',
        image: 'https://randomuser.me/api/portraits/women/1.jpg',
    },
    {
        id: '2',
        name: 'Muskan Yadav',
        role: 'Hatha Master',
        image: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    {
        id: '3',
        name: 'Muskan Yadav',
        role: 'Hatha Master',
        image: 'https://randomuser.me/api/portraits/women/3.jpg',
    },
];
const STYLES_DATA = [
    {
        id: '1',
        title: 'Vinyasa',
        subtitle: 'Dynamic flow to build strength',
        image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3',
    },
    {
        id: '2',
        title: 'Hatha',
        subtitle: 'Balance body and mind',
        image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5',
    },
    {
        id: '3',
        title: 'Restorative',
        subtitle: 'Gentle and relaxing',
        image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7',
    },
    {
        id: '4',
        title: 'Yin Yoga',
        subtitle: 'Deep stretch and flexibility',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
    },
];


const featuredData = {
    title: 'Morning Vitality Flow',
    desc: 'Awaken your senses and align your breath with a high-intensity Vinyasa sequence designed for peak focus.',
    duration: '45 Mins',
    level: 'Advanced',
};


type Dataprops = {
    title: string;
    desc: string;
    duration: string;
    level: string;
}
const YogaScreen = (props: any) => {

    const FeaturedCard = ({ title, desc, duration, level }: Dataprops) => {
        console.log('FeaturedCard data:', { title, desc, duration, level });

        return (
            <View style={styles.card}>

                <View style={styles.topRow}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Recommended</Text>
                    </View>

                    <Text style={styles.meta}>
                        {duration} • {level}
                    </Text>
                </View>

                <Text style={styles.title}>{title}</Text>

                <Text style={styles.desc}>{desc}</Text>

                {/* Button */}
                <TouchableOpacity style={styles.button}>
                    <Ionicons name="play" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Start Practice</Text>
                </TouchableOpacity>

            </View>
        )
    }


    const renderItem = ({ item }: { item: any }) => {
        return (
            <TouchableOpacity style={styles.card1} onPress={() => props.navigation.navigate('DietScreen')}>

                {/* Left Image */}
                <Image source={Images.MentorImage} style={styles.image} />

                {/* Middle Content */}
                <View style={styles.content}>
                    <Text numberOfLines={2} style={styles.title1}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>

                    <View style={styles.progressBar}>
                        <View
                            style={[styles.progress, { width: `${item.progress}%` }]}
                        />
                    </View>
                </View>

                {/* Right Play Button */}
                <TouchableOpacity style={styles.playBtn}>
                    <Ionicons name="play" size={18} color="#1F7A63" />
                </TouchableOpacity>

            </TouchableOpacity>
        )
    }


    const MentorCard = ({ data, isActive }: any) => {
        return (
            <View style={[styles.card2]}>

                {/* Profile Image */}
                <Image source={{ uri: data.image }} style={styles.image1} />

                {/* Name */}
                <Text style={styles.name}>{data.name}</Text>

                {/* Role */}
                <Text style={styles.role}>{data.role}</Text>

            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            
            <StatusBar barStyle={'dark-content'} backgroundColor={Colors.background} />

            <Header
                title="Yoga"
                subtitle="Find best doctor"
                backIcon={Images.backIcon}
                onBack={() => { props.navigation.goBack() }}
            />

            <SearchBar
                placeholder="Search doctors, concerns..."
                icon={require('../../assets/images/search.png')}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

                <FeaturedCard {...featuredData} />

                <SectionHeader title="Continue Practicing" actionText="View History" />

                <FlatList
                    data={DATA}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                />

                <SectionHeader title="Explore Styles" />

                <FlatList
                    data={STYLES_DATA}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <StyleCard
                            data={item}
                            index={index}
                        />
                    )}
                    scrollEnabled={false} // because inside ScrollView
                />

                <SectionHeader title="Expert Mentors" />

                <FlatList
                    data={MENTORS}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <MentorCard
                            data={item}
                            isActive={index === 0} // first selected
                        />
                    )}
                />

            </ScrollView>
        </SafeAreaView>
    );
};

export default YogaScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#E8F3EF',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: '#CFE3DC',
    },

    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    badge: {
        backgroundColor: '#0D614E',
        paddingHorizontal: 12,
        paddingVertical: 4,
        padding: 5,
        borderRadius: 8,
    },

    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium
    },

    meta: {
        marginLeft: 10,
        color: '#2f423e',
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium

    },

    title: {
        fontSize: 20,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1B2B2B',
        marginBottom: 6,
    },

    desc: {
        color: '#5F7D79',
        fontSize: 14,
        lineHeight: 23,
        fontFamily: Fonts.PoppinsMedium,
        marginBottom: 30,
    },

    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        paddingVertical: 14,
        borderRadius: 16,
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
        marginLeft: 8,
    },
    card1: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F3F2',
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 20,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },

    image: {
        width: 70,
        height: 70,
        backgroundColor: '#0D614E1A',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#0D614E1A',
    },

    content: {
        flex: 1,
        marginHorizontal: 12,
    },

    title1: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.black,
        // marginBottom:-2
    },

    subtitle: {
        fontSize: 12,
        color: '#6B7A78',

        // marginVertical: 4,
    },

    progressBar: {
        height: 6,
        backgroundColor: '#DADADA',
        borderRadius: 10,
        marginTop: 10,
    },

    progress: {
        height: 6,
        backgroundColor: '#F4B400', // yellow
        borderRadius: 10,
    },

    playBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#DDE5E2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card2: {
        width: 140,
        backgroundColor: '#E9F1EF',
        borderRadius: 24,
        paddingVertical: 18,
        paddingHorizontal: 10,
        alignItems: 'center',
        marginRight: 12,
    },

    activeCard: {
        borderWidth: 2,
        borderColor: '#4A90E2', // blue highlight
    },

    image1: {
        width: 70,
        height: 70,
        borderRadius: 40,
        marginBottom: 10,
        backgroundColor: '#0D614E1A',
        borderWidth: 1,
        borderColor: '#0D614E1A',
    },

    name: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1B2B2B',
        textAlign: 'center',
    },

    role: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsRegular,
        color: '#6B7A78',
        marginTop: 4,
        textAlign: 'center',
    },
});