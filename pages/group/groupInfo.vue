<template>
	<view class="container" v-if="groupInfo">
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="content">群组信息</block>
			<block slot="backText">返回</block>
		</cu-custom>
		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'}">
			<u-cell>
				<view slot="title" class="u-slot-title flex justify-start align-center">
					<u-avatar :src="groupInfo.avatar" shape="square" size="100"></u-avatar>
					<view class="base-info margin margin-left-lg">
						<view class="flex justify-start">
							<u-text style="width: fit-content;" :block="false" :bold="true" :size="22"
								:text="groupInfo.name"></u-text>
						</view>

						<text style="color:#6a6a6a;" v-if="master">群主：{{master.username}}</text><br>
						<text>群号：<span style="color: gray;" @click="copy">点击复制</span><br />
							{{groupInfo.id}}</text>
					</view>
				</view>
			</u-cell>
		</u-cell-group>
		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'}">
			<u-cell icon="fingerprint" title="成员列表" :isLink="true" @tap="toUsers"></u-cell>
			<u-cell icon="lock" title="管理群聊" :isLink="true" v-if="auth.isAdmin" @tap="toUpdate"></u-cell>
			<u-cell icon="" size="large" title="群公告" :label="groupInfo.notice"></u-cell>
		</u-cell-group>
		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'}">
			<u-cell icon="" size="large" title="群介绍" :label="groupInfo.intro"></u-cell>
		</u-cell-group>
		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx',marginTop:'30upx'}" v-if="!auth.isMaster">
			<u-button text="退出群聊" type="error" :plain="true" v-if="auth.isMember" @click="show = true"></u-button>
			<u-button text="加入群聊" type="success" :plain="true" v-else @click="addShow = true"></u-button>
		</u-cell-group>
		<u-modal :show="show" title="是否确定退出？" content='注意!该操作一经确认无法撤回!请谨慎选择!' :showCancelButton="true"
			:buttonReverse="true" :closeOnClickOverlay="true" @close="show=false" @cancel="show=false"
			@confirm="modelConfirm"></u-modal>
		<u-toast ref="uToast"></u-toast>
		<u-modal :show="addShow" title="请填写申请备注" :showCancelButton="true" :closeOnClickOverlay="true"
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
				groupInfo: null,
				master: null,
				groupUsers: [],
				auth: {
					isMember: false,
					isAdmin: false,
					isMaster: false
				},
				groupUser: null,
				show: false,
				remark: '',
				addShow: false
			}
		},
		methods: {
			async getGroupInfo() {
				const res = await request("/group/get/" + this.id,
					"GET");
				console.log(res);
				this.groupInfo = res.data
				const result = await request("/user/getUser", "GET", {
					id: this.groupInfo.createBy
				})
				this.master = result.data[0];
				if (this.groupInfo.createBy === uni.getStorageSync("userInfo").id) {
					this.auth.isAdmin = true;
					this.auth.isMaster = true;
				}


			},
			async getGroupUser() {
				const res = await request("/group/list/" + this.id, "GET");
				console.log(res);
				this.groupUsers = res;
				const userId = uni.getStorageSync("userInfo").id;
				this.groupUsers.forEach((user) => {
					if (user.userId === userId) {
						this.auth.isMember = true;
						if (user.adminable === 1) {
							this.auth.isAdmin = true;
						}
					}
				})
				console.log(this.auth);
			},
			toUsers() {
				uni.navigateTo({
					url: '/pages/group/groupUsers?id=' + this.groupInfo.id + '&master=' + this.master.id
				})
			},
			toUpdate() {
				uni.navigateTo({
					url: '/pages/group/groupUpdate?id=' + this.groupInfo.id
				})
			},
			exitGroup() {
				const userId = uni.getStorageSync("userInfo").id;
				request("/group/get/" + this.id + "/" + userId, "GET").then((res) => {
					console.log(res);
					if (res != null) {
						this.groupUser = res;
						this.groupUser.status = 2;
						request("/group/exitGroup", "POST", this.groupUser).then((res) => {
							if (res.code == 200) {
								this.$refs.uToast.show({
									message: '退出成功',
									type: 'success',
									complete() {
										uni.switchTab({
											url: '/pages/index/index'
										})
									}
								})
							} else {
								this.$refs.uToast.show({
									message: '退出失败' + res.msg,
									type: 'error'
								})
							}
						})
					}
				})
			},
			modelConfirm() {
				this.show = false;
				this.exitGroup();
			},
			join() {
				const userInfo = uni.getStorageSync("userInfo");
				let groupInvitation = {
					userId: userInfo.id,
					userNickname: userInfo.nickname,
					userAvatar: userInfo.avatar,
					groupId: this.id,
					groupName: this.groupInfo.name,
					groupAvatar: this.groupInfo.avatar,
					status: 0,
					remark: this.remark
				}
				request("/group/join", "POST", groupInvitation).then((res) => {
					if (res.code == 200) {
						this.$refs.uToast.show({
							message: '申请成功，等待群主或管理员处理',
							type: 'success'
						})
					} else {
						this.$refs.uToast.show({
							message: '申请失败' + res.msg,
							type: 'error'
						})
					}
				})
			},
			addConfirm() {
				this.addShow = false;
				this.join();

			},
			copy() {
				const _this = this;
				uni.setClipboardData({
					data: this.id,
					showToast: false,
					success: function() {
						_this.$refs.uToast.show({
							message: '复制成功',
							type: 'success'
						})
					}
				});
			},
		},
		onLoad(data) {
			console.log(data.id);
			this.id = data.id;

		},
		onShow() {
			this.getGroupInfo();
			this.getGroupUser();
		},


	}
</script>

<style>

</style>