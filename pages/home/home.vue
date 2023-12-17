<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue">
			<block slot="content">我的</block>
		</cu-custom>
		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'}">
			<u-cell>
				<view slot="title" class="u-slot-title flex justify-start align-center">
					<u-avatar :src="userInfo.avatar" shape="square" size="100"></u-avatar>
					<view class="base-info margin margin-left-lg">
						<view class="flex justify-start">
							<u-text style="width: fit-content;" :block="false" :bold="true" :size="22"
								:text="userInfo.username" suffixIcon="woman" :iconStyle="{color:'pink',
								fontSize:'44upx'}" v-if="userInfo.sex==='女'"></u-text>
							<u-text style="width: fit-content;" :block="false" :bold="true" :size="22"
								:text="userInfo.username" suffixIcon="man" :iconStyle="{color:'#00D1FB',
								fontSize:'44upx'}" v-else></u-text>
						</view>

						<text style="color:#6a6a6a;">昵称：{{userInfo.nickname}}</text><br>
						<text>用户id：<span style="color: gray;" @click="copy">点击复制</span><br />
							{{userInfo.id}}</text>
					</view>
				</view>
			</u-cell>
		</u-cell-group>
		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'}">
			<u-cell icon="fingerprint" title="个人信息" :isLink="true"></u-cell>
			<u-cell icon="lock" title="账号安全" :isLink="true"></u-cell>
			<u-cell icon="question-circle" title="关于软件" :isLink="true"></u-cell>
		</u-cell-group>
		<view style="backgroundColor:white;margin:10upx;margin-top: 30upx;">
			<u-button type="primary" text="退出" @tap="exit"></u-button>
		</view>

		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo: null
			}
		},
		methods: {
			getUserInfo() {
				this.userInfo = uni.getStorageSync("userInfo");
			},
			copy() {
				const _this = this;
				uni.setClipboardData({
					data: this.userInfo.id,
					showToast: false,
					success: function() {
						_this.$refs.uToast.show({
							message: '复制成功',
							type: 'success'
						})
					}
				});
			},
			exit() {
				uni.clearStorageSync();
				uni.navigateTo({
					url: '/pages/login/login'
				})
			}
		},
		onLoad() {

		},
		onShow() {
			this.getUserInfo();
		}

	}
</script>

<style>

</style>