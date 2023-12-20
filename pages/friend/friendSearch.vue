<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="content">找人</block>
			<block slot="backText">返回</block>
		</cu-custom>
		<view class="cu-bar search bg-white">
			<view class="search-form round">
				<text class="cuIcon-search"></text>
				<input @input="$u.debounce(searchUser, 500)" v-model.trim="searchValue" :adjust-position="false"
					type="text" placeholder="搜索好友" confirm-type="search"></input>
			</view>
			<view class="action" @click="show = true">
				<text>{{selectedValue.name}}</text>
				<text class="cuIcon-triangledownfill"></text>
			</view>

		</view>
		<view class="searchList" v-if="this.searchValue != ''">
			<u--text type="info" :block="true" style="padding: 10upx;" text="搜索结果"></u--text>
			<u-line></u-line>
			<u-loadmore :status="status" nomoreText="没用找到用户" v-show="this.status != ''" />
			<view class=" cu-list menu-avatar" style="border-top: none;">
				<view class=" cu-item" v-for="(cell, index) in userList" @tap="toFriendInfo(cell.id)">
					<view class="cu-avatar round lg" :style="[{backgroundImage:'url('+cell.avatar+')'}]">
					</view>
					<view class="content">
						<view class="text-grey">{{cell.username}}({{cell.id}})</view>
						<view class="text-gray text-sm flex">
							<view class="text-cut">
								<text>昵称:{{cell.nickname}}</text>
							</view>
						</view>
					</view>
					<view v-if="!cell.isFriend" class="action" @tap.stop="addFriend(cell.id,cell.nickname,cell.avatar)">
						<u-button type="info" shape="circle" text="加好友" size="mini"></u-button>
					</view>
				</view>

			</view>
		</view>
		<view class="recommedList" v-else>
			<u--text type="info" :block="true" style="padding: 10upx;" text="你可能认识"></u--text>
			<u-line></u-line>
			<view class=" cu-list menu-avatar" style="border-top: none;">
				<view class=" cu-item" v-for="(cell, index) in recommendList" @tap="toFriendInfo(cell.friendId)">
					<view class="cu-avatar round lg" :style="[{backgroundImage:'url('+cell.avatar+')'}]">
					</view>
					<view class="content">
						<view class="text-grey">{{cell.nickname}}({{cell.friendId}})</view>
						<view class="text-gray text-sm flex">
							<view class="text-cut">
								<text>拥有共同好友{{cell.num}}人</text>
							</view>
						</view>
					</view>
					<view v-if="!cell.isFriend" class="action"
						@tap.stop="addFriend(cell.friendId,cell.nickname,cell.avatar)">

						<u-button type="info" shape="circle" text="加好友" size="mini"></u-button>
					</view>
				</view>

			</view>
		</view>

		<u-picker :show="show" :columns="columns" @cancel="show = false" @confirm="selected" keyName="label"
			:defaultIndex="[0]"></u-picker>
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
				show: false,
				status: '',
				columns: [
					[{
							label: '按用户名查找',
							name: '用户名',
							id: 1
						},

						{
							label: '按呢称查找',
							name: '昵称',
							id: 2
						},
						{
							label: '按id精确查找',
							name: 'id',
							id: 3
						}
					]
				],
				selectedValue: {
					label: '按用户名查找',
					name: '用户名',
					id: 1
				},
				searchValue: '',
				userList: [],
				recommendList: [],
				friends: [],
				userId: ''
			}
		},
		methods: {
			selected(data) {
				this.selectedValue = data.value[0];
				if (this.searchValue != '') {
					this.searchUser();
				}
				this.show = false
			},
			async searchUser() {
				this.status = 'loading';
				try {
					let res;
					if (this.selectedValue.id == 1) {
						console.log("按用户名查找");
						res = await request("/user/getUserByUsername", "GET", {
							username: this.searchValue
						});
					} else if (this.selectedValue.id == 2) {
						console.log("按昵称查找");
						res = await request("/user/getUserByNickname", "GET", {
							nickname: this.searchValue
						});
					} else {
						console.log("按id精确查找");
						res = await request("/user/getUser", "GET", {
							id: this.searchValue
						});
					}

					if (res.data.length <= 0) {
						this.status = 'nomore';
					} else {
						this.status = '';
					}

					// Move the handleUser logic outside of the loop
					this.userList = await this.handleUser(res.data);
					console.log(this.userList);
				} catch (error) {
					console.error("Error fetching user data:", error);
					// Handle the error appropriately
				}
			},

			async handleUser(list) {
				try {

					for (let i = 0; i < list.length; i++) {
						for (let j = 0; j < this.friends.length; j++) {
							if (list[i].id === this.friends[j].friendId) {
								list[i].isFriend = true;
							}
						}
						if (this.userId === list[i].id) {
							list[i].isFriend = true;
						}
					}

					return list;
				} catch (error) {
					console.error("Error fetching friend list:", error);
					// Handle the error appropriately
				}
			},

			toFriendInfo(id) {
				uni.navigateTo({
					url: '/pages/friend/friendInfo?id=' + id
				})
			},
			addFriend(friendId, nickname, avatar) {
				console.log("加好友");
				const userInfo = uni.getStorageSync("userInfo")
				let invitation = {
					userId: userInfo.id,
					userNickname: userInfo.nickname,
					userAvatar: userInfo.avatar,
					friendId: friendId,
					friendNickname: nickname,
					friendAvatar: avatar,
				}
				console.log(invitation);
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
			},
			getRecommend() {
				request("/friend/recommend", "GET").then((res) => {
					this.recommendList = res.data;
				})
			},

		},
		async onShow() {
			const res = await request("/friend/list");
			this.friends = res.data;
			this.getRecommend();
		},
		onLoad() {
			this.userId = uni.getStorageSync("userInfo").id;
		}
	}
</script>

<style lang="scss">
	.searchList,
	.recommedList {
		background-color: white;
		margin: 10upx;

	}
</style>