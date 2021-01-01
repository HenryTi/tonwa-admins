export interface IValuesViewRenderOptions {
	className?: string;
	inputName?: string;
	wrapClassName?: string;
	onInputChange?: (evt: React.ChangeEvent<HTMLInputElement>)=>void;
	inputs?: {[index:number]: HTMLInputElement};
}

export interface IValuesView {
	render(values: number|string):JSX.Element;
	renderRadios(value: number, options: IValuesViewRenderOptions): JSX.Element;
	renderChecks(values: string, options: IValuesViewRenderOptions): JSX.Element;
}
