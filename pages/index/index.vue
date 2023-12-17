<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue">
			<block slot="content">消息</block>
			<block slot="right" style="position: relative;">
				<u-icon color="#000000" name="plus-circle" @tap="checkout()"></u-icon>
				<view class="modal animation-fade " v-if="show">
					<div @click="toFriendSearch">
						<text style="margin-right: 5upx;" class="cuIcon-friendadd"></text>
						加好友
					</div>
					<u-line></u-line>
					<div @click="toGroupSearch">
						<text style="margin-right: 5upx;" class="cuIcon-group"></text>
						加群
					</div>
					<u-line></u-line>
					<div @click="toCreatGroup">
						<text style="margin-right: 5upx;" class="cuIcon-message"></text>
						创建群聊
					</div>
					<u-line></u-line>
				</view>
			</block>
		</cu-custom>

		<view class="msg_list">
			<view class="cu-list menu-avatar margin-top-xs margin-bottom-xs" v-if="messageList">
				<view @tap="toChat(item.targetId,item.id,item.source)" class="cu-item"
					:class="modalName=='move-box-'+ index?'move-cur130':''" v-for="(item,index) in messageList"
					:key="index" @touchstart="ListTouchStart" @touchmove="ListTouchMove" @touchend="ListTouchEnd"
					:data-target="'move-box-' + index">
					<view class="cu-avatar round lg" :style="[{backgroundImage:'url('+item.targetAvatar+')'}]">
					</view>
					<view class="content">
						<view class="text-grey">{{item.targetName}}</view>
						<view class="text-gray text-sm">
							{{item.newMsg}}
						</view>
					</view>
					<view class="action">
						<view class="text-grey text-xs">{{item.msgTime}}</view>
						<view class="cu-tag round bg-red sm" v-if="item.unreadNum > 0">{{item.unreadNum}}</view>
					</view>
					<view class="move">
						<view class="bg-red" @tap.stop="remove(item.id)">删除</view>
						<view class="bg-grey">空白</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import ws from '@/websocket/ws.js';
	import {
		request
	} from '@/api/request.js';
	export default {
		data() {
			return {
				messageList: [],
				modalName: null,
				listTouchStart: 0,
				listTouchDirection: null,
				show: false
			}
		},
		onLoad() {
			// 模拟获取token，此步操作应在登录时去做
			ws.connect();
			const userId = uni.getStorageSync("userInfo").id;
			//订阅私人队列
			ws.subscribe("/user/" + userId + "/queue/private", (res) => {
				console.log(res.body);
				const message = JSON.parse(res.body);
				this.$EventBus.$emit("private:" + userId, message);

			});
			//订阅群组
			this.getGroupsAndSubscribe();


		},
		onShow() {
			//获取消息列表
			const userId = uni.getStorageSync("userInfo").id;
			this.getMessageList(userId);
		},
		methods: {
			async getGroupsAndSubscribe() {
				const res = await request("/group/list", "GET");
				const groupList = res.data;
				for (let i = 0; i < groupList.length; i++) {
					ws.subscribe("/topic/groups/" + groupList[i].id, (res) => {
						console.log(res.body);
						const message = JSON.parse(res.body);
						this.$EventBus.$emit("group:" + groupList[i].id, message);
					})
				}
				uni.setStorageSync("groupList", groupList)
			},
			async getMessageList(userId) {
				const res = await request("/message/getUnread/" + userId);
				this.messageList = res.data;
				console.log(res);
			},

			toChat(targetId, id, source) {
				const userId = uni.getStorageSync("userInfo").id;
				const _this = this;
				request("/message/clearUnread/" + id, "PUT").then(() => {
					_this.getMessageList(userId);
				})
				if (source == 1) {
					uni.navigateTo({
						url: '/pages/chat/group-chat?id=' + targetId
					})
				} else {
					uni.navigateTo({
						url: '/pages/chat/friend-chat?id=' + targetId
					})
				}

			},
			toFriendSearch() {
				this.show = false;
				uni.navigateTo({
					url: '/pages/friend/friendSearch'
				})
			},
			toGroupSearch() {
				this.show = false;
				uni.navigateTo({
					url: '/pages/group/groupSearch'
				})
			},
			toCreatGroup() {
				this.show = false;
				uni.navigateTo({
					url: '/pages/group/createGroup'
				})
			},
			remove(id) {
				const _this = this;
				const userId = uni.getStorageSync("userInfo").id;
				request("/message/deleteUnread/" + id, "DELETE").then((res) => {

					_this.getMessageList(userId);
				})
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
			checkout() {
				this.show = !this.show
			}
		}
	}
</script>

<style lang="scss">
	.uni-input {
		height: 40px;
	}

	.modal {
		z-index: 999;
		height: fit-content;
		width: 280upx;
		position: absolute;
		top: 60upx;
		left: -232upx;
		border-radius: 5%;

		div {
			width: 100%;
			background-color: white;
			height: 100upx;
			color: black;
			text-align: center;
			line-height: 100upx;
			border-radius: 5%;
		}

		div:active {
			background-color: #f5f5f5;
		}
	}

	.modal::before {
		content: '';
		height: 10%;
		width: 10%;
		background-color: white;
		position: absolute;
		top: -4%;
		left: 82%;
		transform: rotate(-45deg);
	}

	.move-cur130 {
		transform: translateX(-130upx)
	}
</style>