// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   StatusBar,
//   ActivityIndicator,
//   RefreshControl,
// } from 'react-native';
// import Header from '../../components/Header';
// import { Fonts } from '../../common/Fonts';
// import { Colors } from '../../common/Colors';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { getDietPlans } from '../../services/PatientServices';
// import { useHomeData } from '../../hooks/UseHomeData';
// import TablerIcon from '../../components/TablerIcon';

// type DietPlan = {
//   id: string;
//   name: string;
//   title?: string;
//   season?: string | null;
//   prakriti?: string | null;
//   health_diseases?: { id: string; name: string }[];
//   is_common?: boolean;
//   is_paid?: boolean;
//   price?: number;
//   patient_assignment_status?: string | null;
//   short_description?: string;
// };

// const mapPlan = (item: any): DietPlan => ({
//   ...item,
//   id: String(item?.id ?? ''),
//   name: String(item?.name ?? item?.title ?? 'Diet Plan'),
//   title: String(item?.name ?? item?.title ?? 'Diet Plan'),
//   short_description:
//     item?.short_description ||
//     (Array.isArray(item?.health_diseases)
//       ? item.health_diseases.map((d: any) => d?.name).filter(Boolean).join(', ')
//       : '') ||
//     item?.season ||
//     '',
// });

// const normalizePlans = (response: any): DietPlan[] => {
//   if (Array.isArray(response)) {
//     return response.map(mapPlan).filter(p => p.id);
//   }
//   const data = response?.data ?? response?.results;
//   if (Array.isArray(data)) {
//     return data.map(mapPlan).filter(p => p.id);
//   }
//   if (data && typeof data === 'object') {
//     const list =
//       data.results || data.diet_plans || data.plans || data.items || null;
//     if (Array.isArray(list)) {
//       return list.map(mapPlan).filter(p => p.id);
//     }
//     if (data.id || data.name) {
//       return [mapPlan(data)];
//     }
//   }
//   return [];
// };

// const DietScreen = (props: any) => {
//   const selectedFromRoute: DietPlan | null = props?.route?.params?.item
//     ? mapPlan(props.route.params.item)
//     : null;

//   const { dietProducts, refreshHomeData } = useHomeData();
//   const [plans, setPlans] = useState<DietPlan[]>(
//     Array.isArray(dietProducts) && dietProducts.length
//       ? dietProducts.map(mapPlan)
//       : [],
//   );
//   const [loading, setLoading] = useState(plans.length === 0);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selected, setSelected] = useState<DietPlan | null>(selectedFromRoute);

//   const loadPlans = useCallback(async (isRefresh = false) => {
//     try {
//       if (isRefresh) {
//         setRefreshing(true);
//       } else if (plans.length === 0) {
//         setLoading(true);
//       }

//       const response = await getDietPlans();
//       const list = normalizePlans(response);
//       setPlans(list);

//       if (selectedFromRoute?.id) {
//         const matched = list.find(p => p.id === selectedFromRoute.id);
//         setSelected(matched || selectedFromRoute);
//       }
//     } catch (error) {
//       console.log('DIET_PLANS_ERROR =>', error);
//       if (Array.isArray(dietProducts) && dietProducts.length) {
//         setPlans(dietProducts.map(mapPlan));
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [dietProducts, plans.length, selectedFromRoute]);

//   useEffect(() => {
//     loadPlans();
//   }, []);

//   const onRefresh = useCallback(async () => {
//     await Promise.all([loadPlans(true), refreshHomeData()]);
//   }, [loadPlans, refreshHomeData]);

//   const diseaseText = useMemo(() => {
//     if (!selected?.health_diseases?.length) {
//       return selected?.short_description || '—';
//     }
//     return selected.health_diseases.map(d => d.name).filter(Boolean).join(', ');
//   }, [selected]);

//   const renderPlanCard = ({ item }: { item: DietPlan }) => {
//     const diseases =
//       item.health_diseases?.map(d => d.name).filter(Boolean).join(', ') ||
//       item.short_description ||
//       '';
//     const priceLabel =
//       item.is_paid === false || Number(item.price) === 0
//         ? 'Free'
//         : `₹${item.price}`;

//     return (
//       <TouchableOpacity
//         style={styles.planCard}
//         activeOpacity={0.85}
//         onPress={() => setSelected(item)}
//       >
//         <View style={styles.planIcon}>
//           <TablerIcon name="heart" size={22} color={Colors.primaryColor} />
//         </View>
//         <View style={styles.planBody}>
//           <Text style={styles.planTitle} numberOfLines={2}>
//             {item.name}
//           </Text>
//           {!!diseases && (
//             <Text style={styles.planMeta} numberOfLines={1}>
//               {diseases}
//             </Text>
//           )}
//           <View style={styles.planTags}>
//             {!!item.prakriti && (
//               <View style={styles.tag}>
//                 <Text style={styles.tagText}>{item.prakriti}</Text>
//               </View>
//             )}
//             {!!item.season && (
//               <View style={styles.tag}>
//                 <Text style={styles.tagText}>{item.season}</Text>
//               </View>
//             )}
//             <View style={[styles.tag, styles.priceTag]}>
//               <Text style={[styles.tagText, styles.priceTagText]}>
//                 {priceLabel}
//               </Text>
//             </View>
//           </View>
//         </View>
//         <TablerIcon name="chevron-right" size={18} color="#94A3B8" />
//       </TouchableOpacity>
//     );
//   };

//   if (selected) {
//     const priceLabel =
//       selected.is_paid === false || Number(selected.price) === 0
//         ? 'Free'
//         : `₹${selected.price}`;

//     return (
//       <SafeAreaView style={styles.container} edges={['top']}>
//         <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
//         <Header
//           title="Diet Plan"
//           subtitle={selected.name}
//           onBack={() => {
//             if (selectedFromRoute && plans.length <= 1) {
//               props.navigation.goBack();
//               return;
//             }
//             setSelected(null);
//           }}
//         />

//         <View style={styles.detailCard}>
//           <Text style={styles.detailTitle}>{selected.name}</Text>

//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Prakriti</Text>
//             <Text style={styles.detailValue}>{selected.prakriti || '—'}</Text>
//           </View>
//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Season</Text>
//             <Text style={styles.detailValue}>{selected.season || '—'}</Text>
//           </View>
//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Health focus</Text>
//             <Text style={styles.detailValue}>{diseaseText}</Text>
//           </View>
//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Price</Text>
//             <Text style={styles.detailValue}>{priceLabel}</Text>
//           </View>
//           {!!selected.patient_assignment_status && (
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Status</Text>
//               <Text style={styles.detailValue}>
//                 {selected.patient_assignment_status}
//               </Text>
//             </View>
//           )}
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
//       <Header
//         title="Diet Plans"
//         subtitle="Personalized nutrition plans"
//         onBack={() => props.navigation.goBack()}
//       />

//       {loading ? (
//         <View style={styles.loader}>
//           <ActivityIndicator size="large" color={Colors.primaryColor} />
//         </View>
//       ) : (
//         <FlatList
//           data={plans}
//           keyExtractor={(item, index) => item.id || String(index)}
//           renderItem={renderPlanCard}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               colors={[Colors.primaryColor]}
//               tintColor={Colors.primaryColor}
//             />
//           }
//           ListEmptyComponent={
//             <View style={styles.empty}>
//               <Text style={styles.emptyTitle}>No diet plans yet</Text>
//               <Text style={styles.emptySub}>
//                 Pull to refresh or check back later.
//               </Text>
//             </View>
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default DietScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     backgroundColor: Colors.background,
//   },
//   loader: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   listContent: {
//     paddingBottom: 40,
//     paddingTop: 8,
//     gap: 12,
//   },
//   planCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 14,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: '#E8EEF2',
//   },
//   planIcon: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     backgroundColor: '#E6F4F0',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   planBody: {
//     flex: 1,
//   },
//   planTitle: {
//     fontSize: 14,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#1E293B',
//   },
//   planMeta: {
//     fontSize: 12,
//     fontFamily: Fonts.PoppinsRegular,
//     color: '#64748B',
//     marginTop: 2,
//   },
//   planTags: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 6,
//     marginTop: 8,
//   },
//   tag: {
//     backgroundColor: '#F1F5F9',
//     borderRadius: 8,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//   },
//   tagText: {
//     fontSize: 11,
//     fontFamily: Fonts.PoppinsMedium,
//     color: '#475569',
//     textTransform: 'capitalize',
//   },
//   priceTag: {
//     backgroundColor: '#E6F4F0',
//   },
//   priceTagText: {
//     color: Colors.primaryColor,
//   },
//   detailCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 18,
//     borderWidth: 1,
//     borderColor: '#E8EEF2',
//     marginTop: 8,
//   },
//   detailTitle: {
//     fontSize: 18,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#0F172A',
//     marginBottom: 16,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 12,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F1F5F9',
//   },
//   detailLabel: {
//     fontSize: 13,
//     fontFamily: Fonts.PoppinsMedium,
//     color: '#64748B',
//   },
//   detailValue: {
//     flex: 1,
//     textAlign: 'right',
//     fontSize: 13,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#1E293B',
//     textTransform: 'capitalize',
//   },
//   empty: {
//     alignItems: 'center',
//     paddingTop: 60,
//     paddingHorizontal: 24,
//   },
//   emptyTitle: {
//     fontSize: 16,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#1E293B',
//   },
//   emptySub: {
//     marginTop: 6,
//     fontSize: 13,
//     fontFamily: Fonts.PoppinsRegular,
//     color: '#94A3B8',
//     textAlign: 'center',
//   },
// });


import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Image, StatusBar } from "react-native";
import SectionHeader from "../../components/SectionHeader";
import Header from "../../components/Header";
import { Images } from "../../common/Images";
import { Fonts } from "../../common/Fonts";
import { Colors } from "../../common/Colors";
import MealCard from "../../components/MealCard";
import { SafeAreaView } from "react-native-safe-area-context";



const macrosData = [
  { id: 1, label: "Carbs", value: 45, color: "#1FA77A" },
  { id: 2, label: "Protein", value: 30, color: "#2F6BDE" },
  { id: 3, label: "Fat", value: 25, color: "#F4B400" },
];

const mealsData = [
  {
    id: "1",
    type: "BREAKFAST",
    time: "08:30 AM",
    title: "Avocado & Poached Egg Toast",
    subtitle: "Whole grain sourdough...",
    kcal: 340,
    image: undefined,
    status: "log",
  },
  {
    id: "2",
    type: "LUNCH",
    time: "01:15 PM",
    title: "Mediterranean Quinoa Bowl",
    subtitle: "Quinoa, chickpeas...",
    kcal: 520,
    image: undefined,
    status: "done",
  },
  {
    id: "3",
    type: "DINNER",
    time: "07:45 PM",
    title: "Lemon Garlic Glazed Salmon",
    subtitle: "Wild salmon, asparagus...",
    kcal: 410,
    image: undefined,
    status: "log",
  },
  {
    id: "4",
    type: "SNACKS",
    time: "Afternoon",
    title: "Mixed Nuts & Berries",
    subtitle: "Almonds, walnuts...",
    kcal: 185,
    image: undefined,
    status: "log",
  },
  {
    id: "5",
    type: "SNACKS",
    time: "Afternoon",
    title: "Mixed Nuts & Berries",
    subtitle: "Almonds, walnuts...",
    kcal: 185,
    image: undefined,
    status: "log",
  },
];

const DietScreen = (props: any) => {


  const Macro = ({ label = "", value = 0, color = "#000" }) => {
    const safeValue = Math.min(Math.max(value, 0), 100);
    return (
      <View style={styles.macroItem}>
        <View style={styles.macroTop}>
          <Text style={styles.macroLabel}>{label}</Text>
          <Text style={[styles.macroPercent, { color }]}>
            {safeValue}%
          </Text>
        </View>

        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${safeValue}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const DailyVitalityCard = () => {
    return (
      <View style={styles.DailyCard}>

        <View style={styles.content}>

          <View style={styles.circle}>
            <Text style={styles.calories}>1,420</Text>
            <Text style={styles.kcalText}>KCAL LEFT</Text>
          </View>

          <View style={styles.info}>
            <View style={styles.row}>
              <Text style={styles.label}>Eaten</Text>
              <Text style={styles.value}>780 kcal</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Burned</Text>
              <Text style={[styles.value, styles.green]}>320 kcal</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.goalLabel}>Goal</Text>
              <Text style={styles.goalValue}>2,200 kcal</Text>
            </View>
          </View>
        </View>


        <View style={styles.macroRow}>
          {macrosData.map((item) => (
            <Macro
              key={item.id}
              label={item.label}
              value={item.value}
              color={item.color}
            />
          ))}
        </View>


      </View>
    );
  };


  const HydrationCard = () => {
    return (
      <View style={styles.Hydrationcard}>
        <View style={styles.left}>
          <View style={styles.iconBox}>
            <Image source={require('../../assets/images/WaterDrop.png')} style={{ height: 20, width: 16 }} />
          </View>

          <View>
            <Text style={styles.Hydrationtitle}>Hydration</Text>
            <Text style={styles.subtitle}>1.2L of 2.5L reached</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.minus}>
            <Text style={styles.btnText}>−</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.plus}>
            <Text style={styles.plusText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar barStyle={'dark-content'} backgroundColor={Colors.background} />

      <Header
        title="Diet"
        subtitle="Track your medical journey"
        onBack={() => { props.navigation.goBack() }}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ paddingBottom: 100 }} >

        <View style={{ flex: 1, justifyContent: "space-between" }}>

          <SectionHeader title="Daily Vitality" actionText="Tuesday, Oct 24" />

          <DailyVitalityCard />

          <HydrationCard />

          <SectionHeader title="Today's Meals" actionText="Weekly Plan" />

          <FlatList
            data={mealsData}
            scrollEnabled={false} // 👈 IMPORTANT
            keyExtractor={(item) => item.id}

            renderItem={({ item }) => <MealCard data={item} navigation={props.navigation} />}
          />

        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default DietScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: "#FDFDFB" },

  card: {
    backgroundColor: "#fff",
    margin: 12,
    padding: 16,
    borderRadius: 12,
  },
  DailyCard: {
    backgroundColor: "#0D614E0D",
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 25
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1D1F",
  },

  date: {
    color: "#1FA77A",
    fontWeight: "600",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
  },

  circle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 10,
    borderColor: "#0F5D4A",
    justifyContent: "center",
    alignItems: "center",
  },

  calories: {
    fontSize: 26,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    marginBottom: -10
  },

  kcalText: {
    fontSize: 12,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsRegular
  },

  info: {
    flex: 1,
    marginLeft: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: {
    color: Colors.subTextColor,
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium

  },

  value: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
  },

  green: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14
  },

  divider: {
    height: 1,
    backgroundColor: "#D1D5DB",
    marginVertical: 10,
  },

  goalLabel: {
    fontSize: 16,
    color: Colors.subTextColor,
  },

  goalValue: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold
  },


  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  macroItem: {
    width: "30%",
  },

  macroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  macroLabel: {
    fontSize: 12,
    color: Colors.black,
    fontFamily: Fonts.PoppinsMedium
  },

  macroPercent: {
    fontSize: 12,
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold
  },

  progressBg: {
    height: 6,
    backgroundColor: "#E0E3E2", // light gray
    borderRadius: 11,
    overflow: "hidden",
  },

  progressFill: {
    height: 6,
    borderRadius: 10,
  },

  Hydrationcard: {
    backgroundColor: "#0D614E0D",
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  Hydrationtitle: {
    fontSize: 16,
    marginBottom: -5,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold
  },

  subtitle: {
    color: Colors.subTextColor,
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium

  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
  },

  minus: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginRight: 10,
  },

  plus: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#0F5D4A",
    justifyContent: "center",
    alignItems: "center",
  },

  btnText: {
    fontSize: 25,
    color: "#374151",
  },

  plusText: {
    fontSize: 25,
    color: "#fff",
  },

});