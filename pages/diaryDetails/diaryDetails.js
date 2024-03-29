const app = getApp();
const host = app.globalData.host;
// const DEBOUNCE_DELAY = 5000;

Page({
  data: {
    id: '',
    title: '',
    content: '',
    updateTime: '',
    issue: false,
  },

  // 防抖函数
  // debounce(func, delay) {
  //   clearTimeout(this.debounceTimer);
  //   this.debounceTimer = setTimeout(() => func(), delay);
  // },

  // 处理标题输入
  titleInput(e) {
    const title = e.detail.value;
    this.setData({
      title
    });
    // this.debounce(this.sendDataToBackend, DEBOUNCE_DELAY);
  },

  // 处理编辑器输入
  editorInput(event) {
    const content = event.detail.html;
    this.setData({
      content
    });
    // this.debounce(this.sendDataToBackend, DEBOUNCE_DELAY);
  },

  // 发送数据到后端
  sendDataToBackend() {
    const now = new Date();
    const formattedTime = now.toLocaleString('zh-CN', {
      hour12: false
    });

    const {
      id,
      title,
      content,
      issue
    } = this.data;
    const storedUserInfo = wx.getStorageSync('personalDetails');
    const phoneNumber = storedUserInfo?.phoneNumber;

    const dataToSend = {
      id,
      phoneNumber,
      title,
      content,
      updateTime: formattedTime,
      issue
    };

    wx.request({
      url: host + '/note/save',
      method: 'POST',
      data: dataToSend,
      success: (res) => {
        console.log(res.data)
        const newId = res.data?.insertedId;
        // 更新id
        this.setData({
          id: newId
        });
      },
      fail: (error) => {
        console.error(error);
      },
    });
  },

  // 页面加载时
  onLoad(options) {
    // 获取传递的id，如果是'undefined'则置空
    const id = options.id !== 'undefined' ? options.id : '';
    this.setData({
      id
    });
    if (id) {
      // 如果有id，获取笔记详情
      this.fetchNoteDetails(id);
    }
  },
  // 页面隐藏时触发
  onHide() {
    this.sendDataToBackend();
  },

  // 页面卸载时触发
  onUnload() {
    this.sendDataToBackend();
  },
  // 获取笔记详情
  fetchNoteDetails(id) {
    const url = `${host}/user/notes/${id}`;

    wx.request({
      url,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const {
            title,
            content
          } = res.data;
          // 更新页面数据
          this.setData({
            title,
            content
          });

          // 设置编辑器内容
          const editorQuery = wx.createSelectorQuery();
          editorQuery
            .select('#editor')
            .context((res) => {
              const editor = res.context;
              if (editor) {
                editor.setContents({
                  html: content
                });
              } else {
                console.error('编辑器组件未找到');
              }
            })
            .exec();
        } else {
          console.error('获取笔记详情失败。状态码:', res.statusCode);
        }
      },
      fail: (error) => {
        console.error('获取笔记详情时出错:', error);
      },
    });
  },
  // 发布
  publishContent() {
    const personalDetails = wx.getStorageSync("personalDetails") || {}; // 如果不存在则初始化为空对象
    const phoneNumber = personalDetails.phoneNumber || ''; // 从对象中获取 phoneNumber，如果不存在则为空字符串
    const { title, content } = this.data; // 从页面数据中获取 title 和 content
  
    if (!title || !content) {
      console.error('发布内容时缺少必要的信息');
      return;
    }
  
    wx.request({
      url: host + '/note/publishContent',
      method: 'POST',
      data: {
        phoneNumber,
        title,
        content
      },
      success: (res) => {
        console.log(res.data);
        // 处理成功的逻辑，根据需要修改
      },
      fail: (error) => {
        console.error(error);
        // 处理失败的逻辑，根据需要修改
      },
    });
  }



})  