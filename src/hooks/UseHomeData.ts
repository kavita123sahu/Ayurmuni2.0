import { useCallback, useEffect, useRef, useState } from "react";
import *as _HOME_SERVICES from "../services/HomeServices";
import * as _PRODUCT_SERVICES from "../services/ProductServices";
import *as _PROFILE_SERVICES from "../services/ProfileServices";
import * as _CONSULT_SERVICES from "../services/ConsultServce";
import * as _YOGA_SERVICES from '../services/YogaServices'

export const useHomeData = () => {

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [loadingCategories, setloadingCategories] =
        useState(false);

    const [loadingProducts, setloadingProducts] =
        useState(false);

    const [loadingNotification, setloadingNotification] =
        useState(false);
    const [loadingDoctors, setloadingDoctors] =
        useState(false);
    const [loadingCustomer, setLoadingCustomer] = useState(true);

    const [customerData, setCustomerData] = useState<any | null>(null);

    const [categories, setCategories] =
        useState<any[]>([]);

    const [productData, setProductData] =
        useState<any[]>([]);

    const [YogaSession, setYogasession] =
        useState<any[]>([]);

    const [SuggestDoctor, setSuggestDoctor] =
        useState<any[]>([]);


    const fetchCategories = useCallback(async () => {
        try {
            setloadingCategories(true);

            const res =
                await _HOME_SERVICES.getHomeCategory();

            setCategories(res?.data || []);
        } catch (error) {
            console.log(error);
        } finally {
            setloadingCategories(false);
        }
    }, []);

    const fetchDoctors = useCallback(async () => {
        try {
            setloadingDoctors(true);

            const res =
                await _HOME_SERVICES.getSuggestedDoctor();
            console.log("suggestdoctor", res);
            setSuggestDoctor(
                res?.data?.results || [],
            );
        } catch (error) {
            console.log(error);
        } finally {
            setloadingDoctors(false);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            setloadingProducts(true);

            const res =
                await _PRODUCT_SERVICES.getProduct();

            setProductData(
                res?.data?.results || [],
            );


        } catch (error) {
            console.log(error);
        } finally {
            setloadingProducts(false);
        }
    }, []);


    const fetchYogaSession = useCallback(async () => {
        try {
            setloadingNotification(true);

            const res =
                await _YOGA_SERVICES.getYogaSession();
            console.log("getYogaSessiongetYogaSession", res);

            setYogasession(
                res?.data ||[],
            );


        } catch (error) {
            console.log(error);
        } finally {
            setloadingNotification(false);
        }
    }, []);


    const fetchCustomerData = useCallback(async () => {
        try {
            setLoadingCustomer(true);

            const res =
                await _PROFILE_SERVICES.user_profile();
            console.log("customerdata", res)
            if (res?.status === 200) {
                console.log("customerres", res?.data)
                setCustomerData(res?.data || null);
            }

        } catch (error) {
            console.log('CUSTOMER API ERROR ===>', error);
        } finally {
            setLoadingCustomer(false);
        }
    }, []);

    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;

        hasFetched.current = true;

        fetchCategories();
        fetchDoctors();
        fetchProducts();
        fetchYogaSession()
        fetchCustomerData();
    }, []);

    const refreshHomeData = useCallback(async () => {
        try {
            setRefreshing(true);

            await Promise.all([
                fetchCategories(),
                fetchDoctors(),
                fetchProducts(),
                fetchCustomerData()
            ]);

        } finally {
            setRefreshing(false);
        }
    }, []);

    return {

        categories,
        SuggestDoctor,
        productData,
        customerData,
        YogaSession,


        loadingCustomer,
        loadingCategories,
        loadingDoctors,
        loadingProducts,
        setProductData,
        fetchCustomerData, // 👈 add this

        refreshHomeData,
        loading,
        refreshing,
    };
};