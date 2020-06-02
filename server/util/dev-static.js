const axios = require('axios');
const memoryFs = require('memory-fs');
const webpack = require('webpack');
const ReactDomServer = require('react-dom/server');
const path = require('path');
const proxy = require('http-proxy-middleware')

const serverConfig = require('../../build/webpack.config.server')

const mfs = new memoryFs(); //从内存中读写文件

const getTemplate = () => {
    return new Promise((resolve, reject) => {
        axios.get('http://localhost:8888/public/index.html').then(res=> {
            resolve(res.data)
        }).catch(reject)
    })
}

const Module = module.constructor;

const serverCompiler = webpack(serverConfig);
serverCompiler.outputFileSystem = mfs

let serverBundle;

serverCompiler.watch({}, (err, status) => {
    if(err) throw err;

    status = status.toJson()
    console.log(status.errors)
    console.log(status.warnings)
    status.errors.forEach(err => console.log(err));
    status.warnings.forEach(warn => console.log(warn))

    const bundlePath = path.join(serverConfig.output.path, serverConfig.output.filename)

    const bundle = mfs.readFileSync(bundlePath, 'utf-8');
    const m = new Module()
    m._compile(bundle, 'server-entry.js');//动态编译一个文件，第二个参数是文件名
    serverBundle = m.exports.default;
})

module.exports = function(app) {
    app.use('/public', proxy({
        target: 'http://localhost:8888'
    }))

    app.get('*', function(req, res){
        getTemplate().then(template => {
            const content = ReactDomServer.renderToString(serverBundle)
            res.send(template.replace('<!-- app -->', content));
        })
    })
}