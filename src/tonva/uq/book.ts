import {Query} from './query';
import { QueryQueryCaller } from './caller';

export class Book extends Query {
    get typeName(): string { return 'book';}
    protected queryApiName = 'book';

    protected queryCaller(params: any): QueryQueryCaller {
        return new BookQueryCaller(this, params);
    }
}

export class BookQueryCaller extends QueryQueryCaller {
    get path():string {return `book/${this.entity.name}`;}
}
