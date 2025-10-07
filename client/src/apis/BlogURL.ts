import axios from "axios";

const baseURL = import.meta.env.MODE === 'production' ? "api/todos" : "http://localhost:3003/api/todos";

export default axios.create ({
    baseURL: baseURL,
})