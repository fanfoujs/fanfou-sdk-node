class Photo {
	url: string;
	imageurl: string;
	thumburl: string;
	largeurl: string;
	originurl?: string;
	type?: string;
	isGif?: boolean;

	constructor(photo: any) {
		this.url = photo.url;
		this.imageurl = photo.imageurl;
		this.thumburl = photo.thumburl;
		this.largeurl = photo.largeurl;
		this.originurl = photo.largeurl.replace(/@.+\..+$/g, '');
		// @ts-expect-error
		this.type = /^.+\.(?<type>.+)$/
			.exec(this.originurl ?? '')
			// eslint-disable-next-line @typescript-eslint/dot-notation
			.groups?.['type'].toLowerCase();
		this.isGif = this.type === 'gif';
	}
}

export default Photo;
