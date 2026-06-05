
import { apiClient } from "./APIconfig";


export const getHomeCategory = async () => {
    try {
        const response = await apiClient('customers/dashboard/categories/', {
            method: 'GET'
        });
        console.log("categoryapiresponse", response)
        return response;
    } catch (error) {
        throw error;
    }
}

export const getSuggestedDoctor = async () => {
    try {
        const response = await apiClient(`customers/doctors/?suggested=${true}`, {
            method: 'GET'
        });
        console.log("sugesstedresposneeee", response);
        return response;
    } catch (error) {
        throw error;
    }
}



