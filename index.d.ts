export = Fanfou;
export as namespace Fanfou;

declare class Fanfou {
    consumerKey: string;
    consumerSecret: string;
    oauthToken: string;
    oauthTokenSecret: string;
    username: string;
    password: string;
    protocol: string;
    apiDomain: string;
    oauthDomain: string;
    hooks: any;
    constructor(opt?: Fanfou.FanfouOptions)
    getRequestToken(): any;
    getAccessToken(token :object): any;
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
        hooks?: {
            baseString?: (str: string) => any;
        }
    }
}
