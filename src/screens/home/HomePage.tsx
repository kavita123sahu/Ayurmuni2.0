






import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { Dimensions } from 'react-native';
import { Images } from '../../common/Images';
import * as _PROFILE_SERVICES from '../../services/ProfileServices';
import { Colors } from '../../common/Colors';
import PrakritiCard from '../../components/PrakritiCard';
import HomeHeader from '../../components/HomeHeader';
import SearchBar from '../../components/SearchBar';
import CategoryList from '../../components/CategoryList';
import SectionHeader from '../../components/SectionHeader';
import Detailimages from '../../components/Detailimages';
import TopSellingList from '../../components/TopSellingList';
import { doctorsData, product, topSelling, topSelling1, topSelling2, topSelling3 } from '../../common/DataInterface';
import TopDoctorsCard from './TopDoctorsCard';
import *as _ASSESSMENT_SERVICE from '../../services/AssesmentService'
import { useIsFocused } from '@react-navigation/native';
import HomeCategory from './HomeCategory';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import SuggestedCard from '../../components/SuggestedCard';



type Prakriti = {
  id: string;
  customer: string;
  vata_score: number;
  pitta_score: number;
  kapha_score: number;
  dominant_dosha: string | null;
  created_at: string;
  updated_at: string;
  answered_questions: number;
  total_questions: number;
  answered_percentage: number;
};

const horizontalPadding = 10;

const { width } = Dimensions.get('window');
const itemWidth = width - horizontalPadding * 4;



const categoryImage = require('../../assets/images/CategiryImage.png');


const HomePage: React.FC = (props: any) => {



  const isFocused = useIsFocused();
  const [PakritiData, setPakritiData] = useState<Prakriti | null>(null);
  const data = [
    {
      title:

        'Prakriti',
      status: PakritiData?.answered_percentage === 100 ? 'Profile Complete' : 'Profile Pending',
      screen: 'PatientFAQ',
      // 🔥 screen 1
    },
    {
      title:
        // PakritiData?.answered_percentage === 100
        //   ? 'Your profile is ready'
        //   :
        'Medical History',
      status: PakritiData?.answered_percentage === 100 ? 'Profile Complete' : 'Profile Pending',
      screen: 'MedicalHistory', // 🔥 screen 2
      // 🔥 screen 2
    },
  ];

  const categories = [
    { id: '1', name: 'Doctors', icon: Images.Doctors },
    { id: '2', name: 'Medicine', icon: Images.Medicines },
    { id: '3', name: 'Products', icon: Images.products },
    { id: '4', name: 'Yoga', icon: Images.Yoga },
    { id: '5', name: 'Diet', icon: Images.Diet },
    { id: '6', name: 'Panchakarma', icon: Images.Panchakarma },
  ];



  useEffect(() => {
    getUserAssessment();
  }, [isFocused]);


  const getUserAssessment = async () => {

    try {

      const result: any = await _ASSESSMENT_SERVICE.GetAssessmentPercentage();

      const JSONDATA = await result.json();
      console.log("Profile Data ===>", JSONDATA)
      if (result.status === 200) {
        setPakritiData(JSONDATA);
      }

      else {
        console.log("Error in fetching profile data", JSONDATA);
      }

    } catch (error) {
      console.log(error);
    }
  }



  return (


    <ScreenWrapper>
      <View style={styles.container}>

        <StatusBar backgroundColor={Colors.primaryColor} barStyle="dark-content" />

        <HomeHeader />


        <SearchBar
          placeholder="Search doctors, medicine and products..."
          icon={require('../../assets/images/search.png')}
        />


        <ScrollView showsVerticalScrollIndicator={false}>

          <View style={styles.containerprakriti}>
            {data.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.cardWrapper}
                onPress={() => props.navigation.navigate(item.screen, {
                  update: true
                }

                )} // 🔥 dynamic navigation
              >
                <PrakritiCard
                  title={item.title}
                  status={item.status}
                  progress={Math.round(PakritiData?.answered_percentage ?? 0)}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* <CategoryList data={categories} navigation={props.navigation} /> */}
          <HomeCategory data={categories} navigation={props.navigation} />

          <SectionHeader title="Suggested Doctors" actionText="View all" />


          <TopDoctorsCard data={doctorsData} navigation={props.navigation} />


          <Detailimages
            images={product.images}
            itemWidth={width - 80}
            itemHeight={150}
            DynamicResize='contain'

          />


          <SectionHeader title="Suggested Medicines" actionText="View all" />


          <TopSellingList data={topSelling} navigation={props.navigation} />



          <SectionHeader title="Suggested Products" actionText="View all" />


          <TopSellingList data={topSelling} navigation={props.navigation} />


          <SectionHeader title="Yoga’s" actionText="View all" />



          <SuggestedCard data={topSelling1} navigation={props.navigation} />


          <SectionHeader title="Suggested Diet Plan" actionText="View all" />



          <SuggestedCard data={topSelling2} navigation={props.navigation} />

          <SectionHeader title="Panchakarma" actionText="View all" />

          <SuggestedCard data={topSelling3} navigation={props.navigation} price={true} />

        </ScrollView>

      </View>
    </ScreenWrapper>

  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // // paddingBottom: 50,
    // backgroundColor: '#FDFDFB',
    // paddingHorizontal: 10

    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
    // backgroundColor:'#FDFDFB'
  },
  containerprakriti: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  header: {

    // paddingHorizontal: 20,
    paddingBottom: 10,
    paddingVertical: 5,

  },
  headerprofile: {
    // paddingHorizontal: 10,


  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  profileheader: {
    backgroundColor: '#fff',
    borderRadius: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40
  },
  sublocationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
  },
  askMuniButton: {

    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  askMuniText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
  askMuniIcon: {
    fontSize: 20,
  },

  advisorCard: {
    padding: 15,
    paddingHorizontal: 20,
    width: '100%',
    flexDirection: 'row',
  },

  advisorIcon: {
    width: '40%',
    alignItems: 'center',

  },
  advisorContent: {

    width: '60%',
    marginLeft: 30
  },

  advisorTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 5,
  },
  advisorSubtitle: {
    marginTop: 5,
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
    marginBottom: 10,
    lineHeight: 16,
  },

  askNowContainer: {
    position: 'absolute',
    bottom: -20,
    left: width / 2 - 80,
    zIndex: 10,
  },
  askNowButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  content: {
    flex: 1,
    // paddingHorizontal: 14,
    paddingBottom: 50,
    backgroundColor: '#F5F5F5',
  },


  takeChargeSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },


});

export default HomePage;