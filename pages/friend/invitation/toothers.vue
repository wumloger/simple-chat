<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="content">发出的申请</block>
			<block slot="backText">返回</block>
		</cu-custom>
		<view class="cu-list menu-avatar" style="border-top: none;">
			<view class="cu-item" :class="modalName=='move-box-'+ index?'move-cur':''" @touchstart="ListTouchStart"
				@touchmove="ListTouchMove" @touchend="ListTouchEnd" :data-target="'move-box-' + index"
				v-for="(cell, index) in list">
				<view class="cu-avatar round lg" :style="[{backgroundImage:'url('+cell.friendAvatar+')'}]">
				</view>
				<view class="content">
					<view class="text-grey">{{cell.friendNickname}}</view>
					<view class="text-gray text-sm flex">
						<view class="text-cut">
							<text v-if="cell.remark != null">备注：{{cell.remark}}</text>
							<text v-else>备注：无</text>
						</view>
					</view>
				</view>
				<view class="action">
					<u--text text="正在审核" type="primary" v-if="cell.status == 0"></u--text>
					<u--text text="已通过" type="success" v-else-if="cell.status == 1"></u--text>
					<u--text text="已拒绝" type="error" v-else></u--text>
				</view>
				<view class="move">
					<view style="background-color:#f56767; color: white;" @click="removed(cell.id)">
						删除
					</view>
				</view>
			</view>
		</view>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	import {
		request
	} from '@/api/request.js';
	export default {
		data() {
			return {
				list: [],
				modalName: null,
				listTouchStart: 0,
				listTouchDirection: null,
				selected: null,
			}
		},
		methods: {
			getForOthers() {
				request("/friend/getInvitation").then((res) => {
					this.list = res.data
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
			},
			removed(id) {
				request("/friend/deleteInvitation/" + id, "DELETE").then((res) => {
					this.getForOthers();
					if (res.code == 200) {
						this.$refs.uToast.show({
							message: '删除成功',
							type: 'success'
						})
					} else {
						this.$refs.uToast.show({
							message: res.msg,
							type: 'error'
						})
					}
				})
			}
		},
		onShow() {
			this.getForOthers();
		}
	}
</script>

<style>

</style>