<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="content">创建群聊</block>
			<block slot="backText">返回</block>
		</cu-custom>

		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx',padding:'20upx',paddingLeft:'10upx'}">
			<u-text text="点击上传头像" type="tips" style="padding-left:10upx;"></u-text>
			<u-upload :fileList="fileList" :deletable="true" @delete="deletePic" @afterRead="afterRead" name="avatar"
				style="margin:0 auto;" :previewImage="false" accept="image">
				<div style="width: 160upx; height: 160upx; border-radius: 50%; overflow: hidden;">
					<img v-if="fileList.length > 0" :src="fileList[fileList.length - 1].url"
						style="width: 100%; height: 100%;border-radius:50%;" />
					<u-avatar size="80" :src="groupInfo.avatar"></u-avatar>
				</div>
			</u-upload>
		</u-cell-group>
		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'}">
			<u-text text="群名" type="tips" style="padding-left:10upx;"></u-text>
			<u-input border="bottom" v-model.trim="groupInfo.name"></u-input>
		</u-cell-group>
		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'}">
			<u-text text="介绍" type="tips" style="padding-left:10upx;"></u-text>
			<u--textarea v-model.trim="groupInfo.intro" border="none"></u--textarea>
		</u-cell-group>
		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx',marginTop:'40upx'}">
			<u-button text="下一步" plain type="primary" @tap="next"></u-button>
		</u-cell-group>

		<u-toast ref="uToast"></u-toast>

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
				groupInfo: {
					avatar: '',
					name: '',
					intro: ''
				},
				edit: true,
				fileList: []
			}
		},
		methods: {

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
			next() {
				if (this.fileList <= 0) {
					this.$refs.uToast.show({
						message: '请上传群头像！',
						type: 'warning',
						duration: '1000'
					})
				}
				if (this.groupInfo.name === '' || this.groupInfo.name === null) {
					this.$refs.uToast.show({
						message: '群名不能为空！',
						type: 'warning',
						duration: '1000'
					})
				}
				uploadFile("/user/oss/uploadAvatar", this.fileList[this.fileList.length - 1].url).then((res) => {
					const data = JSON.parse(res);
					console.log(data.data);
					this.groupInfo.avatar = data.data.split("?")[0];
					console.log(this.groupInfo);
					uni.setStorageSync("create", this.groupInfo);
					uni.navigateTo({
						url: '/pages/group/selectFriends'
					})
				})
			}

		},
		onShow() {

		},
		onLoad() {

		}
	}
</script>

<style>

</style>