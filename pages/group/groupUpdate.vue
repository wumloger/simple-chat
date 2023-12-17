<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="content">群组设置</block>
			<block slot="backText">返回</block>
			<block slot="right">
				<text v-if="edit" @tap="edit = false">编辑</text>
				<text v-else @tap="save">保存</text>
			</block>
		</cu-custom>
		<template v-if="groupInfo">
			<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx',padding:'20upx',paddingLeft:'10upx'}">
				<u-text text="点击更换头像" type="tips" style="padding-left:10upx;"></u-text>
				<u-upload :disabled="edit" :fileList="fileList" :deletable="true" @delete="deletePic"
					@afterRead="afterRead" name="avatar" style="margin:0 auto;" :previewImage="false" accept="image">
					<div style="width: 160upx; height: 160upx; border-radius: 50%; overflow: hidden;">
						<img v-if="fileList.length > 0" :src="fileList[fileList.length - 1].url"
							style="width: 100%; height: 100%;border-radius:50%;" />
						<u-avatar size="80" :src="groupInfo.avatar"></u-avatar>
					</div>
				</u-upload>
			</u-cell-group>
			<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'}">
				<u-text text="群名" type="tips" style="padding-left:10upx;"></u-text>
				<u-input border="bottom" :disabled="edit" v-model="groupInfo.name"></u-input>
			</u-cell-group>
			<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'}">
				<u-text text="介绍" type="tips" style="padding-left:10upx;"></u-text>
				<u--textarea v-model="groupInfo.intro" :disabled="edit" border="none"></u--textarea>
			</u-cell-group>
			<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'}">
				<u-text text="公告" type="tips" style="padding-left:10upx;"></u-text>
				<u--textarea v-model="groupInfo.notice" :disabled="edit" border="none"></u--textarea>
			</u-cell-group>
			<u-cell-group v-if="groupInfo.createBy === userId"
				:customStyle="{backgroundColor:'white',margin:'10upx',marginTop:'40upx'}">
				<u-button text="解散群聊" plain type="error" @click="deleteGroup"></u-button>
			</u-cell-group>
		</template>


		<u-toast ref="uToast"></u-toast>
		<u-modal :show="show" title="是否确定解散？" content='注意!该操作一经确认无法撤回!请谨慎选择!' :showCancelButton="true"
			:buttonReverse="true" :closeOnClickOverlay="true" @close="show=false" @cancel="show=false"
			@confirm="modelConfirm"></u-modal>
	</view>
</template>

<script>
	import {
		request,
		uploadFile
	} from '@/api/request.js'
	export default {
		data() {
			return {
				id: '',
				userId: '',
				groupInfo: null,
				edit: true,
				fileList: [],
				show: false
			}
		},
		methods: {
			async getGroupInfo() {
				const res = await request("/group/get/" + this.id,
					"GET");
				console.log(res);
				this.groupInfo = res.data
			},
			// 删除图片
			deletePic(event) {
				this.fileList = [];
			},
			// 新增图片
			async afterRead(event) {
				console.log(event);
				this.fileList.push(event.file)
				console.log(this.fileList);
			},
			async save() {
				this.edit = true;
				const _this = this;
				if (this.fileList.length > 0) {

					uploadFile("/user/oss/uploadAvatar", this.fileList[this.fileList.length - 1]
						.url).then((res) => {
						const data = JSON.parse(res);
						console.log(data.data);
						if (data.code == 200) {
							this.groupInfo.avatar = data.data.split("?")[0];
							console.log(this.groupInfo);
							request("/group/update", "POST", _this.groupInfo).then((res) => {
								if (res.code == 200) {
									this.$refs.uToast.show({
										message: '跟新成功',
										type: 'success'
									})
								} else {
									this.$refs.uToast.show({
										message: '更新失败' + res.msg,
										type: 'error'
									})
								}
							})
						}
					})

				} else {
					console.log(_this.groupInfo);
					request("/group/update", "POST", _this.groupInfo).then((res) => {
						if (res.code == 200) {
							this.$refs.uToast.show({
								message: '更新成功',
								type: 'success'
							})
						} else {
							this.$refs.uToast.show({
								message: '更新失败' + res.msg,
								type: 'error'
							})
						}
					})
				}
			},
			deleteGroup() {
				this.show = true;
			},
			modelConfirm() {
				request("/group/delete/" + this.id, "DELETE").then((res) => {
					console.log(res);
					if (res.code == 200) {
						this.$refs.uToast.show({
							message: '解散成功！',
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
							message: '解散失败' + res.msg,
							type: 'error',
							duration: '1000'
						})
					}
				})
				this.show = false
			}
		},
		onShow() {
			this.getGroupInfo();
		},
		onLoad(data) {
			this.id = data.id;
			this.userId = uni.getStorageSync("userInfo").id;
		}
	}
</script>

<style>

</style>