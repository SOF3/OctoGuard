declare function linkify(selector: string, url: string)

declare function nop(): void

declare function ajax<Q extends ReqSuper, S extends ResSuper>(path: string, args?: Q, success?: JQuery.Ajax.SuccessCallback<any> & ((res: S) => void)): void

declare function login()
