<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="content">我的信息</block>
			<block slot="backText">返回</block>
			<block slot="right">
				<text v-if="edit" @tap="edit = false">编辑</text>
				<text v-else @tap="save">保存</text>
			</block>
		</cu-custom>
		<template v-if="userInfo">
			<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx',padding:'20upx',paddingLeft:'10upx'}"
				:border="false">
				<u-text text="点击更换头像" type="tips" style="padding-left:10upx;"></u-text>
				<u-upload :disabled="edit" :fileList="fileList" :deletable="true" @delete="deletePic"
					@afterRead="afterRead" name="avatar" style="margin:0 auto;" :previewImage="false" accept="image"
					:max-size="1024 * 1024" @oversize="overSize()">
					<div style="width: 160upx; height: 160upx; border-radius: 50%; overflow: hidden;">
						<img v-if="fileList.length > 0" :src="fileList[fileList.length - 1].url"
							style="width: 100%; height: 100%;border-radius:50%;" />
						<u-avatar size="80" :src="userInfo.avatar"></u-avatar>
					</div>
				</u-upload>
			</u-cell-group>
			<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'}">
				<u-cell title="用户名" :value="userInfo.username"></u-cell>
				<u-cell title="邮箱" :value="userInfo.email"></u-cell>
				<u-cell title="用户id" :value="userInfo.id"></u-cell>
			</u-cell-group>
			<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'}">
				<u-cell title="昵称">
					<view slot="value" class="u-slot-value" style="width: 400upx;">
						<u-input v-model="userInfo.nickname" style="background-color: white;"
							:disabled="edit"></u-input>
					</view>
				</u-cell>
				<u-cell title="生日">
					<view slot="value" class="u-slot-value" style="width: 400upx;">
						<u-input v-model="userInfo.birthday" style="background-color: white;" :disabled="true">
							<template slot="suffix">
								<u-icon name="calendar" size="24" @click="timePicker"></u-icon>
							</template>
						</u-input>
					</view>
				</u-cell>
				<u-cell title="性别">
					<view slot="value" class="u-slot-value">
						<u-radio-group v-model="userInfo.sex" placement="row" :disabled="edit">
							<u-radio :customStyle="{marginBottom: '8px',marginRight:'16upx'}"
								v-for="(item, index) in radiolist" :key="index" :label="item.name" :name="item.name"
								@change="radioChange">
							</u-radio>
						</u-radio-group>
					</view>
				</u-cell>
			</u-cell-group>

			<u-datetime-picker :show="show" mode="date" :minDate="753192000000" @confirm="confirm"
				@cancel="show = false"></u-datetime-picker>
		</template>


		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	import {
		request,
		uploadFile
	} from '@/api/request.js';

	export default {
		data() {
			return {
				userInfo: null,
				edit: true,
				fileList: [],
				show: false,
				radiolist: [{
						name: '男',
						disabled: false
					},
					{
						name: '女',
						disabled: false
					},
					{
						name: '未知',
						disabled: false
					}
				],
			}
		},
		methods: {
			// 图片过大处理
			overSize() {
				this.$refs.uToast.show({
					message: '图片大小不能超过1M',
					type: 'warning',
					duration: '1000',
					position: 'top'
				})
			},
			// 删除图片
			deletePic(event) {
				this.fileList = [];
			},
			// 新增图片
			async afterRead(event) {
				console.log(event);
				this.fileList.push(event.file)

			},
			convertTimestamp(timestamp) {
				const date = new Date(timestamp);
				const year = date.getFullYear().toString();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				return `${year}-${month}-${day}`;
			},
			confirm(val) {
				console.log(val);
				const time = this.convertTimestamp(val.value);
				this.userInfo.birthday = time;
				this.show = false;
			},
			radioChange(val) {
				console.log(val);
				this.userInfo.sex = val;
			},
			timePicker() {
				if (this.edit) {
					this.show = false;
				} else {
					this.show = true;
				}
			},
			save() {
				const _this = this;
				uni.showLoading({
					mask: true,
					title: '更新中...'
				});
				if (this.fileList.length > 0) {
					console.log(this.fileList);
					uploadFile("/user/oss/uploadAvatar", this.fileList[this.fileList.length - 1].url).then((res) => {
						const data = JSON.parse(res);
						this.userInfo.avatar = data.data.split("?")[0];
						request("/user/updateUser", "PUT", this.userInfo).then((res) => {
							if (res.code == 200) {
								uni.setStorageSync("userInfo", _this.userInfo);
								this.$refs.uToast.show({
									message: '修改成功',
									type: 'success',
									duration: '1000',
									position: 'top'
								})
							} else {
								this.$refs.uToast.show({
									message: '修改失败' + res.msg,
									type: 'error',
									duration: '1000',
									position: 'top'
								})
							}
							this.getUserInfo();
							uni.hideLoading();
						}).catch((err) => {
							uni.hideLoading();
						})
					}).catch((err) => {
						uni.hideLoading();
					})
				} else {
					request("/user/updateUser", "PUT", this.userInfo).then((res) => {

						if (res.code == 200) {
							uni.setStorageSync("userInfo", _this.userInfo);
							this.$refs.uToast.show({
								message: '修改成功',
								type: 'success',
								duration: '1000',
								position: 'top'
							})
						} else {
							this.$refs.uToast.show({
								message: '修改失败' + res.msg,
								type: 'error',
								duration: '1000',
								position: 'top'
							})
						}
						this.getUserInfo();
						uni.hideLoading();
					}).catch((err) => {
						uni.hideLoading();
					})
				}
				this.edit = true;
			},
			getUserInfo() {
				this.userInfo = uni.getStorageSync("userInfo");
			}
		},
		onLoad() {

			this.getUserInfo();

		}

	}
</script>

<style>

</style>