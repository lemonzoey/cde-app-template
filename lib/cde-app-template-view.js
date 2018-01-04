'use babel';

export default class CdeAppTemplateView {

  constructor(serializedState) {
    this.element = document.createElement('div')
    this.element.classList.add('cde-app-template')
    const message = document.createElement('div')

    message.classList.add('message')
    this.element.appendChild(message)
    let iframe = document.createElement("iframe")
    iframe.id = 'iframe'
    iframe.name='iframe1'
    //给iframe加一个自适应的滚动条
    iframe.scrolling="auto"
    //这里套了一个页面
    iframe.src = "http://cde.lenovo.cn/#/index"
    iframe.style.width = '780px'
    iframe.style.height = '580px'
    // iframe.style.overflow = 'auto'
    // iframe.style.position = 'relative'
    message.appendChild(iframe)

    //这里开始是外部元素
    const myinput = document.createElement('input')
    myinput.id = 'testinp'
    myinput.style.width = '250px'
    myinput.style.height = '30px'
    myinput.placeholder = '请选择项目地址'
    const mybutton = document.createElement('button')
    mybutton.id = 'testbtn'
    mybutton.style.width = '250px'
    mybutton.style.height = '30px'
    // mybutton.style.position = 'absolute'
    mybutton.innerText = '按钮'
    // message.appendChild(mybutton)
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove()
  }

  getElement() {
    return this.element
  }
  initCode(e) {
    console.log(e)
    const displayText = `<p>this is a test packages project</p>`
    // <iframe id="iframe1" src="Default.aspx" height="200" width="100%"></iframe>
    this.element.children[0].innerHTML = displayText
  }

}
