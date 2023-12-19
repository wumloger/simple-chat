<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="content">账号安全</block>
			<block slot="backText">返回</block>
		</cu-custom>
		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx',padding:'10upx'}" :border="false">
			<u-text text="修改密码" type="tips"></u-text>
			<u-input placeholder="请输入旧密码" v-model.trim="oldPassword" type="password" class="margin"></u-input>
			<u-input placeholder="请输入新密码" v-model.trim="password" type="text" class="margin"></u-input>
			<view style="width: 45%; margin: 0 auto;">
				<u-button plain text="提交" type="primary" @tap="changePassword"></u-button>
			</view>

		</u-cell-group>
		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx',padding:'10upx'}" :border="false">
			<u-text text="绑定邮箱" type="tips"></u-text>
			<u-input placeholder="请输入邮箱" class="margin" v-model="email">
				<template slot="suffix">
					<u-code ref="uCode" @change="codeChange" seconds="60" changeText="X秒重新获取"></u-code>
					<u-button @tap="getCode" :text="tips" type="success" size="mini"></u-button>
				</template>
			</u-input>
			<u-input placeholder="请输入验证码" v-model.trim="code" type="text" class="margin"></u-input>
			<view style="width: 45%; margin: 0 auto;">
				<u-button plain text="提交" type="primary" @tap="bind"></u-button>
			</view>

		</u-cell-group>
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
				oldPassword: '',
				password: '',
				tips: '',
				value: '',
				email: '2975800991@qq.com',
				code: ''
			}
		},
		methods: {
			changePassword() {
				request("/user/updatePassword", "PUT", {
					oldPassword: this.oldPassword,
					password: this.password
				}).then((res) => {
					if (res.code == 200) {
						this.$refs.uToast.show({
							message: '修改成功',
							type: 'success',
							duration: '1000'
						})
					} else {
						this.$refs.uToast.show({
							message: res.msg,
							type: 'error',
							duration: '1000'
						})
					}
				})
			},
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
			async bind() {
				const res = await request("/user/bind", "POST", {
					email: this.email,
					code: this.code
				})
				if (res.code == 200) {
					const userInfo = uni.getStorageSync("userInfo");
					userInfo.email = this.email;
					uni.setStorageSync("userInfo", userInfo);
					this.$refs.uToast.show({
						message: '绑定成功',
						type: 'success',
						duration: '1000'
					})
				} else {
					this.$refs.uToast.show({
						message: res.msg,
						type: 'error',
						duration: '1000'
					})
				}

			}
		}
	}
</script>

<style>

</style>