






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
import { doctorsData, product, topSelling } from '../../common/DataInterface';
import TopDoctorsCard from './TopDoctorsCard';
import *as _ASSESSMENT_SERVICE from '../../services/AssesmentService'
import { useIsFocused } from '@react-navigation/native';



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


  const categories = [
    { id: '1', name: 'Doctors', icon: Images.PlusBag },
    { id: '2', name: 'Medicine', icon: Images.medicine },
    { id: '3', name: 'Products', icon: Images.products },
    { id: '4', name: 'More', icon: Images.moreButton },
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

    <View style={styles.container}>

      <StatusBar backgroundColor={Colors.primaryColor} barStyle="dark-content" />

      <HomeHeader />

      <SearchBar
        placeholder="Search doctors, medicine and products..."
        icon={require('../../assets/images/search.png')}
      />


      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        <TouchableOpacity style={{ paddingHorizontal: 10 }} onPress={() => props.navigation.navigate('PatientFAQ')} >
          <PrakritiCard
            title="Your Prakriti profile is ready"
            status="Profile Complete"

            progress={Math.round(PakritiData?.answered_percentage ?? 0)}
          />
        </TouchableOpacity>


        <CategoryList data={categories} navigation={props.navigation} />

        <SectionHeader title="Top Doctors" actionText="View all" />


        <TopDoctorsCard data={doctorsData} navigation={props.navigation} />



        <View style={{ paddingHorizontal: 10 }}>
          <Detailimages
            images={product.images}
            itemWidth={itemWidth}
            itemHeight={180}

          />
        </View>

        <SectionHeader title="Top Medicines" actionText="View all" />
        <TopSellingList data={topSelling} />

        <SectionHeader title="Top Products" actionText="View all" />
        <TopSellingList data={topSelling} />



      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10
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