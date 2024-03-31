<template>
	<view class="container">
		<cu-custom bgColor=" bg-gradual-blue" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content" v-if="friendInfo">{{friendInfo.nickname}}</block>
			<block slot="content" v-else></block>
		</cu-custom>
		<mescroll-body class="mescroll" :safearea="true" ref="mescrollRef" :bottom="msgHeight" :top="topSize"
			@init="mescrollInit" :down="downOption" @down="downEvent" :up="upOption">
			<msg :position="item.fromUserId==userId?'right':'left'"
				:avatar="item.fromUserId==userId?userInfo.avatar:friendInfo.avatar" :content="item.msgContent"
				:id="'msg_'+item.id" :msgType="item.msgType" :time="item.time" v-for="item in msgList"
				:nickname="item.nickname" source="0" :status="item.status" @reView="reView"
				@friendInfo="tofriendInfo(item.fromUserId)" :msgId="item.id+''"
				:targetId="item.fromUserId==userId?userId+'':item.fromUserId+''" @msgHandle="msgHandle(item.id)">
			</msg>
		</mescroll-body>
		<inputBox @sendMsg="sendMsg" :bottom="inputBoxHeight"></inputBox>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	import {
		request,
		BASE_URL,
		uploadFile
	} from '@/api/request.js';
	import ws from '@/websocket/ws.js';
	import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";
	import {
		resolve
	} from 'url';
	import {
		rejects
	} from 'assert';
	// import MescrollBody from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-uni.js";
	export default {
		mixins: [MescrollMixin],
		data() {
			return {
				// mescroll对象
				mescroll: null,
				// 加载框状态
				status: 'loading ',
				// 是否最后
				downOption: {
					// 显示下拉刷新的进度条
					autoShowLoading: true,
					// 下拉刷新的文本颜色
					textColor: "#00D1FB",
					// 自动加载
					auto: false,
					// 是否滚动条必须在顶部,才可以下拉刷新
					mustToTop: true,
				},
				upOption: {
					// 禁止上拉
					use: false,
					toTop: {
						// 不显示回到顶部按钮
						src: ''
					}
				},
				userId: '',
				friendId: '',
				msgList: [],
				friendInfo: null,
				userInfo: null,
				pageNo: 1,
				baseParam: {},
				topSize: this.CustomBar + 'px',
				//监听键盘调整高度
				msgHeight: '108upx',
				inputBoxHeight: -2
			}
		},

		onLoad(data) {
			uni.showLoading({
				mask: true,
				title: '加载中...'
			});
			this.userId = uni.getStorageSync("userInfo").id;
			this.userInfo = uni.getStorageSync("userInfo");
			this.friendId = data.id;

			this.baseParam = {
				'fromUserId': this.userId,
				'toUserId': this.friendId,
			}
			this.init();
			// 初始化滚动相关信息
			this.initScroll();

			//获取好友信息
			this.getFriendInfo();
			//监听事件总线
			const _this = this
			this.$EventBus.$on('private:' + this.userId, function(data) {
				console.log("事件总线", data)
				if (data.fromUserId !== _this.userId) {
					_this.pushMsg(data)
				}
			})
			//撤销删除的监听
			this.$EventBus.$on('msgHandleBus', function(data) {
				console.log("msgHandleBus事件总线", data)
				data = data.replace(/\"id\":(\d+)/, '"id": "$1"')
				const result = JSON.parse(data)
				_this.handleData(result.id, result.type)
			})
			const listener = (res) => {
				this.onKeyboardHeightChange(res.height);
			}

			uni.onKeyboardHeightChange(listener)
			uni.hideLoading();
			// 需传入与监听时同一个的函数对象

		},
		onShow() {


		},
		onUnload() {
			// uni.offKeyboardHeightChange(this.listener())
		},

		methods: {
			async init() {
				//初始化pageNo
				this.pageNo = 1;
				const res = await request("/message/getFriendMsg/" + this.userId + "/" + this.friendId + "/" + 1,
					"GET");
				console.log(res);
				this.msgList = res.data.records;
				console.log(this.msgList);
			},
			// 初始化滚动条件
			initScroll() {
				const {
					platform
				} = uni.$u
				if (platform == 'plus') {
					this.topSize = '140upx'
				} else if (platform == 'mp') {
					this.topSize = '0px'
				}
			},
			// 滚动初始化
			mescrollInit(mescroll) {
				this.mescroll = mescroll;
				this.$nextTick(() => {
					this.mescroll.scrollTo(9999, 0);
				})
			},

			async sendMsg(msg) {
				console.log("msg", JSON.stringify(msg))
				uni.showLoading({
					mask: true,
					title: '发送中...'
				});
				// 初始化最终返回值
				let endMsg = {}
				// 获取发送类型-消息类型(0-系统消息;1-文字;2-图片;3-语音;4-视频)
				const {
					msgType
				} = msg
				// 各种类型处理
				switch (msgType) {
					case 1:
						endMsg = this.covertText(msg)
						break
					case 2:
						endMsg = await this.covertImage(msg)
						break
					case 3:
						endMsg = await this.covertVoice(msg)
						break
					case 4:
						endMsg = await this.covertVideo(msg)
						break
				}

				// 消息发送
				// 检测与服务器的连接情况
				// ws.connect();
				ws.send('/app/private/' + this.friendId, JSON.stringify(endMsg));
				this.pushMsg(endMsg);
				uni.hideLoading();
				// endMsg.id = result.data.id

			},
			// 转化文字
			covertText(msg) {
				const baseParam = uni.$u.deepClone(this.baseParam)
				let endMsg = {
					...baseParam,
					...msg
				}
				return endMsg
			},
			// 转化图片
			async covertImage(msg) {
				const baseParam = uni.$u.deepClone(this.baseParam)
				let endMsg = {
					...baseParam,
					...msg
				}
				const {
					url
				} = msg
				// 上传图片
				const res = await uploadFile('/user/oss/upload', url);
				const data = JSON.parse(res);
				console.log(res);
				if (data.code == 200) {
					endMsg['msgContent'] = data.data
					console.log(endMsg);
					return endMsg;
				}


			},
			// 转化音频
			async covertVoice(msg) {
				const baseParam = uni.$u.deepClone(this.baseParam)
				let endMsg = {
					...baseParam,
					...msg
				}
				const {
					url
				} = msg
				// 上传语音
				const res = await uploadFile('/user/oss/upload', url);
				const data = JSON.parse(res);
				if (data.code == 200) {
					const fileUrl = data.data
					endMsg['msgContent'] = fileUrl
				}
				return endMsg
			},
			// 转化视频
			async covertVideo(msg) {
				const baseParam = uni.$u.deepClone(this.baseParam)
				let endMsg = {
					...baseParam,
					...msg
				}
				const {
					url
				} = msg
				// 上传视频
				const res = await uploadFile('/user/oss/upload', url);
				const data = JSON.parse(res);
				if (data.code == 200) {
					const fileUrl = data.data
					endMsg['msgContent'] = fileUrl
				}
				return endMsg
			},
			pushMsg(msg) {
				this.msgList.push(msg)
				console.log(this.msgList);
				this.$nextTick(function() {
					this.mescroll.scrollTo(99999, 0)
				})
			},
			// 下拉回调
			downEvent() {
				this.getMoreMsg();
				//结束加载
				this.mescroll.endSuccess()
			},
			//下拉加载更多
			async getMoreMsg() {
				const no = ++this.pageNo;
				const res = await request("/message/getFriendMsg/" + this.userId + "/" + no, "GET");
				console.log(res);
				const msgs = res.data.records;
				if (msgs.length <= 0) {
					this.pageNo = 1;
				}
				this.msgList.unshift(...msgs);
			},
			//获取好友信息
			async getFriendInfo() {
				const userId = uni.getStorageSync("userInfo").id;
				const res = await request("/friend/get/" + this.friendId + "/" + userId).catch((err) => {
					uni.hideLoading();
				});
				this.friendInfo = res;
				console.log(res);
			},
			// 好友信息
			tofriendInfo(id) {
				if (id == this.userId) {
					uni.switchTab({
						url: '/pages/home/home'
					})
				} else {
					uni.navigateTo({
						url: '/pages/friend/friendInfo?id=' + id
					})
				}

			},
			// 撤销/删除
			async msgHandle(id) {
				request("/message/back/0/" + id, "POST").then((res) => {
					console.log(res);
					if (res.code == 200) {
						this.$refs.uToast.show({
							message: '撤回成功',
							type: 'success',
							duration: '500'
						})
					} else {
						this.$refs.uToast.show({
							message: '撤回失败' + res.msg,
							type: 'error',
							duration: '1000'
						})
					}
					this.init();
				})
			},
			//键盘下拉事件
			onKeyboardHeightChange(height) {
				let _sysInfo = uni.getSystemInfoSync()
				const _statusBarHeight = _sysInfo.statusBarHeight;
				console.log(_sysInfo);
				if (height > 0) {
					let val = 108 + (height * 2 - _statusBarHeight * 2);
					console.log(val);
					this.msgHeight = val + 'upx';
					this.inputBoxHeight = -2 + (height - _statusBarHeight) * 2;
					this.$nextTick(function() {
						this.mescroll.scrollTo(99999, 0)
					})
				} else {
					this.msgHeight = '108upx';
					this.inputBoxHeight = -2;
				}
				console.log(height);
			},
			reView() {
				console.log(review);
			}


		},
		// components: {
		// 	msg,
		// 	inputBox,
		// 	MescrollBody
		// }
	}
</script>

<style>
	.mescroll {
		background-color: #F5F5F5;
	}
</style>