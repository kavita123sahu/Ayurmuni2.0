import { utils } from "xlsx";
import { BaseUrl, Method } from "../config/Key";
import { Utils } from "../common/Utils";

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
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const getSlotAvailable = async (doctor_id: any ) => {
    return new Promise(async (resolve, reject) => {
        try {

            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            console.log("urlllllllllllllll", BaseUrl.base_url + `healthcare/appointments/slots/available/?doctor_id=${doctor_id}`)
            let serverResponse = await fetch(BaseUrl.base_url + `healthcare/appointments/slots/available/?doctor_id=${doctor_id}`, fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const getConsult = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            let serverResponse = await fetch(BaseUrl.base_url + 'ecom/consultations/', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const getDoctor = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            let serverResponse = await fetch(BaseUrl.base_url + 'healthcare/doctor/', fetchParameter);
            resolve(serverResponse);
        }

        catch (error) {
            reject(error);
        }
    })
}

export const getDoctorBySpeciality = async (data: Object) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            let serverResponse = await fetch(BaseUrl.base_url + 'healthcare/doctors_speciality/', fetchParameter);
            resolve(serverResponse);
        }

        catch (error) {
            reject(error);
        }
    })
}

export const getPatient = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            console.log(BaseUrl.base_url + 'healthcare/patient/')

            let serverResponse = await fetch(BaseUrl.base_url + 'healthcare/patient/', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}



export const getBookingOrder = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            console.log(BaseUrl.base_url + '/healthcare/appointments/consultations-with-orders/')

            let serverResponse = await fetch(BaseUrl.base_url + '/healthcare/appointments/consultations-with-orders/', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}
export const addPatient = async (data: Object) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            console.log('Add Patient Fetch Params:', BaseUrl.base_url + 'ecom/patient/', fetchParameter);
            let serverResponse = await fetch(BaseUrl.base_url + 'healthcare/patient/', fetchParameter);
            resolve(serverResponse);
        }

        catch (error) {
            reject(error);
        }
    })
}


export const BookConsultation = async (data: object) => {
    
    return new Promise(async (resolve, reject) => {
        
    // const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcyMDAzODM0LCJpYXQiOjE3NzE5MTc0MzQsImp0aSI6ImYyNzQyOWFhZDllNDRhNmE5YWNjMDcyNTU5MDBiZmUxIiwidXNlcl9pZCI6IjljNWRkY2I2LTUzYTYtNDU3OS05MzAxLTkwMTVjOGEyODBkMyJ9.gFEzpw4zNmNnpQXHOb6MqHk53dFzjskzVgwMxY6nTrs"
        try {

            const TOKEN = await Utils.getData('_TOKEN');
            console.log("tokennn___>", TOKEN);
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                     'Authorization': 'Bearer ' + TOKEN
                },
            }

            let serverResponse = await fetch(BaseUrl.base_url + 'healthcare/appointments/book/', fetchParameter);
            resolve(serverResponse);
        }

        catch (error) {
            reject(error);
        }
    })
}



export const BookSlot = async (data: Object) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            let serverResponse = await fetch(BaseUrl.base_url + 'healthcare/slots/', fetchParameter);
            resolve(serverResponse);
        }

        catch (error) {
            reject(error);
        }
    })
}


export const getSpecialty = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            let serverResponse = await fetch(BaseUrl.base_url + 'healthcare/speciality/', fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}
export const getTreatment = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }

            let serverResponse = await fetch(BaseUrl.base_url + 'healthcare/treatmenttypes/', fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const create_razorpay_order_ID = async (data: Object) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            let serverResponse = await fetch(BaseUrl.base_url + 'payments/create-razorpay-order/', fetchParameter);
            resolve(serverResponse);
        }
        catch (error) {
            reject(error);
        }
    })
}

