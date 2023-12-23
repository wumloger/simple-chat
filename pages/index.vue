<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="content">找回密码</block>
			<block slot="backText">返回</block>
		</cu-custom>

		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx',padding:'10upx'}" :border="false">
			<u-input placeholder="请输入邮箱" class="margin" v-model="email">
				<template slot="suffix">
					<u-code ref="uCode" @change="codeChange" seconds="60" changeText="X秒重新获取"></u-code>
					<u-button @tap="getCode" :text="tips" type="success" size="mini"></u-button>
				</template>
			</u-input>
			<u-input placeholder="请输入验证码" v-model.trim="code" type="text" class="margin"></u-input>
			<u-input placeholder="请输入新密码" v-model.trim="password" type="text" class="margin"></u-input>
			<u-input placeholder="请重复密码" v-model.trim="rePassword" type="password" class="margin"></u-input>
			<view style="width: 45%; margin: 0 auto;">
				<u-button plain text="提交" type="primary" @tap="changePassword()"></u-button>
			</view>

		</u-cell-group>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	import {
		request
	} from '@/api/request.js'
	export default {
		data() {
			return {
				email: '',
				code: '',
				password: '',
				rePassword: '',
				tips: '',
			}
		},
		methods: {
			codeChange(text) {
				this.tips = text;
			},
			getCode() {
				if (this.$refs.uCode.canGetCode) {
					// 模拟向后端请求验证码
					uni.showLoading({
						title: '正在获取验证码'
					})
					const _this = this;
					request("/user/getCode", "GET", {
						email: this.email
					}).then((res) => {
						console.log(res);
						uni.hideLoading();
						if (res.code == 200) {

							// 这里此提示会被this.start()方法中的提示覆盖
							_this.$refs.uToast.show({
								message: '验证码已发送',
								type: 'success',
								duration: '1000'
							})
							// 通知验证码组件内部开始倒计时
							this.$refs.uCode.start();
						} else {
							_this.$refs.uToast.show({
								message: res.msg,
								type: 'error',
								duration: '1000'
							})
						}
					})

				} else {
					this.$refs.uToast.show({
						message: '请等待倒计时结束',
						type: 'warning',
						duration: '1000'
					})
				}
			},
			change(e) {
				console.log('change', e);
			},
			changePassword() {
				if (this.rePassword != this.password) {
					console.log(this.rePassword + '' + this.password);
					this.$refs.uToast.show({
						message: '两次输入的密码不一致',
						type: 'warning',
						duration: '1000'
					})
					return;
				}
				if (this.password === '') {
					this.$refs.uToast.show({
						message: '密码不能为空',
						type: 'warning',
						duration: '1000'
					})
					return;
				}
				request("/user/forgetPassword", "POST", {
					email: this.email,
					code: this.code,
					password: this.password
				}).then((res) => {
					if (res.code == 200) {

						this.$refs.uToast.show({
							message: '修改成功',
							type: 'success',
							duration: '1000',
							complete: () => {
								uni.navigateTo({
									url: '/pages/login/login'
								})
							}
						})
					} else {
						this.$refs.uToast.show({
							message: res.msg,
							type: 'error',
							duration: '1000'
						})
					}
				})
			}
		}
	}
</script>

<style>

</style>