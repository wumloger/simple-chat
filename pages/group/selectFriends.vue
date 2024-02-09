<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="content">好友</block>
			<block slot="backText">返回</block>
			<block slot="right"><text @tap="create">创建</text></block>
		</cu-custom>
		<u-cell-group :customStyle="{backgroundColor:'#FFFFFF',margin:'10upx'}">
			<view class="cu-list menu-avatar" style="border-top: none;">
				<view class="cu-item" v-for="(cell, index) in list">
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
					<view class="action">
						<u-switch v-model="cell.selected" :activeValue="true" :inactiveValue="false"
							@change="change"></u-switch>
					</view>
				</view>
			</view>
		</u-cell-group>
		<u-modal :show="show" title="请确认创建信息" :showCancelButton="true" :closeOnClickOverlay="true" @close="show=false"
			@cancel="show=false" @confirm="confirm">
			<view class="slot-content" style="width: 100%;">
				<u-text text="头像:" type="tips"></u-text>
				<u-avatar :src="groupInfo.avatar" style="margin: 0 auto;"></u-avatar>
				<u-text text="群名" type="tips"></u-text>
				<u-text :text="groupInfo.name" align="center"></u-text>
				<u-text text="介绍:" type="tips"></u-text>
				<u-text :text="groupInfo.intro" align="center"></u-text>
				<u-text text="成员:" type="tips"></u-text>
				<u-text v-for="item in groupInfo.members" :text="item.nickname" align="center"></u-text>
			</view>
		</u-modal>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	import {
		request
	} from '@/api/request.js';
	import ws from '@/websocket/ws.js';
	export default {
		data() {
			return {
				list: [],
				groupInfo: null,
				show: false
			}
		},
		methods: {
			async getFriends() {
				const res = await request("/friend/list");
				this.list = res.data;
				console.log(this.list);
			},
			change(e) {
				console.log(e);
			},
			create() {
				const members = [];
				this.list.forEach((item) => {
					if (item.selected === true) {
						members.push(item);
					}
				})
				this.groupInfo.members = members;
				this.show = true;
			},
			confirm() {
				request("/group/create", "POST", this.groupInfo).then((res) => {
					console.log(res);
					if (res.code == 200) {
						uni.removeStorageSync("create");
						ws.subscribe("/topic/groups/" + res.data, (res) => {
							console.log(res.body);
							const message = JSON.parse(res.body);
							this.$EventBus.$emit("group:" + res.data, message);
						})
						this.$refs.uToast.show({
							message: '创建成功！',
							type: 'success',
							duration: '1000',
							complete: () => {
								uni.switchTab({
									url: '/pages/index/index'
								})
							}
						})
					} else {
						this.$refs.uToast.show({
							message: '创建失败' + res.msg,
							type: 'error',
							duration: '1000'
						})
					}

					this.show = false;
				})
			}
		},
		onShow() {
			this.getFriends();
		},
		onLoad() {
			this.groupInfo = uni.getStorageSync("create");
			console.log(this.groupInfo);
		}
	}
</script>

<style>

</style>