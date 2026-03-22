<template>
	<view class="demo-block">
		<text class="demo-block__title-text ultra">SwipeCell 滑动操作</text>
		<text class="demo-block__desc-text">可以左右滑动来展示操作按钮的单元格组件。</text>
		<view class="demo-block__body">
			<view class="demo-block">
				<text class="demo-block__title-text">基础用法</text>
				<view class="demo-block__body">
					<l-swipe-cell>
						<l-cell title="左滑单操作" note="辅助信息" :bordered="false" />
						<template #right>
							<view class="btn delete-btn"><text style="color: white;">删除</text></view>
						</template>
					</l-swipe-cell>
				</view>
			</view>
			<view class="demo-block">
				<text class="demo-block__title-text">左滑双操作</text>
				<view class="demo-block__body">
					<l-swipe-cell>
						<l-cell title="左滑双操作" note="辅助信息" :bordered="false" />
						<template #right>
							<view class="btn edit-btn"><text style="color: white;">编辑</text></view>
							<view class="btn delete-btn"><text style="color: white;">删除</text></view>
						</template>
					</l-swipe-cell>
				</view>
			</view>
			<view class="demo-block">
				<text class="demo-block__title-text">左右滑操作</text>
				<view class="demo-block__body">
					<l-swipe-cell>
						<l-cell title="左滑双操作" note="辅助信息" :bordered="false" />
						<template #left>
							<view class="btn favor-btn"><text style="color: white;">选择</text></view>
						</template>
						<template #right>
							<view class="btn edit-btn"><text style="color: white;">编辑</text></view>
						</template>
					</l-swipe-cell>
				</view>
			</view>
			<view class="demo-block">
				<text class="demo-block__title-text">异步关闭</text>
				<view class="demo-block__body">
					<l-swipe-cell :beforeClose="beforeClose">
						<l-cell title="左滑双操作" note="辅助信息" :bordered="false" />
						<template #left>
							<view class="btn favor-btn"><text style="color: white;">选择</text></view>
						</template>
						<template #right>
							<view class="btn edit-btn" @click="onDelete"><text style="color: white;">删除</text></view>
						</template>
					</l-swipe-cell>
				</view>
			</view>
		</view>
		<view style="height: 500px;"></view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			onEdit() {
				console.log('onEdit')
			},
			beforeClose(direction) {
				return new Promise((resolve)=>{
					if(direction == 'right') {
						this.resolveClose = resolve
					} else {
						resolve(true)
					}
				})
			},
			onDelete() {
				console.log('onDelete')
				uni.showModal({
					title: '温馨提示',
					content: '确定要删除吗？',
					success:(res) => {
						if(res.confirm) {
							this.resolveClose?.(true)
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.btn-wrapper {
	  height: 100%;
	}
	
	.btn {
	  display: inline-flex;
	  justify-content: center;
	  align-items: center;
	  width: 120rpx;
	  height: 100%;
	  // color: white;
	}
	
	.delete-btn {
	  background-color: #FF4D4F;
	}
	
	.edit-btn {
	  background-color: #ffb400;
	}
	
	.favor-btn {
	  background-color: #3283ff;
	}

	.demo-block {
		margin: 32px 0 0;
		overflow: visible;

		&__title {
			margin: 0;
			margin-top: 8px;

			&-text {
				color: rgba(0, 0, 0, 0.6);
				font-weight: 400;
				font-size: 14px;
				line-height: 16px;
				padding-left: 20px;

				&.large {
					color: rgba(0, 0, 0, 0.9);
					font-size: 18px;
					font-weight: 700;
					line-height: 26px;
				}

				&.ultra {
					color: rgba(0, 0, 0, 0.9);
					font-size: 24px;
					font-weight: 700;
					line-height: 32px;
				}
			}
		}

		&__desc-text {
			color: rgba(0, 0, 0, 0.6);
			margin: 8px 16px 0 0;
			font-size: 14px;
			line-height: 22px;
			padding-left: 20px;
		}

		&__body {
			margin: 16px 0;
			overflow: visible;

			.demo-block {
				// margin-top: 0px;
				margin: 0;
			}
		}
	}
</style>