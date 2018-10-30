import { TreeNode, NodeOrNull, NodeLikeObject } from './treenode';
import { BinaryTreeNode, BinaryNodeOrNull } from './binarytreenode';
import { invariant, isFunction } from '../lib';
import Stack from 'ss-stack';
import Queue from 'ss-queue';

/**
 * traverse type
 *
 * @export
 * @enum {number}
 */
export enum TRAVERSE_TYPE {
  BFS = 'BFS',
  DFS = 'DFS'
}

/**
 * deep first order type
 *
 * @export
 * @enum {number}
 */
export enum DFS_ORDER_TYPE {
  PRE = 'PRE_ORDER',
  IN = 'IN_ORDER',
  POST = 'POST_ORDER'
}

// handle current node when traverse
export type NodeHandler = (
  node: NodeOrNull,
  lastHandleResult?: any,
  levelNo?: number, // only for BFS
  levelNodes?: NodeOrNull[] // only for BFS
) => any;

// map current node to another
export type NodeMapper = (
  node: NodeOrNull,
  parent?: NodeOrNull
) => NodeOrNull | NodeLikeObject;

// assinger child to parent in tree
export type ChildAssigner = (parent: TreeNode, children: TreeNode[]) => void;

// condition whose target node matched to add or remove
export type ConditionFunction = (node: TreeNode) => boolean;

export const DEFAULT_ASSIGNER: ChildAssigner = function(
  parent: NodeOrNull,
  children: NodeOrNull[]
) {
  if (!!parent) {
    parent.children = children;
  }
};

/**
 * breadth first search, 广度优先搜索
 *
 * @export
 * @param {( NodeOrNull)} inputNode - input node or nodes
 * @param {NodeHandler} handler - handler of node when traverse
 * @param {boolean} [breakIfHandlerReturnTrue=true] - break traverse if handler return true
 * @returns {*}
 */
export function BFS(
  inputNode: NodeOrNull,
  handler: NodeHandler,
  breakIfHandlerReturnTrue = true
): any {
  const queue = new Queue<NodeOrNull>();

  //先将第一层节点放入栈，倒序压入，判断节点是否存在
  queue.enqueue(inputNode);

  let node;
  let lastHandleResult;
  let shouldBreakLoop = false;
  let levelNo = 0; // 当前层数
  while (queue.length) {
    const levelNodes = queue.toArray(); // 获取当前层的节点
    for (let index = 0; index < levelNodes.length; index++) {
      node = queue.dequeue(); // 弹出元素
      lastHandleResult =
        handler && handler(node, lastHandleResult, levelNo, levelNodes);

      // 如果需要中断循环，设置中断标志位
      if (!!breakIfHandlerReturnTrue && lastHandleResult === true) {
        shouldBreakLoop = true;
        break; // 中断当前循环
      }
      //如果该节点有子节点，继续添加进入栈顶
      if (node && node.children && node.children.length) {
        node.children.forEach(child => {
          queue.enqueue(child);
        });
      }
    }
    if (shouldBreakLoop) {
      break;
    }
    levelNo++; // 层数自增
  }
  return lastHandleResult;
}

/**
 * depth first search, 深度优先搜索
 *
 * @export
 * @param {(NodeOrNull)} inputNode - input node or nodes
 * @param {NodeHandler} handler - handler of node when traverse
 * @param {boolean} [breakIfHandlerReturnTrue=true] - break traverse if handler return true
 * @param {DFS_ORDER_TYPE} [type=DFS_ORDER_TYPE.PRE] - dfs traverse type
 * @returns {*}
 */
export function DFS(
  inputNode: NodeOrNull,
  handler: NodeHandler,
  breakIfHandlerReturnTrue = true,
  type: DFS_ORDER_TYPE = DFS_ORDER_TYPE.PRE
): any {
  // 策略模式，普通多叉树支持前序和后序，二叉树还支持中序遍历
  switch (type) {
    case DFS_ORDER_TYPE.PRE:
      return DFS_PRE_ORDER(inputNode, handler, breakIfHandlerReturnTrue);
    case DFS_ORDER_TYPE.IN:
      invariant(
        inputNode instanceof BinaryTreeNode,
        'in-order traverse only  suitable for BinaryTreeNode, not for normal type treenode'
      );
      return DFS_IN_ORDER(
        inputNode as BinaryTreeNode,
        handler,
        breakIfHandlerReturnTrue
      );
    case DFS_ORDER_TYPE.POST:
      return DFS_POST_ORDER(inputNode, handler, breakIfHandlerReturnTrue);
    default:
      invariant(
        false,
        `current not support traverse type: ${type}, please use pre-order、in-order or post-order `
      );
      break;
  }
}

/**
 * depth first search, 深度优先搜索，前序遍历
 *
 * @param {NodeOrNull} inputNode
 * @param {NodeHandler} handler
 * @param {boolean} [breakIfHandlerReturnTrue=true]
 * @returns
 */

function DFS_PRE_ORDER(
  inputNode: NodeOrNull,
  handler: NodeHandler,
  breakIfHandlerReturnTrue = true
) {
  var stack = new Stack<NodeOrNull>();
  // 将节点倒序入栈，判断节点是否存在
  stack.push(inputNode);

  var node;
  let lastHandleResult;
  while (stack.length) {
    node = stack.pop(); // 弹出
    lastHandleResult = handler && handler(node, lastHandleResult);
    if (!!breakIfHandlerReturnTrue && lastHandleResult === true) {
      break;
    }

    if (node && node.children && node.children.length) {
      // 将子节点倒序入栈
      for (let i = node.children.length; i > 0; i--) {
        stack.push(node.children[i - 1]);
      }
    }
  }
  return lastHandleResult;
}

/**
 * depth first search, 深度优先搜索，后续遍历，双栈遍历
 * 算法来自：https://www.geeksforgeeks.org/iterative-postorder-traversal/
 *
 * @param {NodeOrNull} inputNode
 * @param {NodeHandler} handler
 * @param {boolean} [breakIfHandlerReturnTrue=true]
 * @returns
 */
function DFS_POST_ORDER(
  inputNode: NodeOrNull,
  handler: NodeHandler,
  breakIfHandlerReturnTrue = true
) {
  // Create two stacks
  var stack = new Stack<NodeOrNull>();
  var secondStack = new Stack<NodeOrNull>();

  let lastHandleResult;
  let node;
  // push root to first stack
  stack.push(inputNode);
  while (stack.length) {
    // Pop a node from first stack and push it to second stack
    node = stack.pop();
    secondStack.push(node);

    // Push left and right children of removed item to s1
    if (node && node.children) {
      node.children.forEach(child => {
        stack.push(child);
      });
    }
  }

  // pop all elements of second stack
  while (secondStack.length) {
    node = secondStack.pop();
    lastHandleResult = handler && handler(node, lastHandleResult);
    if (!!breakIfHandlerReturnTrue && lastHandleResult === true) {
      break;
    }
  }

  return lastHandleResult;
}

/**
 * depth first search, 深度优先搜索，中序遍历
 * from: https://www.geeksforgeeks.org/inorder-tree-traversal-without-recursion/
 *
 * @param {BinaryNodeOrNull} nodes
 * @param {NodeHandler} handler
 * @param {boolean} [breakIfHandlerReturnTrue=true]
 * @returns
 */
function DFS_IN_ORDER(
  inputNode: BinaryNodeOrNull,
  handler: NodeHandler,
  breakIfHandlerReturnTrue = true
) {
  var stack = new Stack<BinaryNodeOrNull>();
  var node: BinaryNodeOrNull = inputNode;
  let lastHandleResult;
  while (node || stack.length) {
    while (!!node) {
      stack.push(node);
      node = node.left;
    }
    if (stack.length) {
      node = stack.pop() as BinaryNodeOrNull;
      lastHandleResult = handler && handler(node, lastHandleResult);
      if (!!breakIfHandlerReturnTrue && lastHandleResult === true) {
        break;
      }

      node = node && node.right;
    }
  }
  return lastHandleResult;
}

/**
 * traverse api, call static DFS or BFS inner
 *
 * @export
 * @param {(NodeOrNull)} inputNodes - input node or nodes
 * @param {NodeHandler} handler - handler of node when traverse
 * @param {TRAVERSE_TYPE} [traverseType=TRAVERSE_TYPE.BFS] - traverse type
 * @param {boolean} [breakIfHandlerReturnTrue=true] - break traverse if handler return true
 * @returns {*}
 */
export function traverse(
  inputNode: NodeOrNull,
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
      return BFS(inputNode, handler, breakIfHandlerReturnTrue);
    case TRAVERSE_TYPE.DFS:
      return DFS(inputNode, handler, breakIfHandlerReturnTrue);
  }
}

/**
 * map current treenode to construt another treenode, like what array.map do
 * in fact, it run traverse algorithm for side effect
 *
 *
 * @export
 * @param {NodeOrNull} inputNode - original tree node
 * @param {NodeMapper} mapper -  (currentNode, parentNode) param `currentNode` is the current node for mapper function, no need to handle its children attribute； param `parentNode` is refer to parent node of current
 * @param {boolean} [disableParent=false] - is usually set `true` when you use your custom `childrenAssigner` function, or other tree node
 * @param {ChildAssigner} [childrenAssigner=DEFAULT_ASSIGNER] - custom children assigner function
 * @returns {(NodeOrNull | NodeLikeObject)}
 */
export function map(
  inputNode: NodeOrNull,
  mapper: NodeMapper,
  disableParent = false,
  childrenAssigner: ChildAssigner = DEFAULT_ASSIGNER
): NodeOrNull | NodeLikeObject {
  invariant(
    isFunction(mapper),
    `param \`mapper\` ${mapper} should be function type`
  );
  if (inputNode === null) {
    return null;
  }
  invariant(
    inputNode instanceof TreeNode,
    `param \`inputNode\` ${inputNode} should be TreeNode instance`
  );

  var queue = new Queue<NodeOrNull>(); // 基准队列
  var queuePair = new Queue<NodeOrNull | NodeLikeObject>(); // 同步用的队列，给新对象使用， 这样不更改原始对象数据，同时每个队列的对象类型是一致的；
  const newTreeNode = mapper(inputNode); // 克隆，防止修改原始对象

  invariant(
    isFunction(childrenAssigner),
    'childrenAssigner should be function type'
  );

  // 将新节点入栈
  queue.enqueue(inputNode);
  queuePair.enqueue(newTreeNode);

  var node, nodePair;

  while (queue.length) {
    node = queue.dequeue(); // 出队
    nodePair = queuePair.dequeue(); // 同步队列出队

    //如果该节点有子节点，继续添加进入队列
    if (!!node && node.children && node.children.length) {
      let newSubNodes = node.children.map(child => {
        let newChildNode = mapper(child, node);

        // 重新修改 parent 对象
        if (!disableParent && newChildNode) {
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

  return newTreeNode;
}

/**
 * find tree node match the given codition
 *
 * @export
 * @param {(NodeOrNull)} inputNode - original tree node
 * @param {ConditionFunction} condition - condition function use to match target node
 * @param {TRAVERSE_TYPE} [traverseType=TRAVERSE_TYPE.BFS] - traverse type
 * @returns {TreeNode[]}
 */
export function find(
  inputNode: NodeOrNull,
  condition: ConditionFunction,
  traverseType: TRAVERSE_TYPE = TRAVERSE_TYPE.BFS
): TreeNode[] {
  const handler = function(currentNode: TreeNode, lastResult: TreeNode[] = []) {
    if (condition(currentNode)) {
      lastResult.push(currentNode);
    }
    return lastResult;
  };
  // 遍历
  return traverse(inputNode, handler, traverseType) || [];
}

/**
 * interface of tree level object
 *
 * @export
 * @interface LevelInfo
 */
export interface LevelInfo {
  depth: number;
  levels: NodeOrNull[][];
}

/**
 * get level info of tree, using BFS
 *
 * @export
 * @param {(NodeOrNull)} inputNode  - original tree node
 * @returns {LevelInfo}
 */
export function getLevelInfo(inputNode: NodeOrNull): LevelInfo {
  const levelInfo = { depth: 0, levels: [] }; // 相当于 immutable 化;
  if (!inputNode) return levelInfo;
  const handler = function(
    currentNode: TreeNode,
    lastResult: LevelInfo = levelInfo,
    levelNo: number,
    levelNodes: NodeOrNull[]
  ) {
    // 有一种边界情况，最后一层的节点全部都是 null（说的就是二叉树的最后一层），这个时候最后一层就不应算进高度
    // 为了性能考虑，不需要去判断 levelNodes 是否全是 [null, ..., null] 形式的，如果当前节点是 null，直接略过此次操作
    if (currentNode === null) {
      return lastResult;
    }

    // 只在层级为 0 或者层级不一样的时候才更新
    if (levelNo === 0 || levelNo !== lastResult.depth) {
      lastResult.depth = levelNo;
      lastResult.levels.push(levelNodes);
    }
    return lastResult;
  };

  return traverse(inputNode, handler, TRAVERSE_TYPE.BFS);
}

export function toJSON(inputNode: NodeOrNull): NodeLikeObject {
  const root: NodeLikeObject = {};
  if (!inputNode) return root;
  const mapper: NodeMapper = function(node: NodeOrNull, parent?: NodeOrNull) {
    return !!node ? node.toJSON() : {};
  };

  return map(inputNode, mapper, true) as NodeLikeObject;
}
