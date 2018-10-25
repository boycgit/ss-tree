import { TreeNode } from '../node/treenode';
import { invariant, isExist, isFunction } from '../lib';
import Stack from 'ss-stack';
import Queue from 'ss-queue';

// handle current node when traverse
type NodeHandler = (node: TreeNode, lastHandleResult?: any) => any;

// map current node to another
type NodeMapper = (node: TreeNode, parent?: TreeNode) => TreeNode;

// assinger child to parent in tree
type ChildAssigner = (parent: TreeNode, children: TreeNode[]) => void;

// condition whose target node matched to add or remove
type ConditionFunction = (node: TreeNode) => boolean;

// condition function for get tree leaves
export const IsLeafCondition = function(node: TreeNode) {
  return node.children.length === 0;
};

export const SizeHandler = function(node: TreeNode, lastResult: number = 0) {
  lastResult += 1;
  return lastResult;
};

const DEFAULT_ASSIGNER: ChildAssigner = function(
  parent: TreeNode,
  children: TreeNode[]
) {
  parent.children = children;
};

export enum TRAVERSE_TYPE {
  BFS = 'BFS',
  DFS = 'DFS'
}

export class Tree {
  _root: TreeNode | null;
  constructor(data?) {
    let nodeData: TreeNode | null = null;
    // 支持入参是 node 的场景
    if (data instanceof TreeNode) {
      nodeData = data;
    } else if (isExist(data, false)) {
      nodeData = new TreeNode(data);
    }
    this._root = nodeData;
  }

  get root(): TreeNode | null {
    return this._root;
  }
  set root(node: TreeNode | null) {
    this._root = node;
  }

  get isEmpty(): boolean {
    return this._root === null;
  }

  /**
   * construct tree from tree node
   * using deep clone method
   *
   * @static
   * @param {TreeNode} node
   * @returns {Tree}
   * @memberof Tree
   */
  static fromNode(node: TreeNode): Tree {
    const tree = new Tree();
    tree.root = node; // 生成一颗子树
    return Tree.map(tree, node => {
      return node.clone();
    });
  }

  /**
   * get tree leaves
   *
   * @readonly
   * @type {TreeNode[]}
   * @memberof Tree
   */
  get leaves(): TreeNode[] {
    return this.find(IsLeafCondition);
  }

  /**
   * get current tree most depth
   * aka.  calculate max leaf's depth
   *
   * @readonly
   * @type {number}
   * @memberof Tree
   */
  get depth(): number {
    const leaves = this.leaves;
    let mostDepth = 0;

    leaves.forEach(leaf => {
      if (leaf.depth > mostDepth) {
        mostDepth = leaf.depth;
      }
    });

    return mostDepth;
  }

  /**
   * count tree nodes number
   *
   * @readonly
   * @type {number}
   * @memberof Tree
   */
  get size(): number {
    return this.isEmpty ? 0 : this.traverse(SizeHandler);
  }

  /**
   * traverse api, call static DFS or BFS inner
   *
   * @static
   * @param {(TreeNode | TreeNode[])} inputNodes - input node or nodes
   * @param {NodeHandler} handler - handler of node when traverse
   * @param {TRAVERSE_TYPE} [traverseType=TRAVERSE_TYPE.BFS] - traverse type
   * @param {boolean} [breakIfHandlerReturnTrue=true] - break traverse if handler return true
   * @returns {*}
   * @memberof Tree
   */
  static traverse(
    inputNodes: null | TreeNode | TreeNode[],
    handler: NodeHandler,
    traverseType: TRAVERSE_TYPE = TRAVERSE_TYPE.BFS,
    breakIfHandlerReturnTrue = true
  ): any {
    invariant(
      traverseType in TRAVERSE_TYPE,
      `not support "${traverseType}" traverse type, please choose 'BFS' or 'DFS' instead`
    );
    switch (traverseType) {
      case TRAVERSE_TYPE.BFS:
        return Tree.BFS(inputNodes, handler, breakIfHandlerReturnTrue);
      case TRAVERSE_TYPE.DFS:
        return Tree.DFS(inputNodes, handler, breakIfHandlerReturnTrue);
    }
  }

  /**
   * call static traverse api
   *
   * @static
   * @param {NodeHandler} handler - handler of node when traverse
   * @param {TRAVERSE_TYPE} [traverseType=TRAVERSE_TYPE.BFS] - traverse type
   * @param {boolean} [breakIfHandlerReturnTrue=true] - break traverse if handler return true
   * @memberof Tree
   */
  traverse(
    handler: NodeHandler,
    traverseType: TRAVERSE_TYPE = TRAVERSE_TYPE.BFS,
    breakIfHandlerReturnTrue = true
  ): any {
    return Tree.traverse(
      this._root,
      handler,
      traverseType,
      breakIfHandlerReturnTrue
    );
  }

  /**
   * breadth first search, 广度优先搜索
   *
   * @static
   * @param {(TreeNode | TreeNode[])} inputNodes - input node or nodes
   * @param {NodeHandler} handler - handler of node when traverse
   * @param {boolean} [breakIfHandlerReturnTrue=true] - break traverse if handler return true
   * @returns {*}
   * @memberof Tree
   */
  static BFS(
    inputNodes: null | TreeNode | TreeNode[],
    handler: NodeHandler,
    breakIfHandlerReturnTrue = true
  ): any {
    if(inputNodes === null) {
      return;
    }

    let nodes: TreeNode[] = [];
    if (isExist(inputNodes)) {
      nodes = ([] as TreeNode[]).concat(inputNodes);
    }

    const queue = new Queue<TreeNode>();
    //先将第一层节点放入栈，倒序压入
    nodes.forEach(node => {
      queue.enqueue(node);
    });

    let node;
    let lastHandleResult;
    while (queue.length) {
      node = queue.dequeue(); // 弹出元素

      lastHandleResult = handler && handler(node, lastHandleResult);
      if (!!breakIfHandlerReturnTrue && lastHandleResult === true) {
        break;
      }

      //如果该节点有子节点，继续添加进入栈顶
      if (node.children && node.children.length) {
        node.children.forEach(child => {
          queue.enqueue(child);
        });
      }
    }
    return lastHandleResult;
  }

  /**
   * depth first search, 深度优先搜索
   *
   * @static
   * @param {(TreeNode | TreeNode[])} inputNodes - input node or nodes
   * @param {NodeHandler} handler - handler of node when traverse
   * @param {boolean} [breakIfHandlerReturnTrue=true] - break traverse if handler return true
   * @returns {*}
   * @memberof Tree
   */
  static DFS(
    inputNodes: null | TreeNode | TreeNode[],
    handler: NodeHandler,
    breakIfHandlerReturnTrue = true
  ): any {
    if (inputNodes === null) {
      return;
    }

    var nodes: TreeNode[] = [];
    if (isExist(inputNodes)) {
      nodes = ([] as TreeNode[]).concat(inputNodes);
    }

    var stack = new Stack<TreeNode>();

    // 将节点倒序入栈
    for (var i = nodes.length; i > 0; i--) {
      stack.push(nodes[i - 1]);
    }

    var node;
    let lastHandleResult;
    while (stack.length) {
      node = stack.pop(); // 弹出
      lastHandleResult = handler && handler(node, lastHandleResult);
      if (!!breakIfHandlerReturnTrue && lastHandleResult === true) {
        break;
      }

      if (node.children && node.children.length) {
        // 将子节点倒序入栈
        for (let i = node.children.length; i > 0; i--) {
          stack.push(node.children[i - 1]);
        }
      }
    }
    return lastHandleResult;
  }

  /**
   * map current tree to construt another tree, like what array.map do
   * in fact, it run traverse algorithm for side effect
   *
   * @static
   * @param {Tree} tree - original tree
   * @param {NodeMapper} mapper -  (currentNode, parentNode) param `currentNode` is the current node for mapper function, no need to handle its children attribute； param `parentNode` is refer to parent node of current
   * @param {boolean} [disableParent=false] - is usually set `true` when you use your custom `childrenAssigner` function, or other tree node
   * @param {ChildAssigner} [childrenAssigner=DEFAULT_ASSIGNER] - custom children assigner function
   * @returns {Tree}
   * @memberof Tree
   */
  static map(
    tree: Tree,
    mapper: NodeMapper,
    disableParent = false,
    childrenAssigner: ChildAssigner = DEFAULT_ASSIGNER
  ): Tree {
    invariant(
      isFunction(mapper),
      `param \`mapper\` ${mapper} should be function type`
    );
    if(tree.isEmpty){
      return new Tree();
    }
    invariant(
      tree instanceof Tree,
      `param \`tree\` ${tree} should be Tree instance`
    );


    var queue = new Queue<TreeNode>(); // 基准队列
    var queuePair = new Queue<TreeNode>(); // 同步用的队列，给新对象使用， 这样不更改原始对象数据，同时每个队列的对象类型是一致的；
    const newRootNode = mapper(tree.root as TreeNode); // 克隆，防止修改原始对象
    const newTree = new Tree(newRootNode);

    invariant(
      isFunction(childrenAssigner),
      'childrenAssigner should be function type'
    );

    // 将新节点入栈
    queue.enqueue(tree.root);
    queuePair.enqueue(newTree.root);

    var node, nodePair;

    while (queue.length) {
      node = queue.dequeue(); // 出队
      nodePair = queuePair.dequeue(); // 同步队列出队

      //如果该节点有子节点，继续添加进入队列
      if (node.children && node.children.length) {
        let newSubNodes = node.children.map(child => {
          let newChildNode = mapper(child, node);

          // 重新修改 parent 对象
          if (!disableParent) {
            newChildNode.parent = nodePair;
          }

          queue.enqueue(child); // 基准队列入队
          queuePair.enqueue(newChildNode); // 同步队列入队

          return newChildNode;
        });
        childrenAssigner(nodePair, newSubNodes);
      } else {
        childrenAssigner(nodePair, []); // 相当于 nodePair.children = [];
      }
    }

    return newTree;
  }

  /**
   * map api of tree instance, just calling static map function;
   *
   * @param {NodeMapper} mapper - mapper function
   * @param {boolean} [disableParent=false] - is usually set `true` when you use your custom `childrenAssigner` function, or other tree node
   * @param {ChildAssigner} [childrenAssigner=DEFAULT_ASSIGNER] - custom children assigner function
   * @returns {Tree}
   * @memberof Tree
   */
  map(
    mapper: NodeMapper,
    disableParent = false,
    childrenAssigner: ChildAssigner = DEFAULT_ASSIGNER
  ): Tree {
    return Tree.map(this, mapper, disableParent, childrenAssigner);
  }

  /**
   * clone current tree
   *
   * @returns {Tree}
   * @memberof Tree
   */
  clone(): Tree {
    return Tree.map(this, node => {
      return node.clone();
    });
  }

  /**
   * add node to tree
   * note: can only add to one parent, because one node only has one `parent` attribute
   *
   * @param {TreeNode} node - node want to add to current tree
   * @param {ConditionFunction} condition - node which satisfy the condition, as parent nodes
   * @param {TRAVERSE_TYPE} [traverseType=TRAVERSE_TYPE.BFS] - traverse type
   * @returns {TreeNode | null}
   * @memberof Tree
   */
  add(
    node: TreeNode,
    condition: ConditionFunction,
    traverseType: TRAVERSE_TYPE = TRAVERSE_TYPE.BFS
  ): TreeNode | null {
    invariant(
      node instanceof TreeNode,
      `param \`node\` ${node} should be tree-node instance`
    );

    let parent: TreeNode | null = null;
    let handler = function(currentNode) {
      if (condition(currentNode)) {
        parent = currentNode;
        currentNode.add(node);
        return true;
      }
      return false;
    };
    // 遍历，添加完就完毕，不需要遍历完
    this.traverse(handler, traverseType, true);

    return parent;
  }

  /**
   * remove node from tree
   *
   * @param {ConditionFunction} condition - node which satisfy the condition, as parent nodes
   * @param {TRAVERSE_TYPE} [traverseType=TRAVERSE_TYPE.BFS] - traverse type
   * @returns {TreeNode[]}
   * @memberof Tree
   */
  remove(
    condition: ConditionFunction,
    traverseType: TRAVERSE_TYPE = TRAVERSE_TYPE.BFS
  ): TreeNode[] {
    const nodes = this.find(condition, traverseType);
    nodes.forEach(currentNode => {
      currentNode.remove();

      // 如果删除的是根节点，则让当前树置空
      if(currentNode === this._root){
        this._root = null;
      }
    });

    return nodes;
  }

  /**
   * find node from tree
   *
   * @param {ConditionFunction} condition - node which satisfy the condition, as parent nodes
   * @param {TRAVERSE_TYPE} [traverseType=TRAVERSE_TYPE.BFS] - traverse type
   * @returns {TreeNode[]}
   * @memberof Tree
   */
  find(
    condition: ConditionFunction,
    traverseType: TRAVERSE_TYPE = TRAVERSE_TYPE.BFS
  ): TreeNode[] {
    let handler = function(currentNode: TreeNode, lastResult: TreeNode[] = []) {
      if (condition(currentNode)) {
        lastResult.push(currentNode);
      }
      return lastResult;
    };
    // 遍历
    return this.traverse(handler, traverseType) || [];
  }
}
