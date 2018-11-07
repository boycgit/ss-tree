import { compareFunction } from 'ss-comparator';
import { BinaryTreeNode, BinaryNodeOrNull } from '../node/binarytreenode';
import { Tree } from '../tree/tree';
import Queue from 'ss-queue';

enum DIRECTION {
  START = 'START',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  SELF = 'SELF'
}
interface NodeInfo {
  from: DIRECTION;
  node: BinaryNodeOrNull;
}

// handle current node when traverse
export type BinaryNodeHandler = (
  nodeInfo: NodeInfo,
  lastHandleResult?: any
) => any;

/**
 * particular traverse method for BST, will be more efficient than normal tree
 *
 * @export
 * @param {*} inputData - input data
 * @param {BinaryNodeOrNull} originNode - node which traverse start from
 * @param {BinaryNodeHandler} handler -  handle function when traversing
 * @param {boolean} [breakIfHandlerReturnTrue=true] - if return true, will break traverse
 * @returns
 */
export function BinaryTraverse(
  inputData: any,
  originNode: BinaryNodeOrNull,
  handler: BinaryNodeHandler,
  breakIfHandlerReturnTrue = true
) {
  const queue = new Queue<NodeInfo>();
  queue.enqueue({ from: DIRECTION.START, node: originNode });
  let lastHandleResult;

  while (queue.length) {
    const nodeInfo = queue.dequeue() as NodeInfo; // 出栈
    lastHandleResult = handler && handler(nodeInfo, lastHandleResult);

    // 如果需要中断循环，设置中断标志位
    if (!!breakIfHandlerReturnTrue && lastHandleResult === true) {
      break; // 中断当前循环
    }

    const currentNode = nodeInfo.node;
    // 如果当前节点不为 null，才会有入栈操作
    if (currentNode && nodeInfo.from !== DIRECTION.SELF) {
      // 1. 如果当前节点的 data 为 undefined， 或者和 inputData 一致
      if (
        currentNode.comparator.equal(currentNode.data, undefined) ||
        currentNode.comparator.equal(currentNode.data, inputData)
      ) {
        queue.enqueue({ from: DIRECTION.SELF, node: currentNode });

        // 2. 如果小于当前值
      } else if (currentNode.comparator.lessThan(inputData, currentNode.data)) {
        // 将当前节点的左节点推入到栈里
        queue.enqueue({ from: DIRECTION.LEFT, node: currentNode.left });
        // 3. 如果小于当前值
      } else if (
        currentNode.comparator.greaterThan(inputData, currentNode.data)
      ) {
        // 将当前节点的右边节点推入到栈里
        queue.enqueue({ from: DIRECTION.RIGHT, node: currentNode.right });
      }
    }
  }

  return lastHandleResult;
}

/**
 * find min value of current tree
 *
 * @export
 * @param {BinaryTreeNode} originNode
 * @returns {BinaryTreeNode}
 */
export function findMin(originNode: BinaryTreeNode): BinaryTreeNode {
  let node = originNode;
  while (node.left) {
    node = node.left;
  }
  return node;
}

function copyChildren(node: BinaryTreeNode, withNode: BinaryTreeNode) {
  node.setLeft(withNode.left);
  node.setRight(withNode.right);
}

export class BinarySearchTree extends Tree {
  _root: BinaryNodeOrNull;
  constructor(data?, compare?: compareFunction) {
    super(data, compare);
    // 将节点转换成二叉树节点
    this._root = this._root ? new BinaryTreeNode(this._root.data) : null;
  }

  /**
   * insert data into tree
   *
   * @param {*} data
   * @returns {BinarySearchTree}
   * @memberof BinarySearchTree
   */
  add(data): BinarySearchTree {
    const handler = (
      currentNodeInfo: NodeInfo,
      lastNode: BinaryNodeOrNull = null
    ) => {
      const { from, node } = currentNodeInfo;
      let newNode: BinaryNodeOrNull = null;

      // 只有在 node 为空的情况下才有新增子节点的可能
      if (!node) {
        newNode = new BinaryTreeNode(data, this.compare);
        if (from === DIRECTION.START) {
          this._root = newNode;
        } else if (from === DIRECTION.LEFT) {
          (lastNode as BinaryTreeNode).setLeft(newNode);
        } else if (from === DIRECTION.RIGHT) {
          (lastNode as BinaryTreeNode).setRight(newNode);
        }
      } else if (from === DIRECTION.SELF) {
        // 如果是当前自身节点，就直接赋值
        (node as BinaryTreeNode).data = data;
      }
      return node;
    };
    BinaryTraverse(data, this._root, handler, true);
    return this;
  }

  /**
   * find target tree nodes
   * note: in BST, there is at most one node in find result
   *
   * @param {*} data - target data
   * @returns {BinaryTreeNode[]}
   * @memberof BinarySearchTree
   */
  find(data): BinaryTreeNode[] {
    const handler = (
      currentNodeInfo: NodeInfo,
      nodes: BinaryTreeNode[] = []
    ) => {
      const { from, node } = currentNodeInfo;
      // 存在节点，并且 from 为 SELF 时方才成立
      if (node && from === DIRECTION.SELF) {
        nodes.push(node);
      }
      return nodes;
    };
    return BinaryTraverse(data, this._root, handler, true);
  }

  /**
   * check data if exist in tree
   *
   * @param {*} data
   * @returns {boolean}
   * @memberof BinarySearchTree
   */
  contains(data): boolean {
    const nodes = this.find(data);
    return nodes.length > 0;
  }
  /**
   * remove target tree nodes
   * refer:
   *  - https://lufficc.com/blog/binary-search-tree
   *  - https://www.geeksforgeeks.org/binary-search-tree-set-2-delete/
   * note: in BST, there is at most one node in remove result
   *
   *
   * @param {*} data - target data
   * @returns {BinaryTreeNode[]}
   * @memberof BinarySearchTree
   */
  remove(data): BinaryTreeNode[] {
    const nodes = this.find(data); // find node

    // if no data to remove
    if (!nodes.length) {
      return [];
    }

    const nodeToRemove = nodes[0] as BinaryTreeNode;

    const { parent } = nodeToRemove;
    if (!nodeToRemove.left && !nodeToRemove.right) {
      // node is leaf and thus has no children
      if (parent) {
        parent.removeChild(nodeToRemove);
      } else {
        // Node has no parent. Just erase current node value.
        this.root = null;
      }
    } else if (nodeToRemove.left && nodeToRemove.right) {
      // Node has two children.
      // Find the next biggest value (minimum value in the right branch)
      // and replace current value node with that next biggest value.
      const nextBiggerNode = findMin(nodeToRemove.right);

      // there is two situation: 右树最小节点是否是当前
      if (nextBiggerNode !== nodeToRemove.right) {
        // We can avoid recursive call by keeping track of parent node of successor so that we can simply remove the successor by making child of parent as NULL. We know that successor would always be a leaf node.
        const succParent = nextBiggerNode.parent as BinaryTreeNode;
        succParent.setLeft(nextBiggerNode.right);
        // copy children to target node
        copyChildren(nextBiggerNode, nodeToRemove);
      } else {
        nextBiggerNode.setLeft(nodeToRemove.left);
      }

      // 判断 nodeToRemove 是否是根节点
      if (parent) {
        // replace child
        parent.replaceChild(nodeToRemove, nextBiggerNode);
      } else {
        // copyChildren(nodeToRemove, nextBiggerNode);
        this.root = nextBiggerNode;
      }
    } else {
      // Node has only one child.
      // Make this child to be a direct child of current node's parent.
      const childNode = (nodeToRemove.left ||
        nodeToRemove.right) as BinaryTreeNode;

      // 判断 nodeToRemove 是否是根节点
      if (parent) {
        parent.replaceChild(nodeToRemove, childNode);
      } else {
        this.root = childNode;
      }
    }

    nodeToRemove.parent = null; // remove parent

    return nodes;
  }
}
