import { Utils } from "../common/Utils";
import { BaseUrl, Method } from "../config/Key";
import { apiClient, apiClient1 } from "./APIconfig";


export const update_Profile = async (data: any) => {
    try {
        const response = await apiClient('customers/profile/', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        console.log("response", response);
        return response;
    } catch (error) {
        throw error;
    }
}

// export const user_profile = async () => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             // const customer_id = await Utils.getData('_CUSTOMER_ID');
//             const user = await Utils.getData('_USER_INFO');
//             const id = user?.id;
//             console.log("userprofile---->>>", user, id);
//             let fetchParameter = {
//                 method: Method.GET,
//                 headers: {
//                     'Accept': 'application/json',
//                     'Content-Type': 'application/json',
//                     // 'Authorization': `Bearer ${token}`,
//                 },
//             }

//             let serverResponse = await fetch(BaseUrl.base_url + `customers/customer/${id}/`, fetchParameter);
//             resolve(serverResponse);
//         }
//         catch (error) {
//             reject(error);
//         }
//     })
// }


export const user_profile = async () => {
    try {
        const response = await apiClient('customers/profile/', {
            method: 'GET',
        });

        return response;
    } catch (error) {
        throw error;
    }
};

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



export const UploadProfilePhoto = async (data: FormData, method: 'POST' | 'PUT' = 'POST') => {
    try {
        const response = await apiClient1('user/upload/', {
            method: 'POST',
            body: data
        });

        return response;
    } catch (error) {
        throw error;
    }
}


export const getAddresses = async () => {
    try {
        const response = await apiClient('customers/addresses/', {
            method: 'GET',
        });

        return response;
    } catch (error) {
        throw error;
    }
};

export const AddAddresses = async (data: any) => {
    try {
        const response = await apiClient('customers/addresses/', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        return response;
    } catch (error) {
        throw error;
    }
};


export const UpdateAddresses = async (AddressID: any, data: any) => {
    try {
        const response = await apiClient(`customers/addresses/?id=${AddressID}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const DeleteAddresses = async (AddressID: any) => {
    try {
        const response = await apiClient(`customers/addresses/?id=${AddressID}`, {
            method: 'DELETE',
        });
        return response;
    } catch (error) {
        throw error;
    }
};


export const get_prakriti_info = async () => {
    try {
        const response = await apiClient(`customers/prakriti/info/`, {
            method: 'GET',
        });
        return response;
    } catch (error) {
        throw error;
    }
};