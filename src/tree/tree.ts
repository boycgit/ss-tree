import {
  TreeNode,
  NodeOrNull,
  NodeLikeObject,
  NodeOrLikedOrNull
} from '../node/treenode';
import Comparator, { compareFunction } from 'ss-comparator';
import {
  map,
  traverse,
  find,
  getLevelInfo,
  toJSON,
  NodeHandler,
  NodeMapper,
  ChildAssigner,
  DEFAULT_ASSIGNER,
  TRAVERSE_TYPE,
  ConditionFunction
} from '../node/traverse';
import { isExist } from '../lib';

// condition function for get tree leaves
export const IsLeafCondition = function(node: NodeOrNull) {
  if (!node) {
    return false;
  } else {
    const children = node.children;
    // 子节点如果都是 null ，说明也是叶子节点
    const nullCount = children.reduce((count, currentNode) => {
      if (currentNode === null) {
        count += 1;
      }
      return count;
    }, 0);
    return children.length === 0 || children.length === nullCount || false;
  }
};

export const SizeHandler = function(node: TreeNode, lastResult: number = 0) {
  if (node) {
    lastResult += 1;
  }
  return lastResult;
};

export class Tree {
  _root: NodeOrNull;
  comparator: Comparator;
  constructor(data?, compare?: compareFunction) {
    let nodeData: NodeOrNull = null;
    // 支持入参是 node 的场景
    if (data instanceof TreeNode) {
      nodeData = data;
    } else if (isExist(data, false)) {
      nodeData = new TreeNode(data, compare);
    }
    this._root = nodeData;
    this.comparator = new Comparator(compare);
  }

  get compare(): compareFunction {
    return this.comparator.compare;
  }

  set compare(compare) {
    this.comparator = new Comparator(compare);
    // update all node's compare
    this.traverse((node: NodeOrNull) => {
      if (node && node.compare !== compare) {
        node.compare = compare;
      }
    });
  }

  get root(): NodeOrNull {
    return this._root;
  }
  set root(node: NodeOrNull) {
    this._root = node;
    // clear parent refer
    if (node) {
      node.parent = null;
    }
  }

  get isEmpty(): boolean {
    return this._root === null;
  }

  /**
   * construct tree from tree node
   * using deep clone method
   *
   * @static
   * @param {NodeOrNull} baseNode
   * @returns {Tree}
   * @memberof Tree
   */
  static fromNode(baseNode: NodeOrNull): Tree {
    const newRoot = map(baseNode, (node: NodeOrNull) => {
      return !!node ? node.clone() : null;
    });
    return new Tree(newRoot);
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
    const levelInfo = getLevelInfo(this.root);
    return levelInfo.depth;
  }

  /**
   * get per level nodes
   *
   * @readonly
   * @type {NodeOrLikedOrNull[][]}
   * @memberof Tree
   */
  get levels(): NodeOrLikedOrNull[][] {
    const levelInfo = getLevelInfo(this.root);
    return levelInfo.levels;
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
    return traverse(
      this._root,
      handler,
      traverseType,
      breakIfHandlerReturnTrue
    );
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
    const newRoot = map(this._root, mapper, disableParent, childrenAssigner);
    return new Tree(newRoot, this.compare);
  }

  /**
   * clone current tree
   *
   * @returns {Tree}
   * @memberof Tree
   */
  clone(): Tree {
    return this.map((node: NodeOrNull) => {
      return !!node ? node.clone() : null;
    });
  }

  /**
   * add node to tree
   * note: can only add to one parent, because one node only has one `parent` attribute
   *
   * @param {TreeNode} node - node want to add to current tree
   * @param {ConditionFunction} condition - node which satisfy the condition, as parent nodes
   * @param {TRAVERSE_TYPE} [traverseType=TRAVERSE_TYPE.BFS] - traverse type
   * @returns {Tree}
   * @memberof Tree
   */
  add(data: any): Tree;
  add(
    node: TreeNode,
    condition: ConditionFunction,
    traverseType: TRAVERSE_TYPE
  ): Tree;
  add(
    nodeOrData: TreeNode | any,
    condition?: ConditionFunction,
    traverseType?: TRAVERSE_TYPE
  ): Tree {
    const node =
      nodeOrData instanceof TreeNode
        ? nodeOrData
        : new TreeNode(nodeOrData, this.compare);

    // only condition is funciton, can do traverse
    // condition 不存在的情况，只是为了应付子类重载的场景
    if (typeof condition === 'function') {
      let handler = function(currentNode) {
        if (condition(currentNode)) {
          currentNode.add(node);
          return true;
        }
        return false;
      };
      // 遍历，添加完就完毕，不需要遍历完
      this.traverse(handler, traverseType, true);
    }

    return this;
  }

  /**
   * remove node from tree
   *
   * @param {ConditionFunction} condition - node which satisfy the condition, as parent nodes
   * @param {TRAVERSE_TYPE} [traverseType=TRAVERSE_TYPE.BFS] - traverse type
   * @returns {TreeNode[]}
   * @memberof Tree
   */
  remove(data: any): TreeNode[]; // 用于 BST 等子类的重载，直接根据 data 来查找数据
  remove(condition: ConditionFunction, traverseType: TRAVERSE_TYPE);
  remove(
    dataOrCondition: ConditionFunction | any,
    traverseType: TRAVERSE_TYPE = TRAVERSE_TYPE.BFS
  ): TreeNode[] {
    const nodes = this.find(dataOrCondition, traverseType);
    nodes.forEach(currentNode => {
      currentNode.remove();

      // 如果删除的是根节点，则让当前树置空
      if (currentNode === this._root) {
        this._root = null;
      }
    });

    return nodes;
  }

  /**
   * find node from tree
   *
   * @param {ConditionFunction | any} dataOrCondition - node which satisfy the condition, as parent nodes
   * @param {TRAVERSE_TYPE} [traverseType=TRAVERSE_TYPE.BFS] - traverse type
   * @returns {TreeNode[]}
   * @memberof Tree
   */
  find(data: any): TreeNode[]; // 用于 BST 等子类的重载，直接根据 data 来查找数据
  find(condition: ConditionFunction, traverseType: TRAVERSE_TYPE);
  find(
    dataOrCondition: ConditionFunction | any,
    traverseType: TRAVERSE_TYPE = TRAVERSE_TYPE.BFS
  ) {
    const condition =
      typeof dataOrCondition === 'function'
        ? dataOrCondition
        : function(node: TreeNode) {
            return node.data === dataOrCondition;
          };
    return find(this.root, condition, traverseType);
  }

  toString(): string {
    const { depth, levels } = getLevelInfo(this.root);
    let count = 0;
    const levelsData = levels.map(levels => {
      return levels.map(node => {
        if (node) {
          count++;
          return node.data;
        } else {
          return null;
        }
      });
    });
    return `[tree] tree: size: ${count}, depth: ${depth}
    \n tree level data: ${JSON.stringify(levelsData)}`;
  }

  toJSON(): NodeLikeObject {
    return toJSON(this.root);
  }
}
