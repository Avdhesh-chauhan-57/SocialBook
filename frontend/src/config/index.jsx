import axios from "axios";


export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://socialbook-aa08.onrender.com"


export const clientServer = axios.create({
    baseURL: BASE_URL,
})


export const getImageUrl = (path) => path?.startsWith("http") ? path : `${BASE_URL}/${path}`;