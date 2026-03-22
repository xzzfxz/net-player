<template>
	<view class="l-swipe-cell" 
		<!-- #ifdef APP-VUE -->
		:appCloseOnClickOutside="closeOnClickOutside"
		:change:appCloseOnClickOutside="swipeCell.appCloseOnClickOutside"
		:appDestroy="destroy"
		:change:appDestroy="swipeCell.appDestroy"
		<!-- #endif -->
		@click="handleClick"
		@touchstart="handleTouchStart"
		@touchmove="handleTouchMove"
		@touchend="handleTouchEnd">
		<view class="l-swipe-cell__wrapper" id="wrapper" ref="wrapperRef" :style="[wrapperStyle]">
			<view class="l-swipe-cell__left" ref="leftRef">
				<slot name="left"></slot>
			</view>
			<slot></slot>
			<view class="l-swipe-cell__right" ref="rightRef">
				<slot name="right"></slot>
			</view>
		</view>
	</view>
</template>
<!-- #ifdef APP-VUE -->
<script module="swipeCell" lang="renderjs">
	export default {
		data() {
			return {}
		},
		methods: {
			// #ifdef APP-VUE
			appDestroy(flag) {
				if(flag) {
					window.removeEventListener('click', this.appOutsideClick.bind(this))
				}
			},
			appCloseOnClickOutside(flag) {
				if(flag) {
					window.addEventListener('click', this.appOutsideClick.bind(this))
				} else {
					window.removeEventListener('click', this.appOutsideClick.bind(this))
				}
			},
			appOutsideClick() {
				// 使用redirectTo会导致报错 故延时处理
				setTimeout(() =>{
					this.$ownerInstance?.callMethod?.('outsideClick', {})
				},400);
			},
			// #endif
		},
		mounted() {
			
		},
	}
</script>
<!-- #endif -->
<script lang="ts">
	// @ts-nocheck
	/**
	 * SwipeCell 滑动单元格组件
	 * @description 用于实现左右滑动显示操作按钮的交互效果
	 * <br>插件类型：LSwipeCellComponentPublicInstance 
	 * @tutorial https://ext.dcloud.net.cn/plugin?name=lime-swipe-cell
	 * 
	 * @property {string} name 唯一标识符
	 * @property {boolean} disabled 禁用滑动（默认：false）
	 * @property {SwipeActionItem[]} left 左侧操作项配置
	 * @property {SwipeActionItem[]} right 右侧操作项配置
	 * @property {boolean | boolean[]} opened 控制展开状态（数组时控制左右分别）
	 * @property {boolean} closeOnClickOutside 是点击其它地方关闭 默认是false
	 * @property {string} lStyle 自定义组件样式（CSS字符串）
	 * @property {(direction: 'left' | 'right' | 'cell') => Promise<boolean>} beforeClose 关闭前回调函数
	 * @event {Function} open 展开时触发（返回方向）
	 * @event {Function} close 关闭时触发
	 */
	import { computed, ref, getCurrentInstance, defineComponent, onBeforeUnmount, onMounted, nextTick } from '@/uni_modules/lime-shared/vue';
	import { getRect } from '@/uni_modules/lime-shared/getRect'
	import { SwipeActionItem } from './type';
	import { clamp } from '@/uni_modules/lime-shared/clamp'
	import { closeOtherPanels, closeOutside, swipeCellInstances, AUTO_CLOSE_AFTER_CLICK, OPEN_THRESHOLD_PERCENT } from '@/uni_modules/lime-swipe-cell'
	// import { swipeCellInstances, AUTO_CLOSE_AFTER_CLICK, OPEN_THRESHOLD_PERCENT } from './utils';
	import { useTouch } from './useTouch';
	import swipeCellProps from './props';
	
	export default defineComponent({
		name: 'l-swipe',
		props: swipeCellProps,
		emits: ['open', 'close'],
		setup(props, {emit, expose}) {
			const instance = getCurrentInstance()!.proxy!
			swipeCellInstances.push(instance as LSwipeCellComponentPublicInstance);
			
			const leftWidth = ref(0)
			const rightWidth = ref(0)
			const translateX = ref(0)
			const touch = useTouch();
			
			let isOpen:boolean = false;
			let isDragging:boolean = false;
			let startOffset:number = 0;
			
			const wrapperStyle = computed(() => {
				const style:Record<string, any> = {}
				style['transform'] = `translate(${translateX.value}px, 0)`
				style['transitionDuration'] =  isDragging? '0ms' : '600ms'
				return style
			})
			
			// 设置左右面板的宽度
			const setPanelDimensions = async () => {
				// @ts-igrone
				const [leftRect, rightRect] = await Promise.all([getRect('.l-swipe-cell__left', instance), getRect('.l-swipe-cell__right', instance)])
				leftWidth.value = leftRect.width ?? 0;
				rightWidth.value = rightRect.width ?? 0;
			}
			const updateTransform = () => {
				
			}
			// 打开指定方向的面板
			const openPanel = (direction: 'left' | 'right') => {
				translateX.value = direction == 'left' ? leftWidth.value : -rightWidth.value;
				updateTransform()
				if(isOpen) return
				isOpen = true
				emit('open', direction)
			}
			// 关闭面板
			const closePanel = () =>{
				translateX.value = 0;
				updateTransform()
				if(!isOpen) return
				isOpen = false
				emit('close')
			}
			// 切换指定方向的面板
			const togglePanel = (direction: 'left' | 'right') => {
				const threshold = isOpen ? 1 - OPEN_THRESHOLD_PERCENT : OPEN_THRESHOLD_PERCENT;
				const targetWidth = direction == 'left' ? leftWidth.value : rightWidth.value;
				const currentTranslate = Math.abs(translateX.value);
				
				if (currentTranslate > targetWidth * threshold) {
				    openPanel(direction);
				} else {
				    closePanel();
				}
			};
			
			// 关闭其他所有SwipeCell实例的面板
			// const closeOtherPanels = () => {
			// 	swipeCellInstances.filter((item):boolean => item != instance).forEach((item) => {
			// 		item._.exposed.close()
			// 	});
			// }
			
			const handleClick = () => {
				if(AUTO_CLOSE_AFTER_CLICK) {
					if(isOpen && props.beforeClose != null) {
						const direction = translateX.value > 0 
								? 'left' 
								: translateX.value < 0 
									? 'right' 
									: 'cell';
						props.beforeClose!(direction).then(res => {
							if(!res) return
							closePanel()
						})
						return
					}
					closePanel()
				}
			}
			let isTouch = false
			const handleTouchStart = (event: UniTouchEvent) => {
				isTouch = true
				if(props.disabled) return
				startOffset = translateX.value;
				touch.start(event);
				closeOtherPanels(instance)
				setPanelDimensions();
			}
			const handleTouchMove = (event: UniTouchEvent) => {
				if(props.disabled) return
				touch.move(event);
				if(!touch.isHorizontal()) return
				event.preventDefault();
				event.stopPropagation();
				isDragging = true;
				 
				translateX.value = clamp(touch.deltaX.value + startOffset,-rightWidth.value,leftWidth.value);
				updateTransform()
			}
			const handleTouchEnd = (e: UniTouchEvent) => {
				setTimeout(()=>{
					isTouch = false
				},100)
				if(!isDragging) return
				isDragging = false
				togglePanel(translateX.value > 0 ? 'left' : 'right')
			}
			
			const renderMenuStatus = () => {
				if(typeof props.opened == 'boolean') {
					if(props.opened == true && rightWidth.value > 0) {
						openPanel('right');
					} else if(props.opened == true && leftWidth.value > 0) {
						openPanel('left');
					}
				} else if(Array.isArray(props.opened) && (props.opened as boolean[]).length > 0) {
					const opened = props.opened as boolean[]
					const leftOpened = opened[0]
					const rightOpened = opened.length > 1 ? opened[1]: false;
					
					if(rightOpened && rightWidth.value > 0) {
						openPanel('right');
					} else if(leftOpened && leftWidth.value > 0) {
						openPanel('left');
					}
				}
			}
			
			
			const outsideClick = (e: UniPointerEvent)=> {
				if(!props.closeOnClickOutside || isTouch) return
				// closeOtherPanels(instance)
				closeOutside()
			}
			
			onMounted(()=>{
				nextTick(()=>{
					// #ifdef WEB
					window.addEventListener('click', outsideClick)
					// #endif
				})
				setPanelDimensions()
				nextTick(()=>{
					setTimeout(()=>{
						renderMenuStatus()
					},50)
				})
			})
			
			const destroy = ref(false)
			onBeforeUnmount(()=>{
				// #ifdef WEB
				window.removeEventListener('click', outsideClick)
				// #endif
				// #ifdef  APP-VUE
				destroy.value = true
				// #endif
				const index = swipeCellInstances.findIndex((item):boolean => item == instance);
				if(index == -1) return
				swipeCellInstances.splice(index)
			})
			// #ifdef VUE3
			expose({
				close: closePanel
			})
			// #endif
			return {
				wrapperStyle,
				handleClick,
				handleTouchStart,
				handleTouchMove,
				handleTouchEnd,
				
				outsideClick,
				destroy,
				// #ifdef VUE2
				close: closePanel
				// #endif
			}
		}
	})
</script>
<style lang="scss">
	@import './index-u';
</style>