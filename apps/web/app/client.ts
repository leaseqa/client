import axios from "axios";

const axiosWithCredentials = axios.create({withCredentials: true});

export const HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER || "http://localhost:4000";
