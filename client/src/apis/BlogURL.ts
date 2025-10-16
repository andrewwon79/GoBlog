import axios from "axios";

//in kubernetes this doesn't work because our backend is exposed to "backend:3003/api/todos"
//right now my frontend has a dynamic url because of the way kubrnetes works, something like http://127.0.0.1:52210/api/todos
//this changes everytime, our backend is exposed to a constant
//it worked before because our backend was in the same container and hosted on the same network I guess, we didn't even call goblog-app-service and were using http://127.0.0.1:52210/api/todos
//this worked because it was in the same container
//So yes — if your frontend had tried to call http://goblog-app-service:80/api/todos from inside the same container, it would have failed, because:
//  DNS resolution for goblog-app-service only works between pods, not inside a single container
//  You didn’t expose port 52210 via the service — only 3003

//in kubernetes this doesn't work because our backend is exposed to "backend:3003/api/todos" (read the above for explanation)
//ok for real, so this doesn't work when outside of our kubernetes cluster
//it only works if the frontend INSIDE our cluster is calling backend, then it works
//but if a browser is calling it, we need to use api/todos because nginx will set it for us
const baseURL = import.meta.env.MODE === 'production' ? "api/todos" : "http://localhost:3003/api/todos";

export default axios.create ({
    baseURL: baseURL,
})