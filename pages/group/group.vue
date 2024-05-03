<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue">
			<block slot="content">群组</block>
		</cu-custom>
		<u-cell-group :customStyle="{backgroundColor:'#FFFFFF',margin:'10upx'}">
			<u-cell title="我收到的申请" isLink url="/pages/group/invitation/tome">
				<u-badge slot="value" max="99" :value="count" v-show="count > 0"></u-badge>
			</u-cell>
			<u-cell title="我发出的申请" isLink url="/pages/group/invitation/toothers"></u-cell>
		</u-cell-group>
		<u-cell-group :customStyle="{backgroundColor:'#FFFFFF',margin:'10upx'}">
			<template v-for="(item, index) in itemArr">
				<!-- #ifdef APP-NVUE -->
				<u-index-anchor :text="indexList[index]" bgColor="#f5f5f5"></u-index-anchor>
				<!-- #endif -->
				<u-index-item>
					<!-- #ifndef APP-NVUE -->
					<u-index-anchor :text="indexList[index]" bgColor="#f5f5f5"></u-index-anchor>
					<!-- #endif -->
					<view class="cu-list menu-avatar" style="border-top: none;">
						<view class="cu-item" v-for="(cell, index) in item" @tap="toGroup(cell.id)">
							<view class="cu-avatar round lg" :style="[{backgroundImage:'url('+cell.avatar+')'}]">
							</view>
							<view class="content">
								<view class="text-grey">{{cell.name}}</view>
								<view class="text-gray text-sm flex">
									<view class="text-cut">
										<text v-if="cell.intro != null && cell.intro != ''">{{cell.intro}}</text>
										<text v-else>群主很懒，还没有写介绍</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</u-index-item>
			</template>
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
				indexList: ["我创建的", "我加入的"],
				itemArr: [
					[],
					[]
				],
				count: 0
			}
		},
		methods: {
			async getGroupList() {

				const res = await request("/group/list", "GET").catch((err) => {
					console.log(err);
				})
				console.log(res);
				const groups = res.data;
				const userId = uni.getStorageSync("userInfo").id;
				this.itemArr = [
					[],
					[]
				];
				groups.forEach((group) => {
					if (group.createBy == userId) {
						this.itemArr[0].push(group);
					} else {
						this.itemArr[1].push(group);
					}
				})

			},
			toGroup(id) {
				uni.navigateTo({
					url: '/pages/chat/group-chat?id=' + id
				})
			},
			async getCount() {
				const res = await request("/group/count", "GET");
				this.count = res.data
			}
		},
		onShow() {
			this.getGroupList();
			this.getCount();
		},

	}
</script>

<style>

</style>