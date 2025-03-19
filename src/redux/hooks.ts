import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import {
  logout,
  changeRole,
  setUser,
  loginUser,
  registerUser,
  fetchCurrentUser,
} from "./slices/authSlice";
import { Role } from "@/utils/roles";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Helper hooks for specific slices
export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  return {
    ...auth,
    login: (email: string, password: string) => {
      return dispatch(loginUser({ email, password }));
    },
    register: (userData: any) => {
      return dispatch(registerUser(userData));
    },
    logout: () => dispatch(logout()),
    changeRole: (role: Role) => dispatch(changeRole(role)),
    updateUser: (userData: any) => dispatch(setUser(userData)),
    fetchCurrentUser: () => dispatch(fetchCurrentUser()),
  };
};

export const useUiPreferences = () => {
  const uiPreferences = useAppSelector((state) => state.uiPreferences);
  return uiPreferences;
};

export const useSearch = () => {
  const search = useAppSelector((state) => state.search);
  return search;
};
