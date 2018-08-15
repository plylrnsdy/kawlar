import * as request from 'request';
import * as fs from 'fs';

type RequestArgs = string | request.Options;

const defaultOption = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
    },
    // 启用 Cookie
    // jar: true,
};

export default class Http {

    private defaultRequest: request.RequestAPI<request.Request, request.CoreOptions, request.UriOptions | request.UrlOptions>

    constructor(option: request.CoreOptions = {}) {
        Object.assign(option, defaultOption);
        this.defaultRequest = request.defaults(defaultOption);
    }

    /**
     * 根据请求参数获得响应
     * @param {RequestArgs} arg 网址 url = arg: string 或 请求选项对象 option = arg: Options
     */
    request(arg: RequestArgs) {
        let option = typeof arg === 'string' ? { url: arg } : arg;

        return new Promise<request.RequestResponse>((resolve, reject) =>
            this.defaultRequest(option, (err, response) =>
                err ? reject(err) : resolve(response))
        );
    }

    /**
     * 下载二进制文件
     * @param url 二进制文件的 URL
     * @param path 本地保存路径
     */
    download(url: string, path: string) {
        return new Promise<void>((resolve, reject) =>
            this.defaultRequest(url)
                .on('error', reject)
                .pipe(fs.createWriteStream(path))
                .on('finish', resolve)
                .on('error', reject)
        );
    }
}
