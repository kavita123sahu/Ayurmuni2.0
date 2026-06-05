import { useCallback, useEffect, useState } from "react";
import *as _MEDICINE_SERVICES from '../services/MedicineServices';


export const useMedicineData = (categoryId: string,) => {

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [Diseasecategories, setDiseasecategories] =
        useState<any[]>([]);


    const fetchAllData =
        useCallback(async () => {

            if (!categoryId) return;

            try {

                setLoading(true);

                const response =
                    await _MEDICINE_SERVICES.getDiseaseCategory(
                        "32785c3b-91be-4a69-b406-2c68892dffa1",
                    );


                    console.log("meicncategory", response);
                setDiseasecategories(
                    response?.data || [],
                );

            } catch (error) {

                console.log(
                    'DISEASE CATEGORY API ERROR =>',
                    error,
                );

            } finally {
                setLoading(false);
                setRefreshing(false);
            }

        }, [categoryId]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const onRefresh =
        useCallback(() => {

            setRefreshing(true);

            fetchAllData();

        }, [fetchAllData]);

    return {
        loading,
        refreshing,
        Diseasecategories,
        onRefresh,
    };
};