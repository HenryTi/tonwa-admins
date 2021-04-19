import { Form, ItemSchema, VPage, StringSchema, ButtonSchema, UiButton, UiTextItem, Context } from "tonva";
import { CUqRoles } from "./CUqRoles";

export class VAddUser extends VPage<CUqRoles> {
	header() {return '新增角色用户'}
	content() {
		let schema:ItemSchema[] = [
			{ name: 'userName', required: true, type: 'string', maxLength: 60 } as StringSchema,
			{ name: 'ok', type: 'submit' } as ButtonSchema,
		];
		let uiSchema = {
			items: {
				userName: { widget: 'text', label:'用户账号', placeholder: '请输入用户的账号' } as UiTextItem,
				ok: { widget: 'button', className: 'btn btn-primary', label: '提交' } as UiButton,
			}
		}
		return <div className="p-3">
			<Form schema={schema} uiSchema={uiSchema} onButtonClick={this.onClick} onEnter={this.onEnter} />
		</div>
	}

	private onClick = async (name:string, context: Context) => {
		let error = await this.controller.newUser(context.data['userName']);
		if (error) {
			context.setError('userName', error);
			return;
		}
		this.closePage();
	}

	private onEnter = async (name:string, context: Context) => {
		await this.onClick(name, context);
	}
}
