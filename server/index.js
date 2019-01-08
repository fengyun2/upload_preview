const path = require('path')
const Router = require('koa-router')
const Koa = require('koa')
const cors = require('koa-cors')
const multer = require('koa-multer')
const send = require('koa-send')

const app = new Koa()
const router = new Router()
//允许跨域访问
app.use(cors())

//文件上传
//配置
var storage = multer.diskStorage({
  //文件保存路径
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '/uploads/'))
  },
  //修改文件名称
  filename: function(req, file, cb) {
    var fileFormat = file.originalname.split('.') //以点分割成数组，数组的最后一项就是后缀名
    cb(null, Date.now() + '.' + fileFormat[fileFormat.length - 1])
  }
})
//加载配置
var upload = multer({ storage: storage })

router.post('/upload', upload.array('file'), async (ctx, next) => {
  // console.log('req: ', ctx.req.files)
  const { files } = ctx.req
  let fileNames = []
  if (Array.isArray(files) && files.length > 0) {
    fileNames = files.map(file => file.filename)
  }
  console.log('fileNames: ', fileNames)

  ctx.body = {
    fileNames
    // filename: ctx.req.file.filename //返回文件名
  }
  // next()
})

router.get('/download', async ctx => {
  const fileName = ctx.query.fileName
  console.log('fileName: ', ctx.query.fileName)

  // Set Content-Disposition to "attachment" to signal the client to prompt for download.
  // Optionally specify the filename of the download.
  // 设置实体头（表示消息体的附加信息的头字段）,提示浏览器以文件下载的方式打开
  // 也可以直接设置 ctx.set("Content-disposition", "attachment; filename=" + fileName);
  // ctx.attachment(fileName)
  await send(ctx, fileName, { root: __dirname + '/uploads' })
})

app.use(router.routes()).use(router.allowedMethods())
app.listen(8000, function() {
  console.log('Server listening on:', 8000)
})
