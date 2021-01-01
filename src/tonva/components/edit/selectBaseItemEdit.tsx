import { UiSelectBase } from '../schema';
import { ItemEdit } from './itemEdit';

export abstract class SelectItemBaseEdit extends ItemEdit {
    get uiItem(): UiSelectBase {return this._uiItem as UiSelectBase}
}
