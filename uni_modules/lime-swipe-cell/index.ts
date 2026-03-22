// @ts-nocheck
// Configuration
export const AUTO_CLOSE_AFTER_CLICK = true; // 是否在点击菜单后自动关闭
export const OPEN_THRESHOLD_PERCENT = 0.3; // 自动打开菜单的滑动阈值百分比
export const swipeCellInstances : LSwipeCellComponentPublicInstance[] = []

// 全局事件监听器状态
let globalClickHandler: ((e: UniPointerEvent) => void) | null = null
// #ifdef UNI-APP-X && APP
let pageElementCallbackWrapper : UniCallbackWrapper | null = null
let appPageElement: UniElement|null = null // 存储APP端的页面元素
// #endif

// 关闭其他所有SwipeCell实例的面板
export const closeOtherPanels = (instance : LSwipeCellComponentPublicInstance) => {
	swipeCellInstances.filter((item) : boolean => item != instance).forEach((item) => {
		// #ifdef UNI-APP-X && APP || UNI-APP-X && WEB
		item.$callMethod('close')
		// #endif
		// #ifndef UNI-APP-X && APP || UNI-APP-X && WEB
		item._.exposed.close()
		// #endif
	});
}


export const closeOutside = () => {
	swipeCellInstances.forEach((item) => {
		// #ifdef UNI-APP-X && APP || UNI-APP-X && WEB
		item.$callMethod('close')
		// #endif
		// #ifndef UNI-APP-X && APP || UNI-APP-X && WEB
		item._.exposed.close()
		// #endif
	});
}


export function removeFromQueue(comp : ComponentPublicInstance) {
	const index = swipeCellInstances.findIndex((item) : boolean => item == comp)
	if (index == -1) return
	swipeCellInstances.splice(index, 1)
}


export const setupGlobalClickListener = (instance : ComponentPublicInstance) => {
	if(globalClickHandler != null) return
	globalClickHandler = (_e : UniPointerEvent) => {
		// 通知所有注册的实例
		closeOutside()
	}
	
	// #ifdef WEB
	window.addEventListener('click', globalClickHandler!)
	// #endif
	// #ifdef UNI-APP-X && APP
	appPageElement = instance.$el?.uniPage?.vm.$el
	if (appPageElement != null) {
		pageElementCallbackWrapper = appPageElement?.addEventListener('click', globalClickHandler!)
	}
	// #endif
}

export const removeGlobalClickListener = () => {
	if (swipeCellInstances.length == 0 && globalClickHandler != null) {
		// #ifdef WEB
		window.removeEventListener('click', globalClickHandler!)
		// #endif
		// #ifdef UNI-APP-X && APP
		appPageElement?.removeEventListener('click', pageElementCallbackWrapper!)
		pageElementCallbackWrapper = null
		appPageElement = null
		// #endif
		globalClickHandler = null
	}
}