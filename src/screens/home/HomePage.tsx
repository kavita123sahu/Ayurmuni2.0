



import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import PrakritiCard from '../../components/PrakritiCard'


const HomePage = (props: any) => {


  const [PakritiData, setPakritiData] = useState(null);

  
  return (
    <TouchableOpacity style={{ padding: 16 }} onPress={() => props.navigation.navigate('PatientFAQ')}>

      <PrakritiCard
        title="Know Your Prakriti"
        status="Profile Pending"
        progress={100}
      />

    </TouchableOpacity>
  )
}

export default HomePage