export = Fanfou;
export as namespace Fanfou;

declare class Fanfou {
    constructor(opt?: Fanfou.FanfouOptions)
    xauth(): any;
    get(uri: string, params: object): any;
    post(uri: string, params: object): any;
    upload(uri: string, params: object): any;
}

declare namespace Fanfou {
    export interface FanfouOptions {
        consumerKey: string,
        consumerSecret: string,
        oauthToken?: string,
        oauthTokenSecret?: string,
        username?: string,
        password?: string,
        protocol?: string,
        fakeHttps?: boolean,
        apiDomain?: string,
        oauthDomain?: string,
        hooks?: object            
    }
}
