<template>
	<view class="container">
		<u-loading-page :loading="show" loadingText="SIMPLE CHAT" iconSize="100" loadingMode="semicircle"
			fontSize="25"></u-loading-page>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				show: true
			}
		},
		methods: {

		},
		onLoad() {
			setTimeout(() => {
				uni.switchTab({
					url: '/pages/index/index'
				})
			}, 1000)

		}
	}
</script>

<style>

</style>