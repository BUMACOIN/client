import TOKEN from '@/constants/storage.constant';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { axiosInstance } from '.';

export const responseOnFulfilled = async (res: AxiosResponse) => {
	if (res.status >= 400) {
		throw new Error(res.data);
	}

	return res;
};

export const responseOnRejected = async (error: AxiosError) => {
	const { config } = error;
	const originalRequest = config;

	if (error.response?.status === 401) {
		try {
			console.log('test');
			const {
				data: { accessToken }
			} = await axiosInstance.put('/login', null, {
				headers: {
					[TOKEN.REFRESH_TOKEN]: localStorage.getItem(TOKEN.REFRESH_TOKEN)
				}
			});

			localStorage.setItem(TOKEN.ACCESS_TOKEN, accessToken);

			if (originalRequest) return axiosInstance(originalRequest);
		} catch (e) {
			throw e as Error;
		}
	}

	return error;
};

export const requestOnFulfilled = async (config: InternalAxiosRequestConfig) => {
	const accessToken = localStorage.getItem(TOKEN.ACCESS_TOKEN);

	if (!config.headers || !accessToken) return config;

	config.headers.Authorization = accessToken;

	return config;
};