'use babel';

import CdeAppTemplateView from './cde-app-template-view'
import selectListView from './select-list-view'
import {CompositeDisposable} from 'atom'
import request from 'request'
import fs from 'fs'
import tar from 'tar'
import unzip from 'unzip'
// import archiver from 'archiver'
import url from 'url'
import rootPath from 'path'

export default {

  cdeAppTemplateView: null,
  selectListView: null,
  // modalPanel: null,
  modalPanel2: null,
  subscriptions: null,

  activate(state) {

    this.cdeAppTemplateView = new CdeAppTemplateView(state.cdeAppTemplateViewState)
    this.modalPanel = atom.workspace.addModalPanel({item: this.cdeAppTemplateView.getElement(), visible: false})
    this.selectListView = new selectListView(state.selectListView)
    this.modalPanel2 = atom.workspace.addModalPanel({item: this.selectListView.getElement(), visible: false})
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', 'init:download', (add) => this.initCode(add)))
    this.subscriptions.add(atom.commands.add('atom-workspace', 'init:showPic', (path) => this.showPic(path)))
    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'cde-app-template:open': () => this.open()
    }))
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'init:showModal': () => this.showModal()
    }))

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'init:addEvent': () => this.addEvent()
    }))
  },

  deactivate() {
    this.modalPanel.destroy()
    this.modalPanel2.destroy()
    this.subscriptions.dispose()
    this.InitReactCodeView.destroy()
  },

  serialize() {
    return {cdeAppTemplateViewState: this.cdeAppTemplateView.serialize()}
  },

  addEvent() {
    //内嵌页面初始化后才运行下面的代码
    iframe.onload = function() {
      //获取创建btn按钮
      let createBtn = document.getElementById('iframe').contentWindow.document.getElementsByTagName("button")[0]
      //获取取消btn按钮
      let cancelBtn = document.getElementById('iframe').contentWindow.document.getElementsByTagName("button")[1]
      //获取input按钮
      let inpaddress = document.getElementById('iframe').contentWindow.document.getElementsByClassName("ant-input-lg")[0]
      //获取iframe中的body，改变他的背景颜色
      let body = document.getElementById('iframe').contentWindow.document.getElementsByTagName("body")[0]
      body.style.background = '#282c34'
      //获取模态框
      let modal = document.getElementsByClassName('modal')[0]
      //获取主弹框页面
      let mymodal1 = modal.children[5]
      //获取下载loading页面
      let mymodal2 = modal.children[6]
      //这里改了下弹框的样式，可以在styles里改，也可以在这里，放styles加载顺序不同会有点问题，故这个插件里放js里了
      let style = document.createElement("style")
      document.head.appendChild(style)
      // style.innerText = `atom-panel.modal:before {
      //     content:'';
      //     position: absolute;
      //     width: 500px;
      //     height:310px;
      //     top: 50%;
      //     left: 50%;
      //     transform: translate(-50%,-50%);
      //     z-index: 0;
      //     border-radius: 6px;
      //     box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.4);
      // };
      // `
      //点击取消按钮，让弹框页面消失
      cancelBtn.onclick = function() {
       atom.commands.dispatch(atom.views.getView(atom.workspace), 'cde-app-template:open')
      }
      //点击弹框之外的地方，让弹框页面消失
      // let after = window.getComputedStyle(mymodal, ":after");
      mymodal1.onclick = function(){
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'cde-app-template:open')
      }
      //点击下载loading页面其他的地方，让弹窗消失
      mymodal2.onclick = function(){
        // atom.confirm({message: '关闭提醒', detailedMessage: '请耐心等待，项目下载后会自动打开'})
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'init:showModal')
      }
      //input给用户一个初始的固定的下载地址，用户可以修改

      //线上地址
      // let fixdaddress = rootPath.join(__dirname, '../../../../MADP/RNApp')
      //线下地址
      let fixdaddress = rootPath.join(__dirname, '../../MADP/RNApp')
      inpaddress.value = fixdaddress
      inpaddress.style.color = 'white'

      inpaddress.focus()
      //input中内容被清空后，让默认的地址再次赋值给input
      inpaddress.onblur = function() {
        if (this.value == '') {
          this.value = fixdaddress
        }
      // }
      //封装函数，让newProject被选中，方便用户直接修改项目存放名称
      function setSelectionRange(input, selectionStart, selectionEnd) {
        if (input.setSelectionRange) {
          input.focus()
          input.setSelectionRange(selectionStart, selectionEnd)
        } else if (input.createTextRange) {
          var range = input.createTextRange()
          range.collapse(true)
          range.moveEnd('character', selectionEnd)
          range.moveStart('character', selectionStart)
          range.select()
        }
      }
      let val = inpaddress.value
      setSelectionRange(inpaddress, val.length - 5, val.length)

      // let Radios = document.getElementById('iframe').contentWindow.document.getElementsByClassName('ant-radio-input')
      // console.log(Radios)
      // for(r in Radios){
      //   Radios[r].onclick = function(){
      //     if(this.checked){
      //       alert('123')
      //      }
      //   }
      //
      // }
      //点击按钮，触发下载解压等事件
      createBtn.onclick = function() {

        let add = inpaddress.value
        //点击完创建以后，让弹窗隐藏
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'cde-app-template:open')
        //调用loading模态框，让用户在代码库下载期间没法做其他操作
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'init:showModal')
        //下载的逻辑
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'init:download', add)

        //点击创建以后，恢复默认下载地址
        inpaddress.value = fixdaddress
        inpaddress.focus()
      }
    }
  }
},

  open() {
    console.log('CdeAppTemplateView was open!')
    if (this.modalPanel.isVisible()) {
      this.modalPanel.hide()
    } else {
      this.modalPanel.show()
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'init:addEvent')
    }

  },
  // 用户创建成功后，调用这个loading遮罩
  showModal() {
    if (this.modalPanel2.isVisible()) {
      this.modalPanel2.hide()
    } else {
      this.modalPanel2.show()
    }
  },

  initCode(add) {
    //下载文件的默认存放地址
    let projectAdd = add.detail
    // let urlstr = 'http://madp.lenovo.cn/uat/group1/downfile?file=Z3JvdXBOYW1lPWdyb3VwMSZmaWxlTmFtZT1NMDAvMDAvMEIvQ25oeUtWb3h6MnFBY2lxSUFDbnUyYm50ZGw0NjQ1LnppcCZmaWxlVHlwZT0x&groupName=group1&fileName=M00/00/0B/CnhyKVoxz2qAciqIACnu2bntdl4645.zip';
    //获取div
    let urldiv = document.getElementById('iframe').contentWindow.document.getElementsByClassName('ant-card-body')
    // console.log(urldiv)
    //将htmlobj变成数组e
    let urldivObj = Array.from(urldiv)
    let urlstr = undefined
    let filename = undefined
    let fileName = undefined
    urldivObj.forEach(item => {
      let checkedDiv = item.children[0].children[0]
      let isCheck = checkedDiv.classList.contains('ant-radio-wrapper-checked')
      //如果有被选中的表示，则吧div的title取到
      if (isCheck) {
        urlstr = item.children[0].children[2].title
        filename = item.children[0].children[1].children[0].alt

      }
    })
    // filename = 'abc.zip'

    //如果没有选择，让用户先选择一个项目，再创建
    if (urlstr == undefined) {
      //若是点完创建，发现用户还未选择项目，则让弹窗继续显示
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'cde-app-template:open')
      // atom.commands.dispatch(atom.views.getView(atom.workspace), 'init:showModal')
      atom.confirm({message: '未选择项目', detailedMessage: '您还未选择需要下载的项目，请选择一个项目后再点击创建按钮'})
      return false
    }

    //如果连接不对，给用户提示
    if (!urlstr.endsWith('.zip')) {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'cde-app-template:open')
      atom.confirm({message: '链接有误', detailedMessage: '您当前选择的下载链接不正确，请联系管理员'})
      return false
    }
    //这个是处理测试的url http://nginx.org/download/nginx-0.8.27.zip

    //filename是压缩文件，fileName是文件夹名称
    if (filename.endsWith('.zip')) {
      fileName = filename.replace('.zip', '')
    }
    const filepath = rootPath.join(__dirname, filename)

    //文件被atom打开的地址
    new Promise((resolve, reject) => {
      const stream = request(urlstr)
      .on('error', (error) => {
        setTimeout(()=>{
          console.log("获取文件失败" + error)
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'init:showModal')
          atom.confirm({message: '文件有问题', detailedMessage: '您当前选择的文件有疑问，请联系管理员'})
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'cde-app-template:open')
        },2000)

        reject(error)

      }).pipe(fs.createWriteStream(filepath))

      stream.on('close', () => {
        console.log(filename.concat('文件下载成功'))
        resolve(filename)
      })

      stream.on('error', (error) => {
        // fs.unlinkSync(filepath)
        //压缩包有问题的，在这里让用户可以重新选择其他下载的包
        setTimeout(()=>{
          console.log('写入文件失败', filepath)
          //调用loading模态框，让用户在代码库下载期间没法做其他操作
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'init:showModal')
          atom.confirm({message: '文件有问题', detailedMessage: '您当前选择的文件有疑问，请联系管理员'})
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'cde-app-template:open')
        },2000)

        reject(error)
      })

    }).then(() => {
      //解压文件
      fs.createReadStream(filepath).pipe(unzip.Extract({
        //文件解压后存放的地址
        path: projectAdd
      }).on('close', () => {
        let lastPath = rootPath.join(projectAdd, fileName)
        //如果loading已经被关闭就不在显示
      //，如果loading一直显示，在最后会被关闭
        if(this.modalPanel2.visible == true){
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'init:showModal')
        }
        atom.open({'pathsToOpen': lastPath, 'newWindow': true})
        //压缩文件被解压，打开后就删除掉，留下被解压的文件即可
        let deleteFile = rootPath.join(__dirname, filename)
        fs.unlink(deleteFile)
      })).catch(err =>{
        reject(err)
      })
    }).catch(err => {
      alert('发生错误啦，请稍后重试');
    })
  },

  showPic(obj) {
    alert("this is a test function")
  }

};
