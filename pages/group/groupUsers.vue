<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="content">成员列表</block>
			<block slot="backText">返回</block>
		</cu-custom>
		<template v-if="list.length > 0">
			<view class=" cu-list menu-avatar" style="border-top: none;" v-if="auth.isAdmin">
				<view class=" cu-item" v-for="(cell, index) in list"
					:class="modalName=='move-box-'+ index?'move-cur':''" @touchstart="ListTouchStart"
					@touchmove="ListTouchMove" @touchend="ListTouchEnd" :data-target="'move-box-' + index">
					<view class="cu-avatar round lg" :style="[{backgroundImage:'url('+cell.userAvatar+')'}]">
					</view>
					<view class="content">
						<view class="text-grey">{{cell.userNickname}}</view>
						<view class="text-gray text-sm flex">
							<view class="text-cut">
								<text>身份:{{cell.userId === masterId ? '群主' : cell.adminable === 0 ? '普通群员':'管理员'}}</text>
							</view>
						</view>
					</view>
					<view class="move" v-if="cell.userId !== masterId && cell.userId !== userId">
						<view style="background-color:#f56767; color: white;" @tap="removeUser(cell)">
							踢出
						</view>
						<template v-if="auth.isMaster">
							<view style="background-color: #5ac725; color: white;" v-if="cell.adminable === 0"
								@tap="authFor(cell)">授权</view>
							<view style="background-color: #f9ae3d; color: white;" v-else @tap="cancelAuth(cell)">取消授权
							</view>
						</template>

					</view>
					<view class="move" v-else>
						<view style="background-color:#f56767; color: white;">
							无法操作
						</view>
					</view>
				</view>
			</view>
			<view class=" cu-list menu-avatar" style="border-top: none;" v-else>
				<view class=" cu-item" v-for="(cell, index) in list">
					<view class="cu-avatar round lg" :style="[{backgroundImage:'url('+cell.userAvatar+')'}]"></view>
					<view class="content">
						<view class="text-grey">{{cell.userNickname}}</view>
						<view class="text-gray text-sm flex">
							<view class="text-cut">
								<text>身份:{{cell.userId === masterId ? '群主' : cell.adminable === 0 ? '普通群员':'管理员'}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</template>
		<u-modal :show="show" :title="title" content='注意!该操作一经确认无法撤回!请谨慎选择!' :showCancelButton="true"
			:buttonReverse="true" :closeOnClickOverlay="true" @close="show=false" @cancel="show=false"
			@confirm="modelConfirm"></u-modal>
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
				userId: '',
				id: '',
				masterId: '',
				list: [],
				modalName: null,
				listTouchStart: 0,
				listTouchDirection: null,
				auth: {
					isAdmin: false,
					isMaster: false

				},
				show: false,
				user: null,
				title: ''
			}
		},
		methods: {

			async getGroupUser() {
				const res = await request("/group/list/" + this.id, "GET");
				console.log(res);
				this.list = res;
				this.list.forEach((user) => {
					if (user.userId === this.userId) {
						if (user.adminable === 1) {
							this.auth.isAdmin = true;
						}

					}
				})
				if (this.masterId === this.userId) {
					this.auth.isMaster = true;
					this.auth.isAdmin = true
				}
			},
			// ListTouch触摸开始，获取触摸点距盒子左侧的距离
			ListTouchStart(e) {
				this.listTouchStart = e.touches[0].pageX
			},
			// ListTouch计算方向，
			ListTouchMove(e) {
				this.listTouchDirection = e.touches[0].pageX - this.listTouchStart > 0 ? 'right' : 'left'
			},
			// ListTouch计算滚动
			ListTouchEnd(e) {
				if (this.listTouchDirection == 'left') {
					this.modalName = e.currentTarget.dataset.target
				} else {
					this.modalName = null
				}
				this.listTouchDirection = null
			},
			removeUser(user) {
				this.user = uni.$u.deepClone(user);
				this.user.status = 0;
				this.title = "是否确定踢出该成员？";

				this.show = true
			},
			modelConfirm() {
				const _this = this;
				request("/group/updateUser", "POST", this.user).then((res) => {
					if (res.code == 200) {
						this.$refs.uToast.show({
							message: '操作成功',
							type: 'success'
						})
					} else {
						this.$refs.uToast.show({
							message: '操作失败' + res.msg,
							type: 'error'
						})
					}
					_this.getGroupUser();
				})
				this.show = false;

			},
			authFor(user) {
				this.user = uni.$u.deepClone(user);
				this.user.adminable = 1;
				this.title = "是否给该成员管理员权限？";

				this.show = true
			},
			cancelAuth(user) {
				this.user = uni.$u.deepClone(user);
				this.user.adminable = 0;
				this.title = "是否解除该成员的管理员权限？";

				this.show = true
			}

		},
		onLoad(data) {
			this.id = data.id;
			this.masterId = data.master;
			this.userId = uni.getStorageSync("userInfo").id;
		},
		onShow() {
			this.getGroupUser();
		}

	}
</script>

<style>
	.move-cur0 {
		transform: translateX(-130upx)
	}
</style>