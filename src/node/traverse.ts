import { TreeNode, NodeOrNull } from './treenode';
import { invariant, isExist, isFunction } from '../lib';
import Stack from 'ss-stack';
import Queue from 'ss-queue';

export enum TRAVERSE_TYPE {
  BFS = 'BFS',
  DFS = 'DFS'
}
// handle current node when traverse
export type NodeHandler = (node: NodeOrNull, lastHandleResult?: any) => any;

// map current node to another
export type NodeMapper = (node: NodeOrNull, parent?: NodeOrNull) => NodeOrNull;

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
 * @param {( NodeOrNull | NodeOrNull[])} inputNodes - input node or nodes
 * @param {NodeHandler} handler - handler of node when traverse
 * @param {boolean} [breakIfHandlerReturnTrue=true] - break traverse if handler return true
 * @returns {*}
 */
export function BFS(
  inputNodes: NodeOrNull | NodeOrNull[],
  handler: NodeHandler,
  breakIfHandlerReturnTrue = true
): any {
  if (inputNodes === null) {
    return;
  }

  let nodes: NodeOrNull[] = [];
  if (isExist(inputNodes)) {
    nodes = ([] as NodeOrNull[]).concat(inputNodes);
  }

  const queue = new Queue<NodeOrNull>();
  //先将第一层节点放入栈，倒序压入，判断节点是否存在
  nodes.forEach(node => {
    if (!!node) {
      queue.enqueue(node);
    }
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
    if (node && node.children && node.children.length) {
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
 * @export
 * @param {(NodeOrNull | NodeOrNull[])} inputNodes - input node or nodes
 * @param {NodeHandler} handler - handler of node when traverse
 * @param {boolean} [breakIfHandlerReturnTrue=true] - break traverse if handler return true
 * @returns {*}
 */
export function DFS(
  inputNodes: NodeOrNull | NodeOrNull[],
  handler: NodeHandler,
  breakIfHandlerReturnTrue = true
): any {
  if (inputNodes === null) {
    return;
  }

  var nodes: NodeOrNull[] = [];
  if (isExist(inputNodes)) {
    nodes = ([] as NodeOrNull[]).concat(inputNodes);
  }

  var stack = new Stack<NodeOrNull>();

  // 将节点倒序入栈，判断节点是否存在
  for (var i = nodes.length; i > 0; i--) {
    const currentNode = nodes[i - 1];
    if (!!currentNode) {
      stack.push(currentNode);
    }
  }

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
 * traverse api, call static DFS or BFS inner
 *
 * @export
 * @param {(NodeOrNull | NodeOrNull[])} inputNodes - input node or nodes
 * @param {NodeHandler} handler - handler of node when traverse
 * @param {TRAVERSE_TYPE} [traverseType=TRAVERSE_TYPE.BFS] - traverse type
 * @param {boolean} [breakIfHandlerReturnTrue=true] - break traverse if handler return true
 * @returns {*}
 */
export function traverse(
  inputNodes: NodeOrNull | NodeOrNull[],
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
      return BFS(inputNodes, handler, breakIfHandlerReturnTrue);
    case TRAVERSE_TYPE.DFS:
      return DFS(inputNodes, handler, breakIfHandlerReturnTrue);
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
 * @returns {(NodeOrNull)}
 */
export function map(
  inputNode: NodeOrNull,
  mapper: NodeMapper,
  disableParent = false,
  childrenAssigner: ChildAssigner = DEFAULT_ASSIGNER
): NodeOrNull {
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
  var queuePair = new Queue<NodeOrNull>(); // 同步用的队列，给新对象使用， 这样不更改原始对象数据，同时每个队列的对象类型是一致的；
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

export function find(
  inputNodes: NodeOrNull | NodeOrNull[],
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
  return traverse(inputNodes, handler, traverseType) || [];
}
