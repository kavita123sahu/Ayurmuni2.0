import { useCallback, useEffect, useState } from "react";
import *as _HOME_SERVICES from "../services/HomeServices";
import * as _PRODUCT_SERVICES from "../services/ProductServices";
import *as _PROFILE_SERVICES from "../services/ProfileServices";

export const useHomeData = () => {

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [categories, setCategories] =
        useState<any[]>([]);

    const [customerData, setCustomerData] =
        useState<any[]>([]);

    const [productData, setProductData] =
        useState<any[]>([]);

    const [SuggestDoctor, setSuggestDoctor] =
        useState<any[]>([]);


    const fetchAllData =
        useCallback(async () => {

            try {

                setLoading(true);
                const [
                    categoryRes,
                    SuggestDoctorRes,
                    productData,
                    userData
                ] = await Promise.all([
                    _HOME_SERVICES.getHomeCategory(),
                    _HOME_SERVICES.getSuggestedDoctor(),
                    _PRODUCT_SERVICES.getProduct(),
                    _PROFILE_SERVICES.user_profile()
                ]);

                console.log(
                    'userDatauserData ===>',
                    userData,
                );

                setCategories(
                    categoryRes?.data || [],
                );

                setSuggestDoctor(
                    SuggestDoctorRes?.data?.results || [],
                );

                setProductData(
                    productData?.data?.results || [],
                );

                setCustomerData(userData?.data || [])

            } catch (error) {

                console.log(
                    ' HOME CATEGORY API ERROR ===>',
                    error,
                );

            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        }, []);

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
        categories,
        SuggestDoctor,
        customerData,
        productData,
        onRefresh,
    };
};