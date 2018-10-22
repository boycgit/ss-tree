import { TreeNode } from '../node/treenode';
import { invariant, isExist, isFunction } from '../lib';
import Queue from 'ss-queue';
import Stack from 'ss-stack';

// handle current node when traverse
type NodeHandler = (node: TreeNode) => any;

// map current node to another
type NodeMapper = (node: TreeNode, parent?: TreeNode) => TreeNode;

// assinger child to parent in tree
type ChildAssigner = (parent: TreeNode, children: TreeNode[]) => void;

// condition whose target node matched to add or remove
type ConditionFunction = (node: TreeNode) => boolean;

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
  _root: TreeNode;
  constructor(data) {
    let nodeData = data;
    // 支持入参是 node 的场景
    if (data instanceof TreeNode) {
      nodeData = data.data;
    }
    this._root = new TreeNode(nodeData);
  }

  get root() {
    return this._root;
  }
  set root(val) {
    this._root.data = val;
  }

  /**
   * traverse api, call static DFS or BFS inner
   *
   * @static
   * @param {(TreeNode | TreeNode[])} inputNodes - input node or nodes
   * @param {NodeHandler} handler - handler of node when traverse
   * @param {TRAVERSE_TYPE} [traverseType=TRAVERSE_TYPE.BFS] - traverse type
   * @param {boolean} [breakIfHandlerReturnTrue=true] - break traverse if handler return true
   * @memberof Tree
   */
  static traverse(
    inputNodes: TreeNode | TreeNode[],
    handler: NodeHandler,
    traverseType: TRAVERSE_TYPE = TRAVERSE_TYPE.BFS,
    breakIfHandlerReturnTrue = true
  ): void {
    invariant(
      traverseType in TRAVERSE_TYPE,
      `not support "${traverseType}" traverse type, please choose 'BFS' or 'DFS' instead`
    );
    switch (traverseType) {
      case TRAVERSE_TYPE.BFS:
        Tree.BFS(inputNodes, handler, breakIfHandlerReturnTrue);
        break;
      case TRAVERSE_TYPE.DFS:
        Tree.DFS(inputNodes, handler, breakIfHandlerReturnTrue);
        break;
      default:
        break;
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
  ): void {
    Tree.traverse(this._root, handler, traverseType, breakIfHandlerReturnTrue);
  }

  /**
   * breadth first search, 广度优先搜索
   *
   * @static
   * @param {(TreeNode | TreeNode[])} inputNodes - input node or nodes
   * @param {NodeHandler} handler - handler of node when traverse
   * @param {boolean} [breakIfHandlerReturnTrue=true] - break traverse if handler return true
   * @returns
   * @memberof Tree
   */
  static BFS(
    inputNodes: TreeNode | TreeNode[],
    handler: NodeHandler,
    breakIfHandlerReturnTrue = true
  ): void {
    var nodes: TreeNode[] = [];
    if (isExist(inputNodes)) {
      nodes = ([] as TreeNode[]).concat(inputNodes);
    }

    if (!inputNodes || !nodes.length) return;
    var queue = new Queue<TreeNode>();
    //先将第一层节点放入栈，倒序压入
    nodes.forEach(node => {
      queue.enqueue(node);
    });

    var node;

    while (queue.length) {
      node = queue.dequeue(); // 弹出元素

      let result = handler && handler(node);
      if (!!breakIfHandlerReturnTrue && !!result) {
        break;
      }

      //如果该节点有子节点，继续添加进入栈顶
      if (node.children && node.children.length) {
        node.children.forEach(child => {
          queue.enqueue(child);
        });
      }
    }
  }

  /**
   * depth first search, 深度优先搜索
   *
   * @static
   * @param {(TreeNode | TreeNode[])} inputNodes - input node or nodes
   * @param {NodeHandler} handler - handler of node when traverse
   * @param {boolean} [breakIfHandlerReturnTrue=true] - break traverse if handler return true
   * @returns
   * @memberof Tree
   */
  static DFS(
    inputNodes: TreeNode | TreeNode[],
    handler: NodeHandler,
    breakIfHandlerReturnTrue = true
  ): void {
    var nodes: TreeNode[] = [];
    if (isExist(inputNodes)) {
      nodes = ([] as TreeNode[]).concat(inputNodes);
    }

    if (!inputNodes || !nodes.length) return;

    var stack = new Stack<TreeNode>();

    // 将节点倒序入栈
    for (var i = nodes.length; i > 0; i--) {
      stack.push(nodes[i - 1]);
    }

    var node;
    while (stack.length) {
      node = stack.pop(); // 弹出
      let result = handler && handler(node);
      if (!!breakIfHandlerReturnTrue && !!result) {
        break;
      }

      if (node.children && node.children.length) {
        // 将子节点倒序入栈
        for (let i = node.children.length; i > 0; i--) {
          stack.push(node.children[i - 1]);
        }
      }
    }
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
   * @returns
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
    invariant(
      tree instanceof Tree,
      `param \`tree\` ${tree} should be Tree instance`
    );
    var queue = new Queue(); // 基准队列
    var queuePair = new Queue(); // 同步用的队列，给新对象使用， 这样不更改原始对象数据，同时每个队列的对象类型是一致的；
    const newRootNode = mapper(tree.root); // 克隆，防止修改原始对象
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
   * @param {NodeMapper} mapper
   * @returns
   * @memberof Tree
   */
  map(mapper: NodeMapper): Tree {
    return Tree.map(this, mapper);
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
   *
   * @param {TreeNode} node - node want to add to current tree
   * @param {ConditionFunction} condition - node which satisfy the condition, as parent nodes
   * @param {TRAVERSE_TYPE} [traverseType=TRAVERSE_TYPE.BFS] - traverse type
   * @returns {TreeNode[]}
   * @memberof Tree
   */
  add(
    node: TreeNode,
    condition: ConditionFunction,
    traverseType: TRAVERSE_TYPE = TRAVERSE_TYPE.BFS
  ): TreeNode[] {
    invariant(
      node instanceof TreeNode,
      `param \`node\` ${node} should be tree-node instance`
    );

    let parents: TreeNode[] = [];
    let handler = function(currentNode) {
      if (condition(currentNode)) {
        parents.push(currentNode);
      }
    };
    // 遍历
    this.traverse(handler, traverseType);

    parents.forEach(currentNode => {
      currentNode.add(node);
    });

    return parents;
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
    let nodes: TreeNode[] = [];
    let handler = function(currentNode) {
      if (condition(currentNode)) {
        nodes.push(currentNode);
      }
    };
    // 遍历
    this.traverse(handler, traverseType);
    nodes.forEach(currentNode => {
      currentNode.remove();
    });

    return nodes;
  }
}
