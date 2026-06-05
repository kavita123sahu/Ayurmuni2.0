import { Utils } from "../common/Utils";
import { BaseUrl, Method } from "../config/Key";




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