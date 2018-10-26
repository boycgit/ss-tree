import Comparator from 'ss-comparator';
// import { invariant } from '../lib';
import { TreeNode } from './treenode';

export class BinaryTreeNode extends TreeNode {
  constructor(data?, comparator = new Comparator()) {
      super(data, comparator);
      this.children = [null, null];  // 二叉树节点，最多有两个 child，初始化为 null
  }

  get left() {
      return this.children[0];
  }
  get right() {
      return this.children[1];
  }
}
