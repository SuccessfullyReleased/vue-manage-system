# vue-manage-system

```vue-manage-system``` 是基于 ```Vue``` 的轻量级前台管理系统，适用于中小型项目的管理后台，支持页面元素级别的权限控制，系统具有最基本的用户管理、用户组管理、角色管理、权限管理等通用性功能。

[本项目：https://github.com/SuccessfullyReleased/vue-manage-system](https://github.com/SuccessfullyReleased/vue-manage-system)


[后台项目：https://github.com/SuccessfullyReleased/spring-boot-manage-system](https://github.com/SuccessfullyReleased/spring-boot-manage-system)

## 技术选型

技术 | 介绍 | 版本 |  官网（中文）
----|------|----|----
vue | Javascript渐进式框架 | 2.6.10 |  [https://cn.vuejs.org/](https://cn.vuejs.org/)
vue-router | Vue官方路由管理器 | 3.0.3 |  [https://router.vuejs.org/zh/](https://router.vuejs.org/zh/)
vuex | Vue官方状态管理模式 | 3.0.1 |  [https://vuex.vuejs.org/zh/](https://vuex.vuejs.org/zh/)
element-ui| 基于 Vue 2.0 的桌面端组件库 | 2.9.1 |  [https://element.eleme.cn/#/zh-CN](https://element.eleme.cn/#/zh-CN)
vue-cookies | 简单的处理浏览器cookie的vue插件 | 1.5.13 |  [https://www.npmjs.com/package/vue-cookies](https://www.npmjs.com/package/vue-cookies)
axios | 基于 promise 的 HTTP 库 | 0.18.0 |  [https://www.kancloud.cn/yunye/axios/234845](https://www.kancloud.cn/yunye/axios/234845)
lodash | 高性能的 JavaScript 实用工具库 | 4.17.11 |  [https://www.lodashjs.com/](https://www.lodashjs.com/)
less | CSS 预处理语言 | 3.0.4 |  [http://lesscss.cn/](http://lesscss.cn/)


## 框架结构

- [Header](src/views/common/Header.vue) （头部）
    1. 与侧边栏的联动，控制 ```Sidebar``` 的缩放
    2. 加载用户头像
    3. 执行用户命令
        - 用户设置
        - 登出账户
    
- [Sidebar](src/views/common/Sidebar.vue) （侧边栏）
    1. 显示功能列表
    2. 与标签栏的联动，增加或删除标签
    3. 检查用户权限，管理员拥有更多的功能
    
- [Tags](src/views/common/Tags.vue) （标签）
    1. 显示标签
    2. 标签选项功能
        - 关闭其他
        - 关闭所有
    
- [Home](src/views/common/Home.vue) （主体）
    1. 组合以上三个框架组件
    2. 缓存已打开的界面
    
## 组件

- [bus.js](src/components/bus.js) （实现组件间通信）
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
- [ajax.js](src/components/ajax/index.js) （封装 ```axios``` 实现网络交互）
    - 配置说明：
    因为需要在各个页面或组件中使用 ```ajax``` ，所以将其封装成 ```vue``` 插件
        1. 导入包并挂载到 ```vue``` 实例上
            ```
            import ajax from './components/ajax'
            Vue.use(ajax);
            ```
        2. 在 [main.js](src/main.js) 中实例化 ```vue``` 对象，并保存
            ```
            let VueInstance = new Vue({
                router,
                store,
                render: h => h(App)
            }).$mount('#app');
            ```
        3. 将 ```vue``` 对象保存进 ```ajax``` 组件中
            ```
            VueInstance.$ajax.setVueInstance(VueInstance);
            ```
    - 使用说明：
        1. 参数说明 [option.d.ts](src/components/ajax/types/index.d.ts)
            - ```method``` ：   
            ```http``` 请求类型 （默认为 ```POST``` ）
            - ```url``` ：   
            请求地址 （必需参数，没有则会寻找 ```root``` 和 ```path``` 参数）
            - ```root``` ：   
            自定义主机地址及端口 （默认为本项目配置的后台地址端口）
            - ```path``` ：   
            自定义请求地址 （默认为404）
            - ```params``` ：   
            ```JS```对象，将自动转化为 ```url``` 的参数 （默认为 ```null``` ）
            - ```data``` ：   
            ```JS```对象，不能用于 ```GET``` ，请求主体的数据 （默认为 ```null``` ）
            - ```async``` ：   
            设置本次请求是否异步加载 （默认为 ```true``` ）
            - ```auth``` ：   
            设置本次请求是否加上请求头 ```authorization``` ，属性值为 ```cookie``` 中的 ```token``` （默认为 ```true``` ）
            - ```success``` ：   
            请求成功时执行的回调函数 （默认不执行）
            - ```error``` ：   
            请求失败时执行的回调函数 （默认不执行）
            - ```loadingOptions``` ：   
            在进行网络通信时显示 ```loading``` 过场动画，通信结束后关闭 （默认开启）
            - ```dev``` ：   
            开发环境与生产环境切换 （默认生产环境: ```false``` ）
        2. 调用说明
            ```
            this.$ajax.request(options);//this为vue对象
            ```
## 页面

- [login](src/views/login.vue)
    1. 验证用户名与密码
    2. 实现自动登录
- [register](src/views/register.vue)
    1. 注册用户
- [welcome](src/views/welcome.vue)
    1. 显示用户名、用户头像及用户级别
    2. 简单罗列本系统的功能
- [user_manage](src/views/user_manage.vue) （进入该页面需要验证权限）
    1. 实现用户基本的 ```CRUD``` 操作
    2. 实现 用户+用户组 和 用户+角色 的 ```CRUD``` 操作
- [group_manage](src/views/group_manage.vue) （进入该页面需要验证权限）
    1. 实现用户组基本的 ```CRUD``` 操作
    2. 实现 用户组+角色 的 ```CRUD``` 操作
- [role_manage](src/views/note_manage.vue) （进入该页面需要验证权限）
    1. 实现角色基本的 ```CRUD``` 操作
    2. 可点击权限进入权限页面
- [access_manage](src/views/access_manage.vue) （进入该页面需要验证权限）
    1. 树状图展示所有角色的权限
    2. 可以修改角色的权限
        
## 业务逻辑
- 用户验证：
    - [login](src/views/login.vue)  
    检查浏览器 ```cookie```  
        1. 如果有 ```token``` 且 ```token``` 验证通过
            - 页面重定向到 [welcome](src/views/welcome.vue)
        2. 如果没有
            - 进入正常的登录流程，使用 ```username``` 和 ```password``` 登录
            - 将获取到的 ```token``` 存入浏览器缓存
            - 页面重定向到 [welcome](src/views/welcome.vue)
    - [main.js](src/main.js)  
    验证 ```token``` 存在且 ```token``` 正确
        1. 如果没有通过
            - 3秒后页面重定向到 [login](src/views/login.vue)
        2. 验证通过
    - [ajax.js](src/components/ajax/index.js)  
    每次请求都会获取浏览器 ```cookie```  中的 ```token``` ,使用请求头 ```authorization``` 发送
        1. 如果 ```http``` 状态码为 ```401```
            - 3秒后页面重定向到 [login](src/views/login.vue)
        2. 验证通过

- 权限验证：  
    本系统的权限分为两种，一种为获取资源的权限（菜单），一种为操作的权限（ ```CRUD``` ）
    - 菜单验证：
        - [Sidebar](src/views/common/Sidebar.vue)  
        如果该用户没有进入某个菜单的权限， ```Sidebar``` 将不会显示
        - [main.js](src/main.js)  
        用户验证通过后，如果该用户没有进入某个菜单的权限，任何获取该页面的方法都将返回 [403](src/views/403.vue)
    - 操作验证：
        - [user_manage](src/views/user_manage.vue) | [group_manage](src/views/group_manage.vue) | [role_manage](src/views/note_manage.vue) | [access_manage](src/views/access_manage.vue) | [material_manage](src/views/material_manage.vue) | [note_manage](src/views/note_manage.vue) | [note_content](src/views/note_content.vue)  
        如果该用户没有某个操作的权限，该操作所对应的页面元素不会显示或者被禁用
    
- 角色验证：  
    - 规则：  
        - 所有角色直接或简介继承 ```超级管理员``` 角色
        -  ```超级管理员``` 角色拥有所有的权限（最高权限）
        - 子角色的权限等级不会高于父角色的权限等级，即：
            - 子角色只能被赋予父角色拥有的权限
            - 父角色不能将自己未拥有的角色赋予子角色
        - 所有角色只能操作自己的子角色
    - 验证机制：  
        - 初始化用户之前先构建一颗角色树，因为所有角色直接或简介继承 ```超级管理员``` 这个角色，所以这棵树以 ```超级管理员``` 为根节点，囊括了所有的角色。
        - 查找用户的所有角色
        - 参照角色树，找出所有靠近根节点且没有继承关系的角色
        - 与目标操作进行角色的权限等级对比，得出是否能够进行该操作  
        在 ```rbac``` 中，对目标（用户或用户组）的操作需要与其所拥有的的角色进行全部比对，一旦目标拥有一个或多个无法操作的角色，该操作无法进行下去

- 未完成拓展：
    - 用户管理的用户组模糊查询bug
    - 材料管理的时间条件查询
    - 材料管理上传时禁用操作