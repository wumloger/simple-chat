<template>
	<view>
		<button @click="connect">连接</button>
		<button @click="disconnect">断开</button>
		<button @click="subscribe">订阅</button>
		<button @click="unsubscribe">取消订阅</button>
		<input class="uni-input" v-model="friendMsg.msgContent" />
		<button @click="send">发送消息</button>
		
		<view v-for="(item, index) in dataList" :key="index">
			{{index}}:{{item}}
		</view>
		{{getMsg}}
	</view>
</template>

<script>
	import ws from '@/websocket/ws.js';
	import { refreshToken } from '@/config/config.js'
	export default {
		data() {
			return {
				friendMsg:{
					msgContent:'测试消息',
					fromUserId:1,
					toUserId:2,
					msgType:'1'
				},
				dataList: [],
				getMsg:''
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
				ws.subscribe("/user/1/queue/private", (res)=>{
					console.log(res);
					this.getMsg = JSON.parse(res.body).msgContent;
				})
			},
			/**
			 * 取消订阅
			 */
			unsubscribe() {
				ws.unsubscribe("/user/1/queue/private")
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
				ws.send('/app/private/1', JSON.stringify(this.friendMsg))
			}
		}
	}
</script>

<style>
	.uni-input {
		height: 40px;
	}
</style>
