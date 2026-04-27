// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   type ReactNode,
// } from "react";
// import { getAccessToken, login, refresh, logout } from "../utils/auth.utils";

// interface AuthContextType {
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   login: (username: string, password: string) => Promise<void>;
//   refresh: () => Promise<void>;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);
// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true); // true until token checked
 

//   useEffect(() => {
//   const token = getAccessToken();
//   const currentlyAuthenticated = !!token;

//   console.log("AuthProvider check →", {
//     hasToken: currentlyAuthenticated,
//     previous: isAuthenticated,
//     path: window.location.pathname,
//   });

//   if (currentlyAuthenticated !== isAuthenticated) {
//     setIsAuthenticated(currentlyAuthenticated);
//   }

//   setIsLoading(false);
// }, []);;

// const handleLogin = async (username: string, password: string) => {
//   await login(username, password);
//   const token = getAccessToken();
//   setIsAuthenticated(!!token);
// };

//   const handleLogout = () => {
//     logout();
//     setIsAuthenticated(false);
//   };

//   return (
//     <AuthContext.Provider
//       value={{ isAuthenticated, isLoading, login: handleLogin, refresh, logout: handleLogout }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };