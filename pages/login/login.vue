<template>

	<view class="container" style="background-color: #FCFCFC;">
		<cu-custom bgColor="bg-gradual-blue">
			<block slot="content">登录</block>
		</cu-custom>
		<u-subsection :list="list" :current="current" @change="sectionChange" mode="subsection">
		</u-subsection>
		<view class="text-center padding" style="margin-top: 70upx;" v-show="current == 0">
			<image src="../../static/img/logo.png"></image>
			<u-form :model="form" ref="uForm1">
				<u-form-item label="用户名" label-width="50" :required="true" prop="username">
					<u-input v-model="form.username" type="text" />
				</u-form-item>
				<u-form-item label="密码" label-width="50" :required="true" prop="password">
					<u-input v-model="form.password" type="password" />
				</u-form-item>
			</u-form>

			<button type="primary" class="bg-gradual-blue margin-top-sm" @click="login">登录</button>
		</view>
		<view class="text-center padding" style="margin-top: 70upx;" v-show="current == 1">
			<image src="../../static/img/logo.png"></image>
			<u-form :model="form" ref="uForm2">
				<u-form-item label="用户名" label-width="50" :required="true" prop="username">
					<u-input v-model="form.username" type="text" />
				</u-form-item>
				<u-form-item label="密码" label-width="50" :required="true" prop="password">
					<u-input v-model="form.password" type="text" />
				</u-form-item>
				<u-form-item label="确认密码" label-width="50" :required="true" prop="repassword">
					<u-input v-model="form.repassword" type="password" />
				</u-form-item>
			</u-form>

			<button type="primary" class="bg-gradual-blue margin-top-sm" @click="register">注册</button>
		</view>
		<view class="text text-center">
			<text class="text-xs text-cyan" @tap="toRePassword">忘记密码？点我找回</text>
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
					password: '123456',
					repassword: '123456'
				},
				list: ["登录", "注册"],
				current: 0,
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
					repassword: [{
							required: true,
							message: '请输入密码',
							trigger: 'blur'
						},
						{
							// 自定义验证函数，见上说明
							validator: (rule, value, callback) => {
								// 上面有说，返回true表示校验通过，返回false表示不通过
								// uni.$u.test.mobile()就是返回true或者false的
								return this.form.password === this.form.repassword;
							},
							message: '两次输入的密码不一致',
							// 触发器可以同时用blur和change
							trigger: ['change', 'blur'],
						}
					],

				}
			}
		},
		onReady() {
			this.$refs.uForm1.setRules(this.rules);
			this.$refs.uForm2.setRules(this.rules);
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

			},
			sectionChange(index) {
				this.current = index;
			},
			toRePassword() {
				console.log("click");
				uni.navigateTo({
					url: '/pages/index'
				})
			},
			async register() {
				const _this = this;
				const res = await request("/user/register", "POST", {
					username: this.form.username,
					password: this.form.password
				});
				console.log(res);
				if (res.code == 200) {
					this.$refs.uToast.show({
							type: 'success',
							message: res.msg,
							duration: '1000'
						}),
						_this.login();
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