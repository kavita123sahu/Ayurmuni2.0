import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SessionCard from '../../components/SessionCard'

export default function SessionBreakdown(data : any) {
    return (
        <FlatList
            data={data}
            keyExtractor={(item, i) => i.toString()}
            renderItem={({ item }) => (
                <SessionCard {...item} />
            )}
        />
    )
}

const styles = StyleSheet.create({})