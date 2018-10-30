import Comparator from 'ss-comparator';
// import { invariant } from '../lib';
import { TreeNode } from './treenode';
import { getLevelInfo } from './traverse';
import { invariant } from '../lib';

export type BinaryNodeOrNull = BinaryTreeNode | null;

export class BinaryTreeNode extends TreeNode {
  parent: BinaryNodeOrNull;
  children: BinaryNodeOrNull[];
  constructor(data?, comparator = new Comparator()) {
    super(data, comparator);
    this.children = [null, null]; // 二叉树节点，最多有两个 child，初始化为 null
  }

  get left(): BinaryNodeOrNull {
    return this.children[0];
  }
  get right(): BinaryNodeOrNull {
    return this.children[1];
  }

  get leftHeight(): number {
    if (!this.left) {
      return 0;
    }

    return getLevelInfo(this.left).depth + 1;
  }

  get rightHeight(): number {
    if (!this.right) {
      return 0;
    }
    return getLevelInfo(this.right).depth + 1;
  }

  get height(): number {
    return getLevelInfo(this).depth;
  }

  get balanceFactor(): number {
    return this.leftHeight - this.rightHeight;
  }

  get uncle(): BinaryNodeOrNull {
    // Check if current node has parent.
    if (!this.parent) {
      return null;
    }

    // Check if current node has grand-parent.
    if (!this.parent.parent) {
      return null;
    }
    // Check if grand-parent has two children.
    if (!this.parent.parent.left || !this.parent.parent.right) {
      return null;
    }

    // So for now we know that current node has grand-parent and this
    // grand-parent has two children. Let's find out who is the uncle.
    if (this.comparator.equal(this.parent, this.parent.parent.left)) {
      // Right one is an uncle.
      return this.parent.parent.right;
    } else {
      // Left one is an uncle.
      return this.parent.parent.left;
    }
  }

  /**
   * `add` function was disabled in BinaryNode, throw error directly
   *
   * @param {TreeNode} node
   * @returns {TreeNode}
   * @memberof BinaryTreeNode
   */
  add(node: TreeNode): TreeNode {
    invariant(
      false,
      '`add` function was disabled in BinaryNode, please use `setLeft` or `setRight` instead'
    );
      return new TreeNode(node); // won't execute, just for let typescript pass
  }
  /**
   * @param {BinaryTreeNode} node
   * @return {BinaryTreeNode}
   */
  setLeft(node): BinaryTreeNode {
    // Reset parent for left node since it is going to be detached.
    if (this.left) {
      this.left.parent = null;
    }

    // Attach new node to the left.
    this.children[0] = node;

    // Make current node to be a parent for new left one.
    if (this.left) {
      this.left.parent = this;
    }

    return this;
  }

  /**
   * @param {BinaryTreeNode} node
   * @return {BinaryTreeNode}
   */
  setRight(node): BinaryTreeNode {
    // Reset parent for right node since it is going to be detached.
    if (this.right) {
      this.right.parent = null;
    }

    // Attach new node to the left.
    this.children[1] = node;

    // Make current node to be a parent for new right one.
    if (this.right) {
      this.right.parent = this;
    }

    return this;
  }

  /**
   * @param {BinaryTreeNode} nodeToRemove
   * @return {boolean}
   */
  removeChild(nodeToRemove) {
    if (this.left && this.comparator.equal(this.left, nodeToRemove)) {
      this.children[0] = null;
      return true;
    }

    if (this.right && this.comparator.equal(this.right, nodeToRemove)) {
      this.children[1] = null;
      return true;
    }
    return false;
  }
}
