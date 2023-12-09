<template>
	<view class="container" style="background-color: #FCFCFC;">
		<cu-custom bgColor="bg-gradual-blue">
			<block slot="content">登录</block>
		</cu-custom>

		<view class="text-center padding" style="margin-top: 70upx;">
			<image src="../../static/img/logo.png"></image>
			<u-form :model="form" ref="uForm">
				<u-form-item label="用户名" label-width="50" :required="true" prop="username">
					<u-input v-model="form.username" type="text" />
				</u-form-item>
				<u-form-item label="密码" label-width="50" :required="true" prop="password">
					<u-input v-model="form.password" type="password" />
				</u-form-item>
			</u-form>

			<button type="primary" class="bg-gradual-blue" @click="login">登录</button>

		</view>
		<view class="text text-center">
			<text class="text-xs text-cyan">还没注册？点我前往注册</text>
		</view>
		<u-toast ref="uToast"></u-toast>
	</view>

</template>

<script>
	import {
		request
	} from '@/api/request.js';
	export default {
		data() {
			return {
				form: {
					username: '张三',
					password: '123456'
				},

				rules: {
					username: [{
						required: true,
						message: '请输入用户名',
						trigger: 'blur'
					}],
					password: [{
						required: true,
						message: '请输入密码',
						trigger: 'blur'
					}],

				}
			}
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		methods: {
			async login() {
				const res = await request('/user/login', 'POST', {
					username: this.form.username,
					password: this.form.password
				})
				console.log(res);
				if (res.code === '200') {
					uni.setStorageSync("token", res.data);
					//解析token
					let token = res.data; //在请求头中获取token
					let strings = token.split("."); //截取token，获取载体
					let userInfo = JSON.parse(decodeURIComponent(escape(atob(strings[1].replace(/-/g, "+").replace(
						/_/g, "/"))))); //解析，需要吧‘_’,'-'进行转换否则会无法解析
					console.log(userInfo);
					//存在本地
					uni.setStorageSync("userInfo", userInfo);
					//跳转首页
					this.$refs.uToast.show({
						type: 'success',
						message: "登录成功",
						url: '/pages/index/index',
						complete() {
							uni.switchTab({
								url: '/pages/index/index',
							})
						}
					})
				} else {
					this.$refs.uToast.show({
						type: 'error',
						message: res.msg,
					})
				}

			}
		}
	}
</script>

<style>

</style>