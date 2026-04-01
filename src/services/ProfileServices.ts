import { Utils } from "../common/Utils";
import { BaseUrl, Method } from "../config/Key";


export const update_Profile = async (data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = await Utils.getData('_TOKEN');
            const user = await Utils.getData('_USER_INFO');
            const customer_id = await Utils.getData('_CUSTOMER_ID');
            const id = user?.id || customer_id;
            console.log("datadatadata", id);
            let fetchParameter = {
                method: Method.PUT,
                body: data,
                headers: {
                    // "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`,
                },
            }

            let serverResponse = await fetch(BaseUrl.base_url + `customers/customer/${id}/`, fetchParameter);
            console.log("updateProfileResponse:", serverResponse);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const user_profile = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const customer_id = await Utils.getData('_CUSTOMER_ID');
            const user = await Utils.getData('_USER_INFO');
            const id = customer_id || user?.id;
            console.log("userprofile---->>>", user, customer_id, "id===>", id);
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`,
                },
            }

            let serverResponse = await fetch(BaseUrl.base_url + `customers/customer/${id}/`, fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const delete_Profile = async (Id: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.DELETE,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            console.log(BaseUrl.base_url + `ecom/customer/${Id}/`)
            let serverResponse = await fetch(BaseUrl.base_url + `customers/customer/${Id}/`, fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}
