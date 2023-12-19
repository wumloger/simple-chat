<template>
	<view class="container">
		<cu-custom bgColor="bg-gradual-blue" :isBack="true">
			<block slot="content">关于</block>
			<block slot="backText">返回</block>
		</cu-custom>
		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'}">
			<u-cell title="版本号" value="1.0"></u-cell>
		</u-cell-group>
		<u-cell-group :customStyle="{backgroundColor:'white',margin:'10upx'} " :border="false">
			<u-text type="tips" text="介绍" style="padding: 10upx;"></u-text>
			<u-line></u-line>
			<u-text text="
SimpleChat 是一款先进的即时通讯（IM）软件，为用户提供了高效、安全和便捷的沟通体验。无论是个人用户还是企业团队，SimpleChat 都是连接人与人之间的理想选择。"
				style="padding: 10upx;margin-bottom: 30upx;"></u-text>
		</u-cell-group>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		methods: {

		}
	}
</script>

<style>

</style>