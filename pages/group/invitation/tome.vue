<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="content">收到的申请</block>
			<block slot="backText">返回</block>
		</cu-custom>
		<view class="cu-list menu-avatar" style="border-top: none;">
			<view class="cu-item" :class="modalName=='move-box-'+ index?'move-cur':''" @touchstart="ListTouchStart"
				@touchmove="ListTouchMove" @touchend="ListTouchEnd" :data-target="'move-box-' + index"
				v-for="(cell, index) in list">
				<view class="cu-avatar round lg" :style="[{backgroundImage:'url('+cell.userAvatar+')'}]">
				</view>
				<view class="content">
					<view class="text-grey">{{cell.userNickname}}</view>
					<view class="text-gray text-sm flex">
						<view class="text-cut">
							<text v-if="cell.remark != null">申请进入{{cell.groupName}}<br>备注：{{cell.remark}}</text>
							<text v-else>备注：无</text>
						</view>
					</view>
				</view>
				<view class="action">
					<u--text text="待审核" type="primary" v-if="cell.status == 0"></u--text>
					<u--text text="已通过" type="success" v-else-if="cell.status == 1"></u--text>
					<u--text text="已拒绝" type="error" v-else></u--text>
				</view>
				<view class="move">
					<view v-if="cell.status != 0" style="background-color:#f56767; color: white;"
						@click="removed(cell.id)">
						删除
					</view>
					<template v-else>
						<view style="background-color: #5ac725; color: white;" @tap="agreed(cell)">同意</view>
						<view style="background-color: #f56767; color: white;" @tap="refused(cell)">拒绝</view>
					</template>

				</view>
			</view>
		</view>
		<u-modal :show="show" title="请填写拒绝理由" :showCancelButton="true" :closeOnClickOverlay="true" @close="show=false"
			@cancel="show=false" @confirm="confirm">
			<view class="slot-content" style="width: 100%;">
				<u-input v-model.trim="reason" :clearable="true"></u-input>
			</view>
		</u-modal>
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
				show: false,
				reason: '',
				selected: null,
			}
		},
		methods: {
			getForMe() {
				request("/group/getInvitations").then((res) => {
					console.log(res.data);
					this.list = res.data;
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
			agreed(cell) {
				this.selected = cell;
				if (this.selected) {
					this.selected.status = 1;
					request("/group/audit", "POST", this.selected).then((res) => {
						this.show = false;
						this.getForMe();
						if (res.code == 200) {
							this.$refs.uToast.show({
								message: '已同意',
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
			refused(cell) {
				this.show = true;
				this.selected = cell;
			},
			confirm() {
				if (this.selected) {
					this.selected.status = 2;
					this.selected.reason = this.reason;
					request("/group/audit", "POST", this.selected).then((res) => {
						this.show = false;
						this.getForMe();
						if (res.code == 200) {
							this.$refs.uToast.show({
								message: '已拒绝',
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
			removed(id) {
				request("/group/deleteInvitation/" + id, "DELETE").then((res) => {
					this.getForMe();
					console.log(res);
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
			this.getForMe();
		}
	}
</script>

<style>

</style>