import { BaseUrl, Method } from "../config/Key";

export const getHomePage = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            let serverResponse = await fetch(BaseUrl.base_url + 'catalogs/homepage/', fetchParameter);
            let response = await serverResponse.json();

            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const get_health_category = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            let serverResponse = await fetch(BaseUrl.base_url + 'catalogs/healthconcernscategory/', fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}



export const get_EST_date = async (vendor_pro_id: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            console.log(BaseUrl.base_url + `orders/orders-delivery-estimate/${vendor_pro_id}/`)
            let serverResponse = await fetch(BaseUrl.base_url + `orders/orders-delivery-estimate/${vendor_pro_id}/`, fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const get_shop_category = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            let serverResponse = await fetch(BaseUrl.base_url + 'catalogs/productcategory/', fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const get_product_category = async (categoryID: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            console.log(BaseUrl.base_url + `catalogs/vendorproductbycategory/${categoryID}/`)
            let serverResponse = await fetch(BaseUrl.base_url + `catalogs/vendorproductbycategory/${categoryID}/`, fetchParameter);
            resolve(serverResponse);
            
        }
        catch (error) {
            reject(error);
        }
    })
}


export const getVendorProduct = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            let serverResponse = await fetch(BaseUrl.base_url + 'catalogs/vendorproduct/', fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const getBestSellerProduct = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            let serverResponse = await fetch(BaseUrl.base_url + 'catalogs/bestselling/', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const getProductsDetail = async (product_id: string) => {
    return new Promise(async (resolve, reject) => {

        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            let serverResponse = await fetch(BaseUrl.base_url + `catalogs/vendorproduct/${product_id}/`, fetchParameter);
            console.log('serverResponse', serverResponse)
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const getProductsSearch = async (query: string) => {
    return new Promise(async (resolve, reject) => {

        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            let serverResponse = await fetch(BaseUrl.base_url + `catalogs/productsearch/query=${query}`, fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const getProductSimilar = async (brand: string, form: string, tratment: string, category: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            let serverResponse = await fetch(BaseUrl.base_url + `catalogs/productsimilar/?brand=${brand}&form=${form}&treatment=${tratment}&category=${category}`, fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}