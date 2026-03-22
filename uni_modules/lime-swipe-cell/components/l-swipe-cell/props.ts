// @ts-nocheck
export const ariaProps = {
	ariaHidden: Boolean,
	ariaRole: String,
	ariaLabel: String,
	ariaLabelledby: String,
	ariaDescribedby: String,
	ariaBusy: Boolean
}
export default {
	...ariaProps,
	name: String,
	/**
	 *  是否禁用滑动
	 */
	disabled: Boolean,
	closeOnClickOutside: {
		type: Boolean,
		default: false
	},
	/**
	 * 操作项是否呈现为打开态，值为数组时表示分别控制左右滑动的展开和收起状态
	 */
	opened: [Boolean, Array],
	/**
	 * 自定义组件样式
	 */
	lStyle: [String, Object],
	beforeClose: Function
}