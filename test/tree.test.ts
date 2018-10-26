import { TreeNode } from '../src/node/treenode';
import { TRAVERSE_TYPE } from '../src/node/traverse';
import { Tree } from '../src/tree/tree';
import * as Chance from 'chance';
import Comparator from 'ss-comparator';
const chance = new Chance();

/*
 *
 * create base tree for test
    creates this tree
                        ┌───┐
                        │one│
                        └───┘
                          │
           ┌──────────────┼─────────────┐
           ▼              ▼             ▼
        ┌────┐         ┌─────┐       ┌────┐
        │two │         │three│       │four│
        └────┘         └─────┘       └────┘
          │                             │
   ┌──────┴─────┐                       ▼
   │            │                    ┌─────┐
   ▼            ▼                    │seven│
┌────┐       ┌────┐                  └─────┘
│five│       │six │
└────┘       └────┘
               │
               ▼
           ┌───────┐
           │ eight │
           └───────┘
    */

const BaseNodeFactory = function() {
  const nodes = [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight'
  ].map(tid => {
    return new TreeNode(tid);
  });

  const root = nodes[0];

  root.add(nodes[1].add(nodes[4]).add(nodes[5].add(nodes[7])));
  root.add(nodes[2]);
  root.add(nodes[3].add(nodes[6]));

  return nodes;
};

describe('[Tree] 构造函数  - 构造函数', () => {
  test('默认无参，为空树', () => {
    const tree = new Tree();
    expect(tree).toBeInstanceOf(Tree);
    expect(tree.root).toBeNull();
  });

  test('节点root.data 为 null的树，并不是空树', () => {
    const tree = new Tree(new TreeNode());
    expect(tree).toBeInstanceOf(Tree);
    expect(tree.root).toBeInstanceOf(TreeNode);

    const root = tree.root as TreeNode;
    expect(root.data).toBeUndefined();
    expect(root.parent).toBeNull();
    expect(root.meta).toEqual({});
    expect(root.children).toEqual([]);
    expect(root.comparator).toBeInstanceOf(Comparator);
  });

  test('可以传入数字或者字符串构造实例', () => {
    const data = chance.pickone([
      chance.string({ length: 5 }),
      chance.integer({ min: -20, max: 20 })
    ]);
    const tree = new Tree(data);
    expect(tree).toBeInstanceOf(Tree);
    expect(tree.root).toBeInstanceOf(TreeNode);

    const root = tree.root as TreeNode;
    expect(root.data).toBe(data);
    expect(root.parent).toBeNull();
    expect(root.meta).toEqual({});
    expect(root.children).toEqual([]);
    expect(root.comparator).toBeInstanceOf(Comparator);
  });

  test('可以用 treenode 构造实例', () => {
    const data = chance.pickone([
      chance.string({ length: 5 }),
      chance.integer({ min: -20, max: 20 })
    ]);

    const node = new TreeNode(data);
    const tree = new Tree(node);
    expect(tree).toBeInstanceOf(Tree);
    expect(tree.root).toBeInstanceOf(TreeNode);

    const root = tree.root as TreeNode;
    expect(root.data).toBe(data);
    expect(root.parent).toBeNull();
    expect(root.meta).toEqual({});
    expect(root.children).toEqual([]);
    expect(root.comparator).toBeInstanceOf(Comparator);
  });

  test('通过 fromNode 方法构造一颗树', () => {
    const nodes = BaseNodeFactory();
    const tree = Tree.fromNode(nodes[0]);

    expect(tree).toBeInstanceOf(Tree);
    const root = tree.root as TreeNode;
    expect(root.data).toBe('one');
    expect(root.children.length).toBe(3);
    expect((root.children[0] as TreeNode).data).toBe('two');
    expect((root.children[1] as TreeNode).data).toBe('three');
    expect((root.children[2] as TreeNode).data).toBe('four');

    expect(((root.children[0] as TreeNode).children[0] as TreeNode).data).toBe(
      'five'
    );
    expect(((root.children[0] as TreeNode).children[1] as TreeNode).data).toBe(
      'six'
    );

    expect(((root.children[2] as TreeNode).children[0] as TreeNode).data).toBe(
      'seven'
    );
    expect(
      (((root.children[0] as TreeNode).children[1] as TreeNode)
        .children[0] as TreeNode).data
    ).toBe('eight');
  });

  test('通过 fromNode 方法构造的是全新的一棵树', () => {
    const nodes = BaseNodeFactory();
    const tree1 = Tree.fromNode(nodes[0]);

    const tree2 = Tree.fromNode(nodes[0]);

    expect(tree1).toBeInstanceOf(Tree);
    expect(tree2).toBeInstanceOf(Tree);

    const root1 = tree1.root as TreeNode;
    const root2 = tree2.root as TreeNode;
    expect(root1.data).toBe('one');
    expect(root2.data).toBe('one');
    expect(root1).not.toBe(root2);

    expect(root1.children.length).toBe(3);
    expect(root2.children.length).toBe(3);
  });

  test('给空树的 root 属性赋值获得新的树', () => {
    const nodes = BaseNodeFactory();
    const tree = new Tree();
    tree.root = nodes[0];
    expect(tree).toBeInstanceOf(Tree);
    const root = tree.root as TreeNode;
    expect(root.data).toBe('one');
    expect(root.children.length).toBe(3);
  });
});

describe('[Tree] 属性  - leaves 表示叶子节点列表', () => {
  let nodes, tree;
  beforeEach(() => {
    nodes = BaseNodeFactory();
    tree = Tree.fromNode(nodes[0]);
  });
  test('空树的 leaves 属性', () => {
    const emptyTree = new Tree();
    expect(emptyTree.leaves).toEqual([]);
  });
  test('只有 root 树的 leaves 属性', () => {
    const tree1 = new Tree('ten');
    expect(tree1.leaves.map(leaf => leaf.data)).toEqual(['ten']);
    expect(tree1.size).toBe(1);
  });
  test('普通树的 leaves 属性', () => {
    // 测试 leaves 属性
    expect(tree.leaves.length).toBe(4);
    const datas = tree.leaves.map(leaf => leaf.data);
    expect(datas).toContain('three');
    expect(datas).toContain('five');
    expect(datas).toContain('seven');
    expect(datas).toContain('eight');
  });

  test('获取子树的 leaves 属性', () => {
    const subTree = Tree.fromNode(nodes[2]);
    // 单独节点就是叶子节点
    expect(subTree.leaves.length).toBe(1);
    expect(subTree.leaves.map(leaf => leaf.data)).toContain('three');

    const subTree2 = Tree.fromNode(nodes[3]);
    // 有子节点
    expect(subTree2.leaves.length).toBe(1);
    expect(subTree2.leaves.map(leaf => leaf.data)).toContain('seven');
  });
});

describe('[Tree] 属性  - depth 表示树的深度', () => {
  let nodes, tree;
  beforeEach(() => {
    nodes = BaseNodeFactory();
    tree = Tree.fromNode(nodes[0]);
  });
  test('空树的 depth 属性', () => {
    const emptyTree = new Tree();
    expect(emptyTree.depth).toBe(0);
  });
  test('普通树的 depth 属性', () => {
    nodes = BaseNodeFactory();
    tree = Tree.fromNode(nodes[0]);
    // 测试 leaves 属性
    expect(tree.depth).toBe(3);
  });

  test('获取子树的 depth 属性', () => {
    const subTree = Tree.fromNode(nodes[3]);
    expect(subTree.depth).toBe(1);
  });
});

describe('[Tree] 属性  - size 表示树节点的个数', () => {
  let nodes, tree;
  beforeEach(() => {
    nodes = BaseNodeFactory();
    tree = Tree.fromNode(nodes[0]);
  });
  test('空树的 size 属性', () => {
    const emptyTree = new Tree();
    expect(emptyTree.size).toBe(0);
  });
  test('普通树 size 属性', () => {
    nodes = BaseNodeFactory();
    tree = Tree.fromNode(nodes[0]);
    // 测试 leaves 属性
    expect(tree.size).toBe(8);
  });

  test('获取子树的 size 属性', () => {
    const subTree = Tree.fromNode(nodes[3]);
    expect(subTree.size).toBe(2);
  });
});

describe('[Tree] 方法  - traverse 方法', () => {
  let nodes, tree;
  beforeEach(() => {
    nodes = BaseNodeFactory();
    tree = Tree.fromNode(nodes[0]);
  });

  test('空树的 BFS 和 DFS 遍历，不会执行 handler 函数', () => {
    const emptyTree = new Tree();
    const mockFn = jest.fn();

    expect(emptyTree.traverse(mockFn)).toBeUndefined();
    expect(mockFn).not.toHaveBeenCalled();

    expect(emptyTree.traverse(mockFn, TRAVERSE_TYPE.DFS)).toBeUndefined();
    expect(mockFn).not.toHaveBeenCalled();
  });

  test('BFS 方法遍历', () => {
    var handler = function(node: TreeNode, lastResult: string[] = []) {
      lastResult.push(node.data);
      return lastResult;
    };

    expect(tree.traverse(handler)).toEqual([
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight'
    ]);
  });
  test('BFS 方法遍历，可以提前停止遍历', () => {
    const result: string[] = [];
    var handler = function(node: TreeNode, lastResult: boolean) {
      result.push(node.data);

      lastResult = node.data === 'five';
      return lastResult;
    };
    tree.traverse(handler, TRAVERSE_TYPE.BFS, true);
    expect(result).toEqual(['one', 'two', 'three', 'four', 'five']);
  });

  test('DFS 方法遍历', () => {
    var handler = function(node: TreeNode, lastResult: string[] = []) {
      lastResult.push(node.data);
      return lastResult;
    };

    expect(tree.traverse(handler, TRAVERSE_TYPE.DFS)).toEqual([
      'one',
      'two',
      'five',
      'six',
      'eight',
      'three',
      'four',
      'seven'
    ]);
  });

  test('DFS 方法遍历, 可以提前停止遍历', () => {
    const result: string[] = [];
    var handler = function(node: TreeNode, lastResult: boolean) {
      result.push(node.data);
      lastResult = node.data === 'five';
      return lastResult;
    };
    tree.traverse(handler, TRAVERSE_TYPE.DFS, true);
    expect(result).toEqual(['one', 'two', 'five']);
  });
});

describe('[Tree] 方法  - map 方法', () => {
  let nodes, tree;
  beforeEach(() => {
    nodes = BaseNodeFactory();
    tree = Tree.fromNode(nodes[0]);
  });

  test('空树 map 生成另一棵空树', () => {
    const emptyTree = new Tree();
    const mapper = function(node: TreeNode) {
      return new TreeNode(node.data + '3');
    };

    const newTree = emptyTree.map(mapper);
    expect(newTree.isEmpty).toBeTruthy();
  });

  test('根据 map 映射生成另一棵树', () => {
    const mapper = function(node: TreeNode) {
      return new TreeNode(node.data + '3');
    };

    const newTree = tree.map(mapper);
    var handler = function(node: TreeNode, lastResult: string[] = []) {
      lastResult.push(node.data);
      return lastResult;
    };

    expect(newTree.traverse(handler)).toEqual([
      'one3',
      'two3',
      'three3',
      'four3',
      'five3',
      'six3',
      'seven3',
      'eight3'
    ]);
  });

  test('根据 map 映射生成另一棵树, disableParent 用于设置新树的 parent 属性', () => {
    const mapper = function(node: TreeNode) {
      return new TreeNode(node.data + '2');
    };

    const newTree = tree.map(mapper, true);
    var handler = function(node: TreeNode, lastResult: string[] = []) {
      lastResult.push(node.data);
      return lastResult;
    };

    expect(newTree.traverse(handler)).toEqual([
      'one2',
      'two2',
      'three2',
      'four2',
      'five2',
      'six2',
      'seven2',
      'eight2'
    ]);

    expect(newTree.root.children[0].parent).toBeNull();
    expect(newTree.root.children[1].parent).toBeNull();
    expect(newTree.root.children[2].parent).toBeNull();
  });
});

describe('[Tree] 方法  - map 方法', () => {
  let nodes, tree;
  beforeEach(() => {
    nodes = BaseNodeFactory();
    tree = Tree.fromNode(nodes[0]);
  });

  test('clone 生成另一棵树', () => {
    const tree2 = tree.clone();

    expect(tree).toBeInstanceOf(Tree);
    expect(tree2).toBeInstanceOf(Tree);

    const root1 = tree.root as TreeNode;
    const root2 = tree2.root as TreeNode;
    expect(root1.data).toBe('one');
    expect(root2.data).toBe('one');
    expect(root1).not.toBe(root2);

    expect(root1.children.length).toBe(3);
    expect(root2.children.length).toBe(3);
  });
});

describe('[Tree] 方法  - add 方法', () => {
  let nodes, tree;
  beforeEach(() => {
    nodes = BaseNodeFactory();
    tree = Tree.fromNode(nodes[0]);
  });

  test('根据 conditaion 函数添加节点，返回父节点', () => {
    const node9 = new TreeNode('nine');
    const condition = function(node: TreeNode) {
      return node.data === 'eight';
    };

    const parent = tree.add(node9, condition);

    expect(parent).toBeInstanceOf(TreeNode);
    expect(parent.data).toBe('eight');
    expect(tree.size).toBe(9);
    expect(tree.depth).toBe(4);
  });

  test('不会重复添加同一个节点', () => {
    const node9 = new TreeNode('nine');
    const condition = function(node: TreeNode) {
      return node.data === 'eight';
    };

    const parent1 = tree.add(node9, condition);
    const parent2 = tree.add(node9, condition, TRAVERSE_TYPE.DFS);

    expect(parent1).toBe(parent2);
    expect(parent1).toBeInstanceOf(TreeNode);
    expect(parent1.data).toBe('eight');
    expect(tree.size).toBe(9);
    expect(tree.depth).toBe(4);
  });
  test('条件不符合时，不会添加节点', () => {
    const node9 = new TreeNode('nine');
    const condition = function(node: TreeNode) {
      return node.data === 'ten';
    };

    const parent = tree.add(node9, condition);

    expect(parent).toBeNull();
    expect(tree.size).toBe(8);
    expect(tree.depth).toBe(3);
  });
});

describe('[Tree] 方法  - find 方法', () => {
  let nodes, tree;
  beforeEach(() => {
    nodes = BaseNodeFactory();
    tree = Tree.fromNode(nodes[0]);
  });

  test('返回满足条件的所有节点集合', () => {
    const condition = function(node: TreeNode) {
      return node.data.length === 3;
    };
    const nodes1 = tree.find(condition);
    const nodes2 = tree.find(condition, TRAVERSE_TYPE.DFS);

    expect(nodes1).toEqual(nodes2);
    expect(nodes1.length).toBe(3);
    expect(nodes1).toContainEqual(nodes[0]);
    expect(nodes1).toContainEqual(nodes[1]);
    expect(nodes1).toContainEqual(nodes[5]);
  });

  test('没有满足节点的，返回空数组', () => {
    const condition = function(node: TreeNode) {
      return node.data.length === 10;
    };
    const nodes = tree.find(condition);

    expect(nodes).toEqual([]);
    expect(nodes.length).toBe(0);
  });
});

describe('[Tree] 方法  - remove 方法', () => {
  let nodes, tree;
  beforeEach(() => {
    nodes = BaseNodeFactory();
    tree = Tree.fromNode(nodes[0]);
  });

  test('删除满足条件的所有节点，并返回这些节点的集合', () => {
    const condition = function(node: TreeNode) {
      return node.data.length === 4;
    };
    const nodes = tree.remove(condition);

    const datas = nodes.map(l => {
      expect(l.parent).toBeNull();
      return l.data;
    });
    expect(datas.length).toBe(2);
    expect(datas).toContain('four');
    expect(datas).toContain('five');

    expect(tree.size).toBe(5);
  });

  test('删除根节点后，变成空树', () => {
    const condition = function(node: TreeNode) {
      return node.data.length === 3;
    };
    const nodes1 = tree.remove(condition);

    const datas = nodes1.map(l => {
      expect(l.parent).toBeNull();
      return l.data;
    });
    expect(datas.length).toBe(3);
    expect(datas).toContain('one');
    expect(datas).toContain('two');
    expect(datas).toContain('six');

    expect(tree.size).toBe(0);
  });

  test('没有满足节点的，返回空数组', () => {
    const condition = function(node: TreeNode) {
      return node.data.length === 3;
    };
    const nodes1 = tree.remove(condition, TRAVERSE_TYPE.DFS);

    const datas = nodes1.map(l => {
      expect(l.parent).toBeNull();
      return l.data;
    });
    expect(datas.length).toBe(3);
    expect(datas).toContain('one');
    expect(datas).toContain('two');
    expect(datas).toContain('six');

    const nodes2 = tree.find(condition);
    expect(nodes2).toEqual([]);
  });
});

describe('[Tree] 异常  - 抛出异常的情况', () => {
  let nodes, tree;
  beforeEach(() => {
    nodes = BaseNodeFactory();
    tree = Tree.fromNode(nodes[0]);
  });
  test('map 方法， mapper 参数必须是函数', () => {
    expect(() => {
      tree.map(chance.string({ length: 5 }));
    }).toThrowError('should be function');
  });
  test('add 方法， node 参数必须是 TreeNode 类型', () => {
    expect(() => {
      tree.add(chance.string({ length: 5 }));
    }).toThrowError('should be tree-node instance');
  });
});

describe('[Tree] 边界测试  - 空节点', () => {
  /*
 *
 * 带有 null 节点的 树 结构如下
                            ┌───┐
                            │one│
                            └───┘
                              │
            ┌─────────────────┼─────────────┐
            ▼                 ▼             ▼
         ┌────┐            ┌─────┐       ┌────┐
         │two │            │three│       │four│
         └────┘            └─────┘       └────┘
            │                 │             │
   ┌────────┼────────┐        ▼             ▼
   │        │        │    ┌──────┐       ┌─────┐
   ▼        ▼        ▼    │█null█│       │seven│
┌────┐  ┌──────┐  ┌────┐  └──────┘       └─────┘
│five│  │█null█│  │six │
└────┘  └──────┘  └────┘
                     │
                     ▼
                 ┌───────┐
                 │ eight │
                 └───────┘
    */
  let nodes, tree;
  beforeEach(() => {
    nodes = BaseNodeFactory();
    nodes[1].children.splice(1, 0, null);
    nodes[2].children.push(null);
    tree = Tree.fromNode(nodes[0]);
  });
  test('null 节点并不计算在真实节点中', () => {
    const datas = tree.leaves.map(l => l.data);
    expect(tree.size).toBe(8);
    expect(tree.depth).toBe(3);
    expect(datas.length).toBe(4);
    expect(datas).toEqual(['three', 'five', 'seven', 'eight']);
  });

  test('clone 函数会保留 null 节点', () => {
    const cloneTree = tree.clone();
    expect(cloneTree.size).toBe(8);
    expect(cloneTree.depth).toBe(3);
    const root = cloneTree.root;
    expect((root.children[0] as TreeNode).children.length).toBe(3);
    expect((root.children[0] as TreeNode).children[1]).toBeNull();
    expect((root.children[1] as TreeNode).children.length).toBe(1);
    expect((root.children[1] as TreeNode).children[0]).toBeNull();
  });
});
