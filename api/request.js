/**
 * 封装uniapp的request
 *
 */
import {baseUrl as BASE_URL} from '../config/config.js'
// const BASE_URL = 'http://localhost:8000';
// export const BASE_URL = "http://192.168.31.147:8000";
export function request(url, method, data) {
	let token = '';
	// console.log(typeof(uni.getStorageSync('token').token));

	if (uni.getStorageSync('token') === '') {
		token = 'no-token';
	} else {
		token = uni.getStorageSync('token')
	}

	return new Promise(function(resolve, reject) {
		uni.request({
			url: BASE_URL + url,
			method: method,
			data: data,
			header: {
				'Content-Type': 'application/json',
				'token': token
			},
			success: function(res) {
				resolve(res.data)
			},
			fail: function(err) {
				uni.showModal({
					title: "错误",
					content: "网络请求异常",
					showCancel: false
				});
				reject(err)
			}
		})
	})
}

export function uploadFile(url, fileUrl) {
	let token = '';
	// console.log(typeof(uni.getStorageSync('token').token));

	if (uni.getStorageSync('token') === '') {
		token = 'no-token';
	} else {
		token = uni.getStorageSync('token')
	}

	return new Promise(function(resolve, reject) {
		uni.uploadFile({
			url: BASE_URL + url,
			filePath: fileUrl,
			name: 'file',
			header: {
				'token': token
			},
			success: function(res) {
				console.log(res);
				resolve(res.data)
			},
			fail: function(err) {
				uni.showModal({
					title: "错误",
					content: "网络请求异常",
					showCancel: false
				});
				reject(err)
			}
		})
	})
}