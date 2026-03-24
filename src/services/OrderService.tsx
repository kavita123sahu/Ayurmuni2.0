import { Utils } from "../common/Utils";
import { BaseUrl, Method } from "../config/Key";

export const getCustomerOrder = async () => {

    return new Promise(async (resolve, reject) => {
        const customer_id = await Utils.getData('_CUSTOMER_ID');
        const user = await Utils.getData('_USER_INFO');
        const id = user?.id || customer_id;
        console.log("getcustomerid", id);
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            }

            console.log("orderr", BaseUrl.base_url + `orders/getorderbycustomerid/${id}/`);
            let serverResponse = await fetch(BaseUrl.base_url + `orders/getorderbycustomerid/${id}/`, fetchParameter);
            resolve(serverResponse);

        }
        catch (error) {
            reject(error);
        }
    })
}


export const generate_invoice_API = async (data: object) => {
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


            let serverResponse = await fetch(BaseUrl.base_url + 'orders/ordersinvoice/', fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const order_cancle_API = async (data: object) => {
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

            let serverResponse = await fetch(BaseUrl.base_url + 'orders/cancelorder/', fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const payment_verify_API = async (data: object) => {
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

            let serverResponse = await fetch(BaseUrl.base_url + 'payments/payment-verify/', fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}