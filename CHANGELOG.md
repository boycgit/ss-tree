# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.0.1"></a>
## 1.0.1 (2018-11-16)


### Features

* **BFS 增强:** 通过在 BFS 的时候新增层级相关参数，从而能够在遍历的时候获取层级信息 ([4073884](https://github.com/boycgit/ss-tree/commit/4073884))
* **功能:** 添加最基本的“Tree” 的功能，诸如遍历、添加等等 ([cbdf225](https://github.com/boycgit/ss-tree/commit/cbdf225))
* **功能扩展:** 从 tree.ts 中分离出 traverse.ts，并将入参范围从 node 扩展成 node | null ([0144815](https://github.com/boycgit/ss-tree/commit/0144815))
* **功能新增:** 新增 BST 的 CURD 操作；补充单元测试； ([929af7c](https://github.com/boycgit/ss-tree/commit/929af7c))
* **功能新增:** 新增 toJSON 方法，输出 json 格式 ([0d18161](https://github.com/boycgit/ss-tree/commit/0d18161))
* **场景新增:** 新增 binary tree node 类，并将 dfs 支持前序、中序、后序搜索 ([05b0a6a](https://github.com/boycgit/ss-tree/commit/05b0a6a))
* **基础功能:** 完成 treenode.ts、tree.ts 功能的开发，并 100% 完成单元测试用例 ([14f397f](https://github.com/boycgit/ss-tree/commit/14f397f))
