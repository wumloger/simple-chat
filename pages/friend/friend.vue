<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue">
			<block slot="content">好友</block>
		</cu-custom>
		<u-cell-group :customStyle="{backgroundColor:'#FFFFFF',margin:'10upx'}">
			<u-cell title="我收到的申请" isLink url="/pages/friend/invitation/tome"></u-cell>
			<u-cell title="我发出的申请" isLink url="/pages/friend/invitation/toothers"></u-cell>
		</u-cell-group>
		<u-cell-group :customStyle="{backgroundColor:'#FFFFFF',margin:'10upx'}">
			<u-index-list :index-list="indexs">
				<template v-for="(item, index) in itemArr">
					<!-- #ifdef APP-NVUE -->
					<u-index-anchor :text="indexList[index]" bgColor="#f5f5f5"></u-index-anchor>
					<!-- #endif -->
					<u-index-item>
						<!-- #ifndef APP-NVUE -->
						<u-index-anchor :text="indexList[index]" bgColor="#f5f5f5"></u-index-anchor>
						<!-- #endif -->
						<view class="cu-list menu-avatar" style="border-top: none;">
							<view class="cu-item" v-for="(cell, index) in item" @tap="toFriendInfo(cell.friendId)">
								<view class="cu-avatar round lg" :style="[{backgroundImage:'url('+cell.avatar+')'}]">
								</view>
								<view class="content">
									<view class="text-grey">{{cell.nickname}}</view>
									<view class="text-gray text-sm flex">
										<view class="text-cut">
											<text v-if="cell.remark != ''">{{cell.remark}}</text>
											<text v-else>未给该好友备注</text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</u-index-item>
				</template>
			</u-index-list>
		</u-cell-group>
	</view>
</template>

<script>
	import {
		request
	} from '@/api/request.js';
	export default {
		data() {
			return {
				indexs: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S",
					"T", "U", "V", "W", "X", "Y", "Z"
				],
				indexList: [],
				itemArr: [],
			}
		},
		methods: {
			async getFriends() {
				const res = await request("/friend/list");
				let list = res.data;
				// 获取所有不重复的字母
				let alphabeticArr = list.map(friend => friend.alphabetic);
				let uniqueArr = [...new Set(alphabeticArr)];

				// 清空之前的数据
				this.indexList = [];
				this.itemArr = [];

				// 根据字母分组好友列表
				uniqueArr.forEach(letter => {
					let friendsByLetter = list.filter(friend => friend.alphabetic === letter);
					this.indexList.push(letter);
					this.itemArr.push(friendsByLetter);
				});
			},
			toFriendInfo(id) {
				uni.navigateTo({
					url: '/pages/friend/friendInfo?id=' + id
				})
			}
		},
		onShow() {
			this.getFriends();
		}
	}
</script>

<style>
	.list-cell {
		display: flex;
		box-sizing: border-box;
		width: 100%;
		padding: 10px 24rpx;
		overflow: hidden;
		color: #323233;
		font-size: 14px;
		line-height: 24px;
		background-color: #fff;
	}
</style>