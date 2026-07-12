import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/auth.store";
import type { RefreshResponse } from "../types/auth";

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const api = axios.create({
  //url do backend
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Instancja bez interceptorów do loginu, refreshu itd.
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

//interceptor Axios, który automatycznie dołączy access token do każdego requestu.
//Dzięki temu nie bede musiał za każdym razem pisać:
// headers: {
//   Authorization: `Bearer ${accessToken}`,
// }
// Przykładowo później wystarczy: const response = await api.get("/users/me");
// Interceptor sam doda: Authorization: Bearer TOKEN
//dzieki temu nie musze jak w postman za kazdym razem dodawac token do kazdego req

//ten dziala przed otrzymaniem odp
api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

//ten dziala po otrzymaniu odp, czyli sprawdza czy mamy err 401 jak tak to robi req po accesstoken
api.interceptors.response.use(
  //to działa, gdy odpowiedź jest poprawna, np. 200, 201
  //Po prostu zwraca odpowiedź dalej.
  (response) => response,

  //uruchamia się, gdy request zakończy się błędem, np. 401.
  //jest to anonimowa funckja
  async (error: AxiosError) => {
    //error.config zawiera konfigurację requestu, który się nie udał.
    //Dzięki temu później możemy wysłać dokładnie ten sam request ponownie.
    //config zawiera konfiguracje req wiec pozniej mozemy latwo ponowic req z nowym accesstoken
    const originalRequest = error.config as RetryRequestConfig | undefined;

    //sprawdzamy czy error jest 401 i czy req nie byl ponawiany
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      //To zabezpieczenie przed nieskończoną pętlą.
      //Dodajemy takie pole,  zeby pozniej sprawdzic czy req sie nie dubluje
      originalRequest._retry = true;

      try {
        //tutaj dajemy authApi.post a nie api.post, bo to api sa podpiete interceptors, wiec jakbym wywolal req to by wszystko sie od nowa zalaczylo
        const response = await authApi.post<RefreshResponse>("/auth/refresh");

        const newAccessToken = response.data.accessToken;

        useAuthStore.getState().setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh access token:", refreshError);
        useAuthStore.getState().logout();
        //refresh nie zadziałał
        // → czyścimy store
        // → przekazujemy błąd refreshu dalej
        //to sie pokaze jak nie uda sie naprawic req
        return Promise.reject(refreshError);
      }
    }
    //uruchamia się, gdy błąd nie spełnia warunku:
    //error.response.status === 401 && !originalRequest._retry
    //te bledy zostana przekazane do catch gdzie wywolujemy req np. tutaj:

    // try {
    //   const data = await login({
    //     email,
    //     password,
    //   });
    // } catch (error) {
    //   console.log(error);
    //   setError("Error logging in");
    // }

    return Promise.reject(error);
  },
);
