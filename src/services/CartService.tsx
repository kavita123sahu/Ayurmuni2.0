import { Utils } from "../common/Utils";
import { BaseUrl, Method } from "../config/Key";
import { apiClient } from "./APIconfig";


export const AddupdateCart = async ({
    variant_id,
    quantity,
}: {
    variant_id: string;
    quantity: number;
}) => {
    console.log("varinttquantity", variant_id, quantity)
    try {
        const response = await apiClient(
            `cart/?variant_id=${variant_id}&quantity=${quantity}`,
            {
                method: 'POST',
            }
        );

        return response;
    } catch (error) {
        throw error;
    }
};



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

export const update_cart_item_quantity = async (ID: string, data: object) => {
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





export const getAllCart = async () => {
    try {
        const response = await apiClient('cart/', {
            method: 'GET'
        });
        return response;
    } catch (error) {
        throw error;
    }
}
