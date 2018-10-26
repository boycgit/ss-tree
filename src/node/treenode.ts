import Comparator from 'ss-comparator';
import { invariant } from '../lib';

// 默认的数据拷贝函数，保存的 data 数据最好 json 格式
function nodeCloner(data): any {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (err) {
    console.error(`node clone error: ${err}`);
    return data;
  }
}

// compare two node if equal or not
export type NodeEqualComarator = (node: TreeNode) => boolean;

export type NodeOrNull = TreeNode | null;

export class TreeNode {
  data: any;
  meta: object;
  parent: TreeNode | null;
  children: NodeOrNull[];
  comparator: Comparator;
  constructor(data?, comparator = new Comparator()) {
    this.data = data;

    // any node related meta information may be stored here
    this.meta = {};

    this.parent = null;
    this.children = [];
    this.comparator = comparator;
  }

  /**
   *  depth of current node
   * just count how many parent 
   * @readonly
   * @memberof TreeNode
   */
  get depth(): number{
    let count = 0;
    let parent = this.parent;
    while(parent){
      count += 1;
      parent = parent.parent;
    }
    return count;
  }

  /**
   *  level of current node
   *
   * @readonly
   * @type {number}
   * @memberof TreeNode
   */
  get level(): number {
    return this.depth + 1;
  }

  /**
   * clone current node
   *
   * @param {*} [handler=nodeCloner]
   * @returns
   * @memberof TreeNode
   */
  clone(handler = nodeCloner) {
    return new TreeNode(handler(this.data), this.comparator);
  }

  /**
   * add new child to current node
   * if node already is child of current, it won't add again
   * @param {TreeNode} node - node to be added
   * @memberof TreeNode
   */
  add(node: TreeNode): TreeNode {
    invariant(node instanceof TreeNode, `${node} should be instace of TreeNode`);
    if (!~this.children.indexOf(node)) {
      this.children.push(node);
      node.parent = this;
    }
    return this;
  }

  /**
   * remove current node, just set `parent` attribute `null`
   *
   * @returns {TreeNode}
   * @memberof TreeNode
   */
  remove(): TreeNode {
    if (this.parent) {
      this.parent.removeChild(this);
    }
    this.parent = null; // 主要是让 parent 指向 null
    return this;
  }

  /**
   * remove child node(s)
   *
   * @param {TreeNode} nodeToRemoved -  node want to be removed
   * @returns {boolean}
   * @memberof TreeNode
   */
  removeChild(nodeToRemoved: TreeNode): boolean {
    const indexes: number[] = [];
    // 遍历获取所有对比
    this.children.some((node, idx) => {
      if (this.comparator.equal(node, nodeToRemoved)) {
        indexes.push(idx);
        return true;
      }
      return false;
    });

    if (!indexes.length) return false;

    indexes.reverse().forEach(idx => {
      this.children.splice(idx, 1);
    });
    nodeToRemoved.parent = null;
    return true;
  }

  /**
   * toString implemention
   *
   * @returns {string}
   * @memberof TreeNode
   */
  toString(): string {
    return `[tree-node] data: ${JSON.stringify(
      this.data
    )}, meta: ${JSON.stringify(this.meta)}`;
  }
}
