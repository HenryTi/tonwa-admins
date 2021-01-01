import { UiNumberItem } from "../schema";
import { InputOptions, StringItemEdit } from "./stringItemEdit";

export class NumberItemEdit extends StringItemEdit {
	protected inputOptions():InputOptions {
		let min:number, max:number, step:number;
		if (this._uiItem) {
			min = (this._uiItem as UiNumberItem).min
			max = (this._uiItem as UiNumberItem).max
			step = (this._uiItem as UiNumberItem).step
		}
		return {
			type: 'number',
			min, max, step
		}
	}
}
