import axios from "axios";


export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9000"


export const clientServer = axios.create({
    baseURL: BASE_URL,
})


export const getImageUrl = (path) => path?.startsWith("http") ? path : `${BASE_URL}/${path}`;