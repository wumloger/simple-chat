<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="content">用户信息</block>
			<block slot="backText">返回</block>
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
						<text
							style="color:#6a6a6a;">生日：{{userInfo.birthday == null ? '未知':userInfo.birthday}}</text><br>
						<text>用户id：<span style="color: gray;" @click="copy">点击复制</span><br />
							{{userInfo.id}}</text>
					</view>
				</view>
			</u-cell>
		</u-cell-group>
		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'}" v-if="friendInfo">
			<view class="flex justify-between">
				<u--text text="备注:" align="left" margin="3px 3px 3px 3px" type="tips"></u--text>
				<u--text text="编辑" align="right" margin="3px" type="primary" v-if="inputFlag"
					@tap="inputFlag = false"></u--text>
				<u--text text="保存" align="right" margin="0 3px 0 0" type="success" v-else
					@tap="updateRemark()"></u--text>
			</view>
			<u--textarea v-model="friendInfo.remark" :style="{backgroundColor:'white'}" maxlength="100" border="bottom"
				count :disabled="inputFlag"></u--textarea>
		</u-cell-group>
		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'}" v-if="friendInfo">
			<u-text class="padding" :block="true" :size="16" :bold="true" align="center" type="error" text="删除好友"
				prefixIcon="warning" :iconStyle="{color:'red',
				fontSize:'44upx',marginRight:'10upx'}" v-if="friendInfo" @tap="deleteFriend()"></u-text>
			<u-line></u-line>
			<u-text class="padding" :block="true" :size="16" :bold="true" align="center" type="primary" text="发消息"
				prefixIcon="chat" :iconStyle="{color:'#00D1FB',
				fontSize:'44upx',marginRight:'10upx'}" @tap="toFriendChat()"></u-text>
		</u-cell-group>
		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'}" v-else-if="id != userId">
			<u-text class="padding" :block="true" :size="16" :bold="true" align="center" type="primary" text="加好友"
				prefixIcon="man-add" :iconStyle="{color:'#00D1FB',
				fontSize:'44upx',marginRight:'10upx'}" @tap="addFriend()"></u-text>
		</u-cell-group>
		<u-toast ref="uToast"></u-toast>
		<u-modal :show="show" title="是否确认删除？" content='注意!该操作一经确认无法撤回!请谨慎选择!' :showCancelButton="true"
			:buttonReverse="true" :closeOnClickOverlay="true" @close="show=false" @cancel="show=false"
			@confirm="modelConfirm"></u-modal>
		<u-modal :show="addShow" title="请填写添加备注" :showCancelButton="true" :closeOnClickOverlay="true"
			@close="addShow=false" @cancel="addShow=false" @confirm="addConfirm">
			<view class="slot-content" style="width: 100%;">
				<u-input v-model="remark" :clearable="true"></u-input>
			</view>
		</u-modal>
	</view>
</template>

<script>
	import {
		request
	} from '@/api/request.js'
	export default {
		data() {
			return {
				id: '',
				userId: '',
				userInfo: {},
				inputFlag: true,
				friendInfo: null,
				show: false,
				addShow: false,
				remark: ''
			}
		},
		methods: {
			async getUserInfo() {
				const res = await request("/user/getUser", "GET", {
					id: this.userId
				});
				console.log(res);
				this.userInfo = res.data[0];
			},
			async getFriendInfo() {
				const userId = uni.getStorageSync("userInfo").id;
				const res = await request("/friend/get/" + this.userId + "/" + userId);
				this.friendInfo = res;
				console.log(res);
			},
			toFriendChat() {
				uni.navigateTo({
					url: '/pages/chat/friend-chat?id=' + this.userId
				})
			},
			updateRemark() {
				this.inputFlag = true;
				request("/friend/update", "PUT", this.friendInfo).then((res) => {
					if (res.code == 200) {
						this.$refs.uToast.show({
							message: '修改成功',
							type: 'success'
						})
					} else {
						this.$refs.uToast.show({
							message: '修改失败' + res.msg,
							type: 'error'
						})
					}
				})
			},
			copy() {
				const _this = this;
				uni.setClipboardData({
					data: this.userId,
					showToast: false,
					success: function() {
						_this.$refs.uToast.show({
							message: '复制成功',
							type: 'success'
						})
					}
				});
			},
			deleteFriend() {
				this.show = true;
			},
			addFriend() {
				this.addShow = true
			},
			addConfirm() {
				const userInfo = uni.getStorageSync("userInfo")
				let invitation = {
					userId: userInfo.id,
					userNickname: userInfo.nickname,
					userAvatar: userInfo.avatar,
					friendId: this.userInfo.id,
					friendNickname: this.userInfo.nickname,
					friendAvatar: this.userInfo.avatar,
					remark: this.remark
				}
				request("/friend/apply", "POST", invitation).then((res) => {
					if (res.code == 200) {
						this.$refs.uToast.show({
							message: '好友申请成功',
							type: 'success'
						})
					} else {
						this.$refs.uToast.show({
							message: res.msg,
							type: 'error'
						})
					}
				})
				this.addShow = false;
			},
			modelConfirm() {
				request("/friend/delete/" + this.userInfo.id, "DELETE").then((res) => {
					if (res.code == 200) {
						this.$refs.uToast.show({
							message: '删除成功',
							type: 'success'
						})
					} else {
						this.$refs.uToast.show({
							message: res.msg,
							type: 'error'
						})
					}
				})
				this.show = false
			}
		},
		onLoad(option) {
			this.id = uni.getStorageSync("userInfo").id;
			this.userId = option.id;
			this.getUserInfo();
			this.getFriendInfo();

		},

	}
</script>

<style>

</style>