<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="content">找群</block>
			<block slot="backText">返回</block>
		</cu-custom>
		<view class="cu-bar search bg-white">
			<view class="search-form round">
				<text class="cuIcon-search"></text>
				<input @input="$u.debounce(searchGroup, 500)" v-model.trim="searchValue" :adjust-position="false"
					type="text" placeholder="搜索群聊" confirm-type="search"></input>
			</view>
			<view class="action" @click="show = true">
				<text>{{selectedValue.name}}</text>
				<text class="cuIcon-triangledownfill"></text>
			</view>

		</view>
		<view class="searchList" v-if="this.searchValue != ''">
			<u--text type="info" :block="true" style="padding: 10upx;" text="搜索结果"></u--text>
			<u-line></u-line>
			<u-loadmore :status="status" nomoreText="没用找到群组" v-show="this.status != ''" />
			<view class=" cu-list menu-avatar" style="border-top: none;">
				<view class=" cu-item" v-for="(cell, index) in groupList" @tap="toGroupInfo(cell.id)">
					<view class="cu-avatar round lg" :style="[{backgroundImage:'url('+cell.avatar+')'}]">
					</view>
					<view class="content">
						<view class="text-grey">{{cell.name}}({{cell.id}})</view>
						<view class="text-gray text-sm flex">
							<view class="text-cut">
								<text>介绍:{{cell.intro}}</text>
							</view>
						</view>
					</view>
				</view>

			</view>
		</view>
		<!-- <view class="recommedList" v-else>
			<u--text type="info" :block="true" style="padding: 10upx;" text="你可能想加入"></u--text>
			<u-line></u-line>
			<view class=" cu-list menu-avatar" style="border-top: none;">
				<view class=" cu-item" v-for="(cell, index) in recommendList" @tap="toGroupInfo(cell.id)">
					<view class="cu-avatar round lg" :style="[{backgroundImage:'url('+cell.avatar+')'}]">
					</view>
					<view class="content">
						<view class="text-grey">{{cell.name}}({{cell.id}})</view>
						<view class="text-gray text-sm flex">
							<view class="text-cut">
								<text>介绍:{{cell.intro}}</text>
							</view>
						</view>
					</view>
				</view>

			</view>
		</view> -->

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
							label: '按群名查找',
							name: '群名',
							id: 1
						},

						{
							label: '按群id精确查找',
							name: 'id',
							id: 2
						}
					]
				],
				selectedValue: {
					label: '按群名查找',
					name: '群名',
					id: 1
				},
				searchValue: '',
				groupList: [],
				recommendList: [],
				userId: ''
			}
		},
		methods: {
			selected(data) {
				this.selectedValue = data.value[0];
				if (this.searchValue != '') {
					this.searchGroup();
				}
				this.show = false
			},
			async searchGroup() {
				this.status = 'loading';
				try {
					let res;
					if (this.selectedValue.id == 1) {
						console.log("按群名查找");
						res = await request("/group/getByName", "GET", {
							name: this.searchValue
						});
					} else {
						console.log("按群id精确查找");
						res = await request("/group/getById", "GET", {
							id: this.searchValue
						});
					}

					if (res.data.length <= 0) {
						this.status = 'nomore';
					} else {
						this.status = '';
					}

					// Move the handleUser logic outside of the loop
					this.groupList = res.data
					console.log(this.groupList);
				} catch (error) {
					console.error("Error fetching user data:", error);
					// Handle the error appropriately
				}
			},

			toGroupInfo(id) {
				uni.navigateTo({
					url: '/pages/group/groupInfo?id=' + id
				})
			},

		},
		async onShow() {},
		onLoad() {
			this.userId = uni.getStorageSync("userInfo").id;
		}
	}
</script>

<style lang="scss">
	.searchList {
		background-color: white;
		margin: 10upx;

	}
</style>