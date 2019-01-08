import React, { PureComponent } from 'react'
import axios from 'axios'
import styles from './index.module.scss'

class Upload extends PureComponent {
  state = {
    files: [],
    uploadHistory: [],
    multiple: true,
    url: 'http://localhost:8000/upload',
    previewUrl: 'http://localhost:8000/download',
    lookShow: false,
    previewFile: null
  }
  handleChange = e => {
    e.preventDefault()
    const target = e.target
    let files = target.files
    const count = this.state.multiple ? files.length : 1
    for (let i = 0; i < count; i++) {
      files[i].url = URL.createObjectURL(files[i])
    }
    // 转为真正的数组
    files = [...files]
    files = files.filter(file => {
      return /image/.test(file.type)
    })
    this.setState({ files: this.state.files.concat(files) })
  }
  handleDragHover = e => {
    e.stopPropagation()
    e.preventDefault()
  }
  handleDrop = e => {
    this.handleDragHover(e)
    let files = e.target.files || e.dataTransfer.files
    const count = this.state.multiple ? files.length : 1

    for (let i = 0; i < count; i++) {
      files[i].url = URL.createObjectURL(files[i])
    }
    files = [...files]
    files = files.filter(file => {
      return /image/.test(file.type)
    })
    this.setState({ files: this.state.files.concat(files) })
  }
  handleUpload = e => {
    e.preventDefault()
    const params = new FormData()
    for (const item of this.state.files) {
      params.append('file', item)
    }
    let config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    } //添加请求头
    axios
      .post(this.state.url, params, config)
      .then(response => {
        console.log('上传成功', response.data)
        this.setState({
          uploadHistory: response.data.fileNames || []
        })
      })
      .catch(err => {
        console.error('文件上传失败')
      })
  }
  // 获取后端返回的文件流
  getPreviewFiles = e => {
    e.preventDefault()
    if (this.state.uploadHistory.length < 1) {
      return false
    }
    const params = {
      fileName: this.state.uploadHistory[0]
    }
    // responseType: 'stream' | 'blob'
    axios({ method: 'get', url: this.state.previewUrl, params, responseType: 'blob' })
      .then(response => {
        console.log('获取文件流: ', response.data)
        var blob = response.data
        const img = document.createElement('img')
        img.onload = function(e) {
          window.URL.revokeObjectURL(blob)
        }
        img.src = window.URL.createObjectURL(blob)
        this.setState({
          previewFile: window.URL.createObjectURL(blob)
        })
      })
      .catch(err => {
        console.error(err)
      })
  }
  renderImages() {
    const { files } = this.state
    if (files.length) {
      return files.map((item, index) => (
        <div className={styles['selectImagesDiv']} key={index}>
          <div>{item.name}</div>
          <img src={item.url} className={styles['preview']} alt="" />
        </div>
      ))
    }
    return null
  }
  render() {
    return (
      <form onSubmit={this.handleUpload}>
        <div className={styles['uploadContainer']}>
          <div className={styles['uploadBox']}>
            <input
              type="file"
              onChange={this.handleChange}
              accept="image/*"
              name="fileSelect"
              multiple={this.state.multiple}
            />
            <span
              ref="dragBox"
              onDragOver={this.handleDragHover}
              onDragLeave={this.handleDragHover}
              onDrop={this.handleDrop}
              className={styles['dragBox']}
            >
              或将图片拖到此处
            </span>
          </div>
          <div className={this.state.files.length > 0 ? styles['showImage'] : styles['none']}>
            {this.renderImages()}
          </div>
          <div className={this.state.files.length > 0 ? styles['uploadBtnBox'] : styles['none']}>
            <button type="button" onClick={this.handleUpload}>
              确认上传图片
            </button>
          </div>
          {/* <div>{this.state.uploadHistory.length > 0 ? this.renderUploadInfo() : false}</div> */}
          {this.state.uploadHistory.length > 0 && (
            <div>
              <button onClick={this.getPreviewFiles}>获取下载文件的文件流</button>
              <div className={styles['preview']} >
              <img src={this.state.previewFile} alt=""/>
              </div>
            </div>
          )}
        </div>
      </form>
    )
  }
}

export default Upload
