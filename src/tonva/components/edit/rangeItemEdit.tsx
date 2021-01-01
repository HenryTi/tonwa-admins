import { UiRange } from "../schema";
import { InputOptions, StringItemEdit } from "./stringItemEdit";

export class RangeItemEdit extends StringItemEdit {
	protected inputOptions():InputOptions {
		let min:number, max:number, step:number;
		if (this._uiItem) {
			min = (this._uiItem as UiRange).min
			max = (this._uiItem as UiRange).max
			step = (this._uiItem as UiRange).step
		}
		return {
			type: 'range',
			min, max, step
		}
	}
}
