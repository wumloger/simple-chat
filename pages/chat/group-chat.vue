<template>
	<view class="container">
		<cu-custom bgColor=" bg-gradual-blue" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content" v-if="groupInfo">{{groupInfo.name}}</block>
			<block slot="content" v-else></block>
			<block slot="right">
				<view @click="toGroupInfo(id)" class="cuIcon-more"></view>
			</block>
		</cu-custom>
		<mescroll-body class="mescroll" :safearea="true" ref="mescrollRef" :bottom="msgHeight" :top="topSize"
			@init="mescrollInit" :down="downOption" @down="downEvent" :up="upOption">
			<msg :position="item.fromUserId==userId?'right':'left'" :avatar="item.fromUserAvatar"
				:content="item.msgContent" :id="'msg_'+item.id" :msgType="item.msgType" v-for="item in msgList"
				:nickname="item.fromUserNickname" source="1" :status="item.status"
				@friendInfo="friendInfo(item.fromUserId)" :msgId="item.id+''"
				:targetId="item.fromUserId==userId?userId+'':item.fromUserId+''" @msgHandle="msgHandle(item.id)"
				:time="item.time"></msg>
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
				msgList: [],
				groupInfo: null,
				userInfo: null,
				pageNo: 1,
				topSize: '',
				//监听键盘调整高度
				msgHeight: '108upx',
				inputBoxHeight: -2,
				id: '',
				topSize: this.CustomBar + 'px'
			}
		},

		onLoad(data) {
			const id = data.id;
			this.id = id;
			console.log(id);
			this.init(id);
			// 初始化滚动相关信息
			this.initScroll();
			this.userInfo = uni.getStorageSync("userInfo");
			this.userId = uni.getStorageSync("userInfo").id;
			//消息头部距离

			//获取群组信息
			this.getGroupInfo(id);

			//监听事件总线
			const _this = this
			this.$EventBus.$on('group:' + id, function(data) {
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
			// 需传入与监听时同一个的函数对象

		},
		onShow() {


		},
		onUnload() {
			// uni.offKeyboardHeightChange(this.listener(res))
		},
		methods: {
			// listener(res) {
			// 	this.onKeyboardHeightChange(res.height);
			// },
			async init(id) {
				//初始化pageNo
				this.pageNo = 1;
				const res = await request("/message/getGroupMsg/" + id + "/" + 1, "GET");
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
				setTimeout(() => {
					mescroll.scrollTo(99999, 0);
				}, 1000)
			},
			async getGroupInfo(id) {
				const res = await request("/group/get/" + id);
				console.log(res);
				this.groupInfo = res.data;
			},
			async sendMsg(msg) {
				const {
					id,
					nickname,
					avatar
				} = this.userInfo
				// 初始化最终返回值
				const baseParam = {
					// 群组Id
					groupId: this.groupInfo.id,
					// 消息发送方
					fromUserId: id,
					// 消息发送方昵称
					fromUserNickname: nickname,
					// 消息发送方头像
					fromUserAvatar: avatar,
				}
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
				endMsg = uni.$u.deepMerge(endMsg, baseParam)
				console.log(endMsg);
				// 消息发送
				ws.send('/app/groups/' + this.groupInfo.id, JSON.stringify(endMsg));
				this.pushMsg(endMsg);
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
				const res = await request("/message/getGroupMsg/" + this.id + "/" + no, "GET");
				console.log(res);
				const msgs = res.data.records;
				if (msgs.length <= 0) {
					this.pageNo = 1;
				}
				this.msgList.unshift(...msgs);
			},
			//获取群组信息
			toGroupInfo(id) {
				uni.navigateTo({
					url: '/pages/group/groupInfo?id=' + id
				})
			},
			// 好友信息
			friendInfo(id) {
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
				request("/message/back/1/" + id, "POST").then((res) => {
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
					this.init(this.id);
				})
			},
			//键盘下拉事件
			onKeyboardHeightChange(height) {
				let _sysInfo = uni.getSystemInfoSync()
				let _heightDiff = _sysInfo.screenHeight - _sysInfo.windowHeight
				let _diff = height - _heightDiff
				const _statusBarHeight = _sysInfo.statusBarHeight;
				let keyHeight = _diff > 0 ? _diff : 0
				console.log(keyHeight);
				if (height > 0) {
					let val = 108 + (keyHeight - _statusBarHeight) * 2;
					this.msgHeight = val + 'upx';
					this.inputBoxHeight = -2 + (keyHeight - _statusBarHeight) * 2;
					this.$nextTick(function() {
						this.mescroll.scrollTo(99999, 0)
					})
				} else {
					this.msgHeight = '108upx';
					this.inputBoxHeight = -2;
				}
				console.log(height);
			},


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