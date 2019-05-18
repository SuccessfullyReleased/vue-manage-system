# vue-manage-system

1. 框架结构
    - [Header](src/views/common/Header.vue)
        1. 与侧边栏的联动，控制```Sidebar```的缩放
        2. 加载用户头像
        3. 执行用户命令
            - 用户设置(点击头像也能进入)
            - 登出账户
    
    - [Sidebar](src/views/common/Sidebar.vue)
        1. 显示功能列表
        2. 与标签栏的联动，增加或删除标签
        3. 检查用户权限，管理员拥有更多的功能
    
    - [Tags](src/views/common/Tags.vue)
        1. 显示标签
        2. 标签选项功能
            - 关闭其他
            - 关闭所有
    
    - [Home](src/views/common/Home.vue)
        1. 组合以上三个框架组件
        2. 缓存已打开的界面
    
2. 组件
    - [bus.js](src/components/bus.js) (实现组件间通信)
        1. 发送消息
            ```
            bus.$emit(key, value);
            ```
        2. 处理消息
            ```
            bus.$on(key, value => {
                //...
            });
            ```
    - [ajax.js](src/components/ajax/index.js) (封装```axios```实现网络交互)
        - 配置说明：
        因为需要在各个页面或组件中使用```ajax```，所以将其封装成```vue```插件
            1. 导入包并挂载到```vue```实例上
                ```
                import ajax from './components/ajax'
                Vue.use(ajax);
                ```
            2. 在[main.js](src/main.js)中实例化```vue```对象，并保存
                ```
                let VueInstance = new Vue({
                    router,
                    store,
                    render: h => h(App)
                }).$mount('#app');
                ```
            3. 将```vue```对象保存进```ajax```组件中
                ```
                VueInstance.$ajax.setVueInstance(VueInstance);
                ```
        - 使用说明：
            1. 参数说明 [option.d.ts](src/components/ajax/types/index.d.ts)
                - ```method```：   
                ```http```请求类型 (默认为```POST```)
                - ```url```：   
                请求地址 (必需参数，没有则会寻找```root```和```path```参数)
                - ```root```：   
                自定义主机地址及端口 (默认为本项目配置的后台地址端口)
                - ```path```：   
                自定义请求地址 (默认为404)
                - ```params```：   
                ```JS```对象，属性为请求的参数 (默认为```null```)
                - ```contentType```：   
                设置参数的数据类型```json```或```form``` (默认为```json```)
                - ```success```：   
                请求成功时执行的回调函数 (默认不执行)
                - ```error```：   
                请求失败时执行的回调函数 (默认不执行)
                - ```loadingOptions```：   
                在进行网络通信时显示```loading```过场动画，通信结束后关闭 (默认开启)
                - ```dev```：   
                开发环境与生产环境切换 (默认开发环境:```true```)
            2. 调用说明
                ```
                this.$ajax.request(options);//this为vue对象
                ```
3. 页面
    - [login](src/views/login.vue)
        1. 验证用户名与密码
        2. 实现自动登录
    - [welcome](src/views/welcome.vue)
        1. 显示用户名、用户头像及用户级别
        2. 简单罗列本系统的功能
    - [user_manage]() (必须拥有超级管理员权限，否则无法进入该页面)
        1. 表格展示所有用户
        2. ```table```与```pagination```组件联动，实现表格分页
        3. 可以通过关键字搜索用户的信息
        4. 可以添加、删除用户、修改用户信息   
        (表格不会展示超级管理员的用户信息，想要修改需要通过超级管理员账户的用户设置)
        
4. 业务逻辑
    - 用户验证：
        - [login](src/views/login.vue)  
        检查浏览器本地缓存  
            1. 如果有```uid```和```username```
                - 页面重定向到[welcome](src/views/welcome.vue)
            2. 如果没有
                - 进入正常的登录流程，知道```username```和```password```验证成功
                - 将获取到的```uid```和```username```存入浏览器缓存
                - 页面重定向到[welcome](src/views/welcome.vue)
        - [main.js](src/main.js)  
        检查浏览器本地缓存
            - 如果没有```uid```和```username```
                页面重定向到[login](src/views/login.vue)

    - 权限验证：
        - [main.js](src/main.js)  
        在进入一个页面之前验证用户等级
            1. 如验证通过，进入页面
            2. 验证不通过，进入[403](src/views/403.vue)
- 扩展：
    - angular
    - redis
    - nginx
    - 头像悬停样式
    - 表格分页的样式
    - 表格没有本人信息