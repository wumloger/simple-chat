<template>
	<view>
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content">导航栏</block>
		</cu-custom>
		<button @click="connect">连接</button>
		<button @click="disconnect">断开</button>
		<button @click="subscribe">订阅</button>
		<button @click="unsubscribe">取消订阅</button>
		<input class="uni-input" v-model="groupMsg.msgContent" />
		<button @click="send">发送消息</button>

		<view v-for="(item, index) in dataList" :key="index">
			{{index}}:{{item}}
		</view>
		{{getMsg.msgContent}}
	</view>
</template>

<script>
	import ws from '@/websocket/ws.js';
	import {
		refreshToken
	} from '@/config/config.js'
	export default {
		data() {
			return {
				groupMsg: {
					msgContent: '测试消息',
					fromUserId: '1721067567100772354',
					groupId: '1729852243445936129',
					msgType: 1,
					fromUserNickname: '李四',
					fromUserAvatar: 'https://pic.imgdb.cn/item/64721a94f024cca1737ae3a0.png'
				},
				dataList: [],
				getMsg: ''
			}
		},
		onLoad() {
			// 模拟获取token，此步操作应在登录时去做
			refreshToken()
		},
		methods: {
			/**
			 * 创建连接
			 */
			connect() {
				ws.connect()


			},
			/**
			 * 断开连接
			 */
			disconnect(aa) {
				ws.disconnect()
			},
			/**
			 * 订阅
			 */
			subscribe() {
				ws.subscribe("/topic/groups/1729852243445936129", (res) => {
					console.log(res);
					this.getMsg = JSON.parse(res.body);
				})
			},
			/**
			 * 取消订阅
			 */
			unsubscribe() {
				ws.unsubscribe("/topic/1/queue/private")
			},
			/**
			 * 接收消息
			 * @param {Object} data
			 */
			message(data) {
				console.log(data)
				this.dataList.push(data.body)
			},
			/**
			 * 向服务端发送消息
			 */
			send() {
				ws.send('/app/groups/1729852243445936129', JSON.stringify(this.groupMsg))
				// ws.send('/app/private/1721064924857028609', JSON.stringify(this.groupMsg))
			}
		}
	}
</script>

<style>
	.uni-input {
		height: 40px;
	}
</style>