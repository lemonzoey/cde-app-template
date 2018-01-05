'use babel'

const etch = require('etch')
import path from 'path'

export default class selectListView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div')
    this.element.classList.add('selet-list-view')
    const model = document.createElement('div')
    const modelTitle = document.createElement('h3')
    modelTitle.innerHTML = '文件下载成功，正在解压，请您耐心等待'
    modelTitle.style.textAlign = 'center'
    modelTitle.style.marginBottom = '30px'
    modelTitle.style.marginTop = '-10px'
    const img = document.createElement('img')
    let imgPath = path.join(__dirname,'../images/load.gif')
    img.src = imgPath
    img.classList.add("img")
    model.classList.add('model')
    this.element.appendChild(model)

    model.appendChild(modelTitle)
    model.appendChild(img)
  }
  // Returns an object that can be retrieved when package is activated
  serialize() {

  }
  // Tear down any state and detach
  destroy() {
    this.element.remove()
  }

  getElement() {
    return this.element
  }
  initCode(e) {
    console.log(e)
    const displayText = `<p>this is a atom packages</p>`
    // <iframe id="iframe1" src="Default.aspx" height="200" width="100%"></iframe>
    this.element.children[0].innerHTML = displayText
  }
}
