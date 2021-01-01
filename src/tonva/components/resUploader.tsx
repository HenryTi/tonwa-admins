import * as React from 'react';
import { nav } from './nav';
import { Loading } from './loading';
import { Image as ImageControl } from './image';
import { Page } from './page/page';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { LMR } from './simple';

export interface ResUploaderProps {
    className?: string;
    label?: string;
    multiple?: boolean;
    maxSize?: number;
    onFilesChange?: (evt: React.ChangeEvent<HTMLInputElement>) => void;
}

@observer
export class ResUploader extends React.Component<ResUploaderProps> {
    private fileInput: HTMLInputElement;
    @observable private fileName: string;

    buildFormData():FormData {
        let {maxSize} = this.props;
        if (maxSize === undefined || maxSize <= 0) 
            maxSize = 100000000000;
        else
            maxSize = maxSize * 1024;
        var files:FileList = this.fileInput.files;
        var data = new FormData();
        let len = files.length;
        for (let i=0; i<len; i++) {
            let file = files[i];
            if (file.size > maxSize) return null;
            data.append('files[]', file, file.name);
        }
    }

    getFile0(): File {
        return this.fileInput.files[0];
    }

    upload = async (formData?: FormData):Promise<string|{error:any}> => {
        let resUrl = nav.resUrl + 'upload';
        if (!formData) formData = this.buildFormData();
        try {
            nav.startWait();
            let headers = new Headers();
            headers.append('Access-Control-Allow-Origin', '*');
            //2019-12-18：因为 vivo按oppo某些版本不支持，暂时先不要 
            //let abortController = new AbortController();
            let res = await fetch(resUrl, {
                method: "POST",
                body: formData,
                headers: headers,
                //signal: abortController.signal,
            });
            let json = await res.json();
            return ':' + json.res.id;
        }
        catch (err) {
            console.error('%s %s', resUrl, err);
            return {error:err};
        }
        finally {
            nav.endWait();
        }
    }

    private onFilesChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        let {onFilesChange} = this.props;
        if (onFilesChange) onFilesChange(evt);
        let files = evt.target.files;
        let len = files.length;
        let names:string[] = [];
        for (let i=0; i<len; i++) {
            names.push(files.item(i).name);
        }
        this.fileName = names.join(', ');
    }

    render() {
        let {className, multiple, label} = this.props;
        return <div>
                <label className="btn btn-outline-success">
                    {label || '选择文件'} 
                    <input 
                        className={className}
                        ref={t=>this.fileInput=t} 
                        onChange={this.onFilesChange}
                        type='file' name='file' 
                        multiple={multiple} style={{display:'none'}} />
                </label>
                &nbsp;
                {this.fileName}
            </div>
    }
}

function formatSize(size:number, pointLength:number=2, units?:string[]) {
    var unit;
    units = units || [ 'B', 'K', 'M', 'G', 'TB' ];
    while ( (unit = units.shift()) && size > 1024 ) {
        size = size / 1024;
    }
    return (unit === 'B' ? size : size.toFixed( pointLength === undefined ? 2 : pointLength)) + unit;
}

interface ImageUploaderProps {
    id?: string;
    label?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'raw';
	onSaved?: (imageId:string) => Promise<void>;
	imageTypes?: string[];
}

const xlargeSize = 1600;
const largeSize = 800;
const mediumSize = 400;
const smallSize = 180;

@observer
export class ImageUploader extends React.Component<ImageUploaderProps> {
	private static imageTypes = ['gif', 'jpg', 'jpeg', 'png', 'svg', 'apng', 'bmp', 'ico', 'cur', 'tiff', 'tif', 'webp'];
	private imgBaseSize: number;
	private imageTypes: string[];
    private suffix: string;
    private resUploader: ResUploader;
    @observable private file: File;    
    @observable private desImgWidth: number;
    @observable private desImgHeight: number;
    @observable private desImgSize: number;
    @observable private srcImgWidth: number;
    @observable private srcImgHeight: number;
    @observable private isChanged: boolean = false;
    @observable private resId: string;
    @observable private enableUploadButton: boolean = false;
    @observable private srcImage: string;
    @observable private desImage: string;
    @observable private fileError: string;
    @observable private uploaded: boolean = false;

    constructor(props: ImageUploaderProps) {
        super(props);
		this.resId = props.id;
		this.imageTypes = props.imageTypes || ImageUploader.imageTypes;
    }

    private onFileChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.fileError = undefined;
        this.uploaded = false;
        this.enableUploadButton = evt.target.files.length > 0;
        if (this.enableUploadButton) {
            this.file = evt.target.files[0];
            let pos = this.file.name.lastIndexOf('.');
            if (pos >= 0) this.suffix = this.file.name.substr(pos+1).toLowerCase();
            if(this.imageTypes.indexOf(this.suffix) < 0){
                this.fileError = `图片类型必须是 ${this.imageTypes.join(', ')} 中的一种`;
                return;
            }
            let reader = new FileReader();
            reader.readAsDataURL(this.file);
            reader.onload = async () => {
				this.srcImage = reader.result as string;
				switch (this.suffix ) {
					default:
						await this.setSize(this.props.size);
						break;
					case 'svg':
						this.imgBaseSize = mediumSize;
						this.desImgSize = this.srcImage.length;
						this.desImage = this.srcImage;
						break;
				}
            };
        }
    }

    private async setSize(size?: 'sm' | 'md' | 'lg' | 'xl' | 'raw') {
        switch (size) {
            default:
            case 'sm':
                this.imgBaseSize = smallSize; break;
            case 'md':
                this.imgBaseSize = mediumSize; break;
            case 'lg':
				this.imgBaseSize = largeSize; break;
			case 'xl':
				this.imgBaseSize = xlargeSize; break;
			case 'raw':
				this.imgBaseSize = -1; break;
		}
		this.desImage = await this.compress();
    }

    private compress = ():Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            var img = new Image();
            img.src = this.srcImage;
            img.onload = () => {
                //var that = this;
                // 默认按比例压缩
                let {width, height} = img;
                this.srcImgWidth = width;
                this.srcImgHeight = height;
                let scale = width / height;
				let w:number, h:number;
				if (this.imgBaseSize < 0) {
					w = width;
					h = height;
				}
                else if (width <= this.imgBaseSize && height <= this.imgBaseSize) {
                    w = width;
                    h = height;
                }
                else if (scale < 0) {
                    w = this.imgBaseSize;
                    h = w / scale;
                }
                else {
                    h = this.imgBaseSize;
                    w = h * scale;
                }
                this.desImgWidth = Math.round(w);
                this.desImgHeight = Math.round(h);
                var quality = 0.7;  // 默认图片质量为0.7
                //生成canvas
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                // 创建属性节点
                var anw = document.createAttribute("width");
                anw.nodeValue = String(w);
                var anh = document.createAttribute("height");
                anh.nodeValue = String(h);
                canvas.setAttributeNode(anw);
                canvas.setAttributeNode(anh);
                ctx.drawImage(img, 0, 0, w, h);
                let base64 = canvas.toDataURL('image/' + this.suffix , quality);
                let blob = this.convertBase64UrlToBlob(base64);
                this.desImgSize = blob.size;
                if (this.desImgSize > 3*1024*1024) {
                    this.fileError = "图片大于3M，无法上传";
                    this.enableUploadButton = false;
                }
                resolve(base64);
            }
        });
    }

    private convertBase64UrlToBlob(urlData: string):Blob {
        let arr = urlData.split(',');
        let mime = arr[0].match(/:(.*?);/)[1];
        let bstr = atob(arr[1]);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    private upload = async () => {
        if (!this.resUploader) return;
        let formData = new FormData();
        let blob = this.convertBase64UrlToBlob(this.desImage);
        formData.append('image', blob, this.file.name);
        let ret = await this.resUploader.upload(formData);
        if (typeof ret === 'object') {
            let {error} = ret;
            let type = typeof error;
            let err:string;
            switch (type) {
                case 'undefined': err = 'error: undefined'; break;
                case 'string': err = error; break;
                case 'object': err = error.message; break;
                default: err = String(err); break;
            }
            this.fileError = 'error: ' + type + ' - ' + err;
            return;
        }
        this.resId = ret;
        this.isChanged = (this.resId !== this.props.id);
        this.uploaded = true;
    }

    private onSaved = (): Promise<void> => {
        let {onSaved} = this.props;
        onSaved && onSaved(this.resId);
        return;
    }

    private showOrgImage = () => {
        nav.push(<Page header="原图">
            <div className="p-3 text-center">
                <ImageControl className="h-min-4c" style={{maxWidth:'100%'}} src={this.srcImage} />
            </div>
        </Page>);
    }

    private levelDiv() {
        if (this.props.size) return;
        let arr = [{caption:'小图', size:'sm'}];
        if (this.srcImgHeight > mediumSize || this.srcImgWidth > mediumSize) {
            arr.push({caption:'中图', size:'md'});
        }
        if (this.srcImgHeight > largeSize || this.srcImgWidth > largeSize) {
            arr.push({caption:'大图', size:'lg'});
        }
        if (this.srcImgHeight > xlargeSize || this.srcImgWidth > xlargeSize) {
			arr.push({caption:'超大图', size:'xl'});
			arr.push({caption:'原图', size:'raw'});
        }
        if (arr.length < 2) return;
        return <div>{arr.map((v, index) => {
            let {caption, size} = v;
            return <label key={index} className="mr-3"><input type="radio" name="size" 
                onChange={()=>this.setSize(size as any)}
                defaultChecked={index===0} /> {caption}</label>;
        })}</div>
    }

    render() {
        let {label} = this.props;
        let right = <button
            className="btn btn-sm btn-success align-self-center mr-2"
            disabled={!this.isChanged}
            onClick={this.onSaved}>保存</button>;
        return <Page header={label || '更改图片'} right={right}>
            <div className="my-3 px-3 py-3 bg-white">
                <div>
                    <div className="mb-3">
                        <ResUploader ref={v=>this.resUploader=v} 
                            multiple={false} maxSize={2048} 
                            label="选择图片文件"
                            onFilesChange={this.onFileChange} />
                        <div className="small text-muted">支持 {this.imageTypes.join(', ')} 格式图片。</div>
                        {this.fileError && <div className="text-danger">{this.fileError}</div>}
                    </div>
                    <LMR left=
                    {
                        this.uploaded === true? 
                            <div className="text-success p-2">上传成功！</div>
                            :
                            this.file && this.desImgSize > 0 && <div className="mb-3 d-flex align-items-end">
                                <div className="mr-5">
                                    {this.levelDiv()}
                                    <div>分辨率：{this.desImgWidth} x {this.desImgHeight}
                                    &nbsp; &nbsp;
                                    文件大小：{formatSize(this.desImgSize)}
                                    </div>
                                </div>
                                <button className="btn btn-primary" 
                                    disabled={!this.enableUploadButton}
                                    onClick={this.upload}>上传</button>
                            </div>
                    }
                    right={this.desImage && 
                        <button className="btn btn-link btn-sm text-right mb-3" onClick={this.showOrgImage}>
                            原图大小: {formatSize(this.file.size)}<br/>
                            分辨率：{this.srcImgWidth} x {this.srcImgHeight}
                        </button>
                    }
                    ></LMR>
                </div>
                <div className="text-center" 
                    style={{
                        border: (this.uploaded===true? '2px solid green' : '1px dotted gray'),
                        padding: '8px'
                    }}>
                    <ImageControl className="h-min-4c" style={{maxWidth:'100%'}} src={this.desImage} />
                </div>
            </div>
        </Page>;
    }
}

interface AudioUploaderProps {
    id?: string;
    label?: string;
    onSaved?: (imageId:string) => Promise<void>;
}

@observer
export class AudioUploader extends React.Component<AudioUploaderProps> {
	private static audioTypes = ['mp3', 'wav'];

    private suffix: string;
	private resUploader: ResUploader;
	@observable private content: string;
	@observable private file: File;    
	@observable private fileSize: number;

    @observable private isChanged: boolean = false;
    @observable private resId: string;
    @observable private enableUploadButton: boolean = false;
    @observable private fileError: string;
	@observable private uploaded: boolean = false;
	@observable private uploading: boolean = false;

    constructor(props: AudioUploaderProps) {
        super(props);
        this.resId = props.id;
    }

    private onFileChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.fileError = undefined;
        this.uploaded = false;
        this.enableUploadButton = evt.target.files.length > 0;
        if (this.enableUploadButton) {
            this.file = evt.target.files[0];
            let pos = this.file.name.lastIndexOf('.');
            if (pos >= 0) this.suffix = this.file.name.substr(pos+1).toLowerCase();
            if(AudioUploader.audioTypes.indexOf(this.suffix) < 0){
                this.fileError = `音频类型必须是 ${AudioUploader.audioTypes.join(', ')} 中的一种`;
                return;
            }
            let reader = new FileReader();
            reader.readAsDataURL(this.file);
            reader.onload = async () => {
				this.content = reader.result as string;
				this.fileSize = this.content.length;
            };
        }
    }

    private convertBase64UrlToBlob(urlData: string):Blob {
        let arr = urlData.split(',');
        let mime = arr[0].match(/:(.*?);/)[1];
        let bstr = atob(arr[1]);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    private upload = async () => {
		if (!this.resUploader) return;
		this.uploading = true;
        let formData = new FormData();
        let blob = this.convertBase64UrlToBlob(this.content);
        formData.append('image', blob, this.file.name);
        let ret = await this.resUploader.upload(formData);
        if (typeof ret === 'object') {
            let {error} = ret;
            let type = typeof error;
            let err:string;
            switch (type) {
                case 'undefined': err = 'error: undefined'; break;
                case 'string': err = error; break;
                case 'object': err = error.message; break;
                default: err = String(err); break;
            }
            this.fileError = 'error: ' + type + ' - ' + err;
            return;
        }
        this.resId = ret;
        this.isChanged = (this.resId !== this.props.id);
        this.uploaded = true;
    }

    private onSaved = (): Promise<void> => {
        let {onSaved} = this.props;
        onSaved && onSaved(this.resId);
        return;
    }

    render() {
        let {label} = this.props;
        let right = <button
            className="btn btn-sm btn-success align-self-center mr-2"
            disabled={!this.isChanged}
            onClick={this.onSaved}>保存</button>;
        return <Page header={label || '更改文件'} right={right}>
            <div className="my-3 px-3 py-3 bg-white">
                <div>
                    <div className="mb-3">
                        <ResUploader ref={v=>this.resUploader=v} 
                            multiple={false} maxSize={2048} 
                            label="选择音频文件"
                            onFilesChange={this.onFileChange} />
                        <div className="small text-muted">支持 {AudioUploader.audioTypes.join(', ')} 格式。</div>
                        {this.fileError && <div className="text-danger">{this.fileError}</div>}
                    </div>
                </div>
            </div>
			<LMR left=
                    {
                        this.uploaded === true? 
                            <div className="text-success p-2">上传成功！</div>
							:
							this.uploading === true?
								<div className="m-3"><Loading /></div>
								:
								this.file && this.content && <div className="m-3">
									<div className="mb-3">
										文件大小：{formatSize(this.fileSize)}
									</div>
									<button className="btn btn-primary" 
										disabled={!this.enableUploadButton}
										onClick={this.upload}>上传</button>
								</div>
					}
			/>
        </Page>;
    }
}
