
import { setupAuthInterceptor } from "../tokenManager";
import authService from "./authService";

// Initialize auth interceptor
setupAuthInterceptor();

export { authService };
export default authService;
