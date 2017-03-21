/**
 * Created by lenovo on 2017/3/21.
 */

const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();

//function timeout() {
//    return
//}

router.get('/', async function () {
    console.log('outer 1');
    await new Promise((resolve) => {
        setTimeout(function() {
            console.log('wait for me');
            resolve();
        }, 2000);
    });
    console.log('outer 2');
});

app.use(async function(ctx, next) {
    console.log('1');
    await next();
    console.log('2');
});

app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(8000);


