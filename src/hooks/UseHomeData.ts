import { useCallback, useEffect, useState } from "react";
import *as _HOME_SERVICES from "../services/HomeServices";
import * as _PRODUCT_SERVICES from "../services/ProductServices";
import *as _PROFILE_SERVICES from "../services/ProfileServices";

export const useHomeData = () => {

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [loadingCategories, setloadingCategories] =
        useState(false);

    const [loadingProducts, setloadingProducts] =
        useState(false);

    const [loadingDoctors, setloadingDoctors] =
        useState(false);
    const [loadingCustomer, setLoadingCustomer] = useState(false);

    const [customerData, setCustomerData] = useState<any | null>(null);

    const [categories, setCategories] =
        useState<any[]>([]);

    const [productData, setProductData] =
        useState<any[]>([]);

    const [SuggestDoctor, setSuggestDoctor] =
        useState<any[]>([]);


    const fetchCategories = async () => {
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
    };

    const fetchDoctors = async () => {
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
    };

    const fetchProducts = async () => {
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
    };



    const fetchCustomerData = async () => {
        try {
            setLoadingCustomer(true);

            const res =
                await _PROFILE_SERVICES.user_profile();

            if (res?.status === 200) {
                setCustomerData(res?.data || null);
            }

        } catch (error) {
            console.log('CUSTOMER API ERROR ===>', error);
        } finally {
            setLoadingCustomer(false);
        }
    };

    useEffect(() => {
        fetchCustomerData();
        fetchCategories();
        fetchDoctors();
        fetchProducts();
    }, []);

    // const onRefresh =
    //     useCallback(() => {

    //         setRefreshing(true);

    //         fetchCategories();
    //         fetchDoctors();
    //         fetchProducts();

    //     }, [fetchCategories(),
    //     fetchDoctors(),
    //     fetchCustomerData(),
    //     fetchProducts()]);

    return {

        categories,
        SuggestDoctor,
        productData,
        customerData,


        loadingCustomer,
        loadingCategories,
        loadingDoctors,
        loadingProducts,

        loading,
        refreshing,
    };
};