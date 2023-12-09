<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue">
			<block slot="content">消息</block>
			<block slot="right">
				<view>image</view>
			</block>
		</cu-custom>
		<view class="msg_list">
			<view class="cu-list menu-avatar margin-top-xs margin-bottom-xs" v-if="messageList">
				<view @tap="toChat(item.targetId)" class="cu-item" :class="modalName=='move-box-'+ index?'move-cur':''"
					v-for="(item,index) in messageList" :key="index" @touchstart="ListTouchStart"
					@touchmove="ListTouchMove" @touchend="ListTouchEnd" :data-target="'move-box-' + index">
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
						<view class="cu-tag round bg-red sm">{{item.unreadNum}}</view>
					</view>
					<view class="move">
						<view class="bg-grey">置顶</view>
						<view class="bg-red">删除</view>
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
				this.$EventBus.$emit("private:" + message.fromUserId, message);

			});
			//订阅群组
			this.getGroupsAndSubscribe();
			//获取消息列表
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

			toChat(id) {
				uni.navigateTo({
					url: '/pages/chat/group-chat?id=' + id
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
			}
		}
	}
</script>

<style>
	.uni-input {
		height: 40px;
	}
</style>