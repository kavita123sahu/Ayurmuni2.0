import { Utils } from "../common/Utils";
import { BaseUrl, Method } from "../config/Key";
import { apiClient } from "./APIconfig";


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
//     return apiClient(
//         'customers/profile/',
//         {
//             method: 'GET',
//         },
//     );
// };


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

export const deleteAccount = async () => {
    try {
        const response = await apiClient('customers/profile/', {
            method: 'DELETE',
        });
        return response;
    } catch (error) {
        throw error;
    }
};



export const UploadProfilePhoto = async (data: FormData) => {
    try {
        const response = await apiClient('user/upload/', {
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