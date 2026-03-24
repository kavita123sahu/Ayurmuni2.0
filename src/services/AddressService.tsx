import { Utils } from "../common/Utils";
import { BaseUrl, Method } from "../config/Key";



export const postAddress = async (data: object) => {
    return new Promise(async (resolve, reject) => {
        try {
            const token = await Utils.getData('_TOKEN')
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer ' + token
                },
            }
            
            let serverResponse = await fetch(BaseUrl.base_url + 'customers/addresses/', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const getAddressByID = async (addressID: string) => {

    return new Promise(async (resolve, reject) => {
        try {
            const token = await Utils.getData('_TOKEN')
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            console.log(BaseUrl.base_url + `customers/addresses/${addressID}`, fetchParameter)
            let serverResponse = await fetch(BaseUrl.base_url + `customers/addresses/${addressID}`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const DeleteAddressByID = async (addressID: string) => {

    return new Promise(async (resolve, reject) => {
        try {
            const token = await Utils.getData('_TOKEN')
            let fetchParameter = {
                method: Method.DELETE,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            console.log(BaseUrl.base_url + `ecom/addresses/${addressID}/`, fetchParameter)
            let serverResponse = await fetch(BaseUrl.base_url + `customers/addresses/${addressID}/`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const getAddress = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            let serverResponse = await fetch(BaseUrl.base_url + 'customers/addresses/', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const editAddress = async (AddressID: string, data: object) => {

    return new Promise(async (resolve, reject) => {
        try {
            const token = await Utils.getData('_TOKEN')
            let fetchParameter = {
                method: Method.PUT,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer ' + token
                },
            }
            console.log(BaseUrl.base_url + `ecom/addresses/${AddressID}/`)
            let serverResponse = await fetch(BaseUrl.base_url + `customers/addresses/${AddressID}/`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}
