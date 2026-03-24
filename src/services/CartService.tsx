import { Utils } from "../common/Utils";
import { BaseUrl, Method } from "../config/Key";

export const get_cart_list = async (CustomerID: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = await Utils.getData('_TOKEN');
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            let serverResponse = await fetch(BaseUrl.base_url + `carts/cartitemsbycustomer/${CustomerID}/`, fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}




export const add_cart_item = async (data: object) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = await Utils.getData('_TOKEN');
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },

            }
            let serverResponse = await fetch(BaseUrl.base_url + 'carts/cartitem/', fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const update_cart_item_quantity = async (ID : string, data: object) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = await Utils.getData('_TOKEN');
            let fetchParameter = {
                method: Method.PUT,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },

            }

            let serverResponse = await fetch(BaseUrl.base_url + `carts/cartitem/${ID}/`, fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const order_place_item = async (data: object) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = await Utils.getData('_TOKEN');
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },

            }

            let serverResponse = await fetch(BaseUrl.base_url + 'orders/order/', fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const delete_item = async (itemID: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = await Utils.getData('_TOKEN');
            let fetchParameter = {
                method: Method.DELETE,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            console.log(BaseUrl.base_url + `ecom/cartitem/${itemID}/`);
            let serverResponse = await fetch(BaseUrl.base_url + `carts/cartitem/${itemID}/`, fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}