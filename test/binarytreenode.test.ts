import { BinaryTreeNode } from '../src/node/binarytreenode';
import { DFS, DFS_ORDER_TYPE } from '../src/node/traverse';
// import * as Chance from 'chance';
// import Comparator, { CompareResult } from 'ss-comparator';
// const chance = new Chance();

/*
 *
 * create base binary tree for test
    creates this tree
                ┌───┐
                │ 1 │
                └───┘
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
     ┌───┐                 ┌───┐
     │ 2 │                 │ 3 │
     └───┘                 └───┘
       │                     │
  ┌────┴─────┐           ┌───┴────┐
  ▼          ▼           ▼        ▼
┌───┐    ┌──────┐    ┌──────┐   ┌───┐
│ 4 │    │█null█│    │█null█│   │ 5 │
└───┘    └──────┘    └──────┘   └───┘
  │
  └────┐
       ▼
     ┌───┐
     │ 6 │
     └───┘
       │
  ┌────┴────┐
  ▼         ▼
┌───┐     ┌───┐
│ 7 │     │ 8 │
└───┘     └───┘


    */

const BaseNodeFactory = function() {
  const nodes = [1, 2, 3, 4, 5, 6, 7, 8].map(tid => {
    return new BinaryTreeNode(tid);
  });

  const root = nodes[0];

  root.setLeft(nodes[1]).setRight(nodes[2]);
  nodes[1].setLeft(nodes[3]);
  nodes[2].setRight(nodes[4]);
  nodes[3].setRight(nodes[5]);
  nodes[5].setLeft(nodes[6]).setRight(nodes[7]);
  return nodes;
};

describe('[BinaryTreeNode] 构造函数 - 构造函数', () => {
  it('默认构造函数里的数据是 null', () => {
    const node = new BinaryTreeNode();

    expect(node).toBeDefined();
    expect(node.data).toBeUndefined();
    expect(node.left).toBeNull();
    expect(node.right).toBeNull();
  });
});

describe('[BinaryTreeNode] 方法 - 添加子节点', () => {
  test('禁止直接调用 add 方法', () => {
    const leftNode = new BinaryTreeNode(1);
    const rootNode = new BinaryTreeNode(2);
    expect(() => {
      rootNode.add(leftNode);
    }).toThrowError('`add` function was disabled in BinaryNode');
  });

  test('setLeft 和 setRight 方法添加子节点', () => {
    const leftNode = new BinaryTreeNode(1);
    const rightNode = new BinaryTreeNode(3);
    const rootNode = new BinaryTreeNode(2);

    rootNode.setLeft(leftNode).setRight(rightNode);

    expect(rootNode.data).toBe(2);
    expect((rootNode.left as BinaryTreeNode).data).toBe(1);
    expect((rootNode.right as BinaryTreeNode).data).toBe(3);
  });

  test('setLeft 和 setRight 方法添加子节点后，原节点应该脱离', () => {
    const leftNode = new BinaryTreeNode(1);
    const rightNode = new BinaryTreeNode(3);
    const rootNode = new BinaryTreeNode(2);
    const node4 = new BinaryTreeNode(4);
    const node5 = new BinaryTreeNode(5);

    rootNode.setLeft(leftNode).setRight(rightNode);

    expect(rootNode.data).toBe(2);
    expect((rootNode.left as BinaryTreeNode).data).toBe(1);
    expect((rootNode.right as BinaryTreeNode).data).toBe(3);

    expect(leftNode.parent).toBe(rootNode);
    expect(rightNode.parent).toBe(rootNode);
    expect(node4.parent).toBeNull();
    expect(node5.parent).toBeNull();

    rootNode.setLeft(node4).setRight(node5);
    expect(rootNode.data).toBe(2);
    expect((rootNode.left as BinaryTreeNode).data).toBe(4);
    expect((rootNode.right as BinaryTreeNode).data).toBe(5);

    expect(leftNode.parent).toBeNull();
    expect(rightNode.parent).toBeNull();
    expect(node4.parent).toBe(rootNode);
    expect(node5.parent).toBe(rootNode);
  });

  it('检查 parent 属性', () => {
    const leftNode = new BinaryTreeNode(1);
    const rightNode = new BinaryTreeNode(3);
    const rootNode = new BinaryTreeNode(2);

    rootNode.setLeft(leftNode).setRight(rightNode);

    expect(rootNode.parent).toBeNull();
    expect(
      ((rootNode.left as BinaryTreeNode).parent as BinaryTreeNode).data
    ).toBe(2);
    expect(
      ((rootNode.right as BinaryTreeNode).parent as BinaryTreeNode).data
    ).toBe(2);
    expect((rootNode.right as BinaryTreeNode).parent).toEqual(rootNode);
  });
});

describe('[BinaryTreeNode] 方法 - removeChild 方法', () => {
  it('should remove child node', () => {
    const leftNode = new BinaryTreeNode(1);
    const rightNode = new BinaryTreeNode(3);
    const rootNode = new BinaryTreeNode(2);

    rootNode.setLeft(leftNode).setRight(rightNode);

    expect(rootNode.removeChild(rootNode.left)).toBe(true);
    expect(rootNode.left).toBeNull();
    expect(rootNode.right).toBe(rightNode);

    expect(rootNode.removeChild(rootNode.right)).toBe(true);
    expect(rootNode.left).toBeNull();
    expect(rootNode.right).toBeNull();

    expect(rootNode.removeChild(rootNode.right)).toBe(false);
    expect(rootNode.left).toBeNull();
    expect(rootNode.right).toBeNull();
  });
});

describe('[BinaryTreeNode] 属性 - height、uncle 属性', () => {
  let nodes, root;
  beforeEach(() => {
    nodes = BaseNodeFactory();
    root = nodes[0];
  });

  test('节点 height 值', () => {
    expect(root.height).toBe(4);
    expect(root.leftHeight).toBe(4);
    expect(root.rightHeight).toBe(2);
    expect(root.balanceFactor).toBe(2);

    expect(nodes[1].height).toBe(3);
    expect(nodes[1].leftHeight).toBe(3);
    expect(nodes[1].rightHeight).toBe(0);
    expect(nodes[1].balanceFactor).toBe(3);

    expect(nodes[2].height).toBe(1);
    expect(nodes[2].leftHeight).toBe(0);
    expect(nodes[2].rightHeight).toBe(1);
    expect(nodes[2].balanceFactor).toBe(-1);

    expect(nodes[3].height).toBe(2);
    expect(nodes[3].leftHeight).toBe(0);
    expect(nodes[3].rightHeight).toBe(2);
    expect(nodes[3].balanceFactor).toBe(-2);

    expect(nodes[4].height).toBe(0);
    expect(nodes[4].leftHeight).toBe(0);
    expect(nodes[4].rightHeight).toBe(0);
    expect(nodes[4].balanceFactor).toBe(0);

    expect(nodes[5].height).toBe(1);
    expect(nodes[5].leftHeight).toBe(1);
    expect(nodes[5].rightHeight).toBe(1);
    expect(nodes[5].balanceFactor).toBe(0);

    expect(nodes[6].height).toBe(0);
    expect(nodes[6].leftHeight).toBe(0);
    expect(nodes[6].rightHeight).toBe(0);
    expect(nodes[6].balanceFactor).toBe(0);

    expect(nodes[7].height).toBe(0);
    expect(nodes[7].leftHeight).toBe(0);
    expect(nodes[7].rightHeight).toBe(0);
    expect(nodes[7].balanceFactor).toBe(0);
  });

  test('节点 uncle 属性', () => {
    expect(root.uncle).toBeNull();
    expect(nodes[1].uncle).toBeNull();
    expect(nodes[2].uncle).toBeNull();
    expect(nodes[3].uncle).toBe(nodes[2]);
    expect(nodes[4].uncle).toBe(nodes[1]);
    expect(nodes[5].uncle).toBeNull();
    expect(nodes[6].uncle).toBeNull();
    expect(nodes[7].uncle).toBeNull();
  });
});

describe('[BinaryTreeNode] DFS - 前序、中序、后序遍历', () => {
  let nodes, root;
  const hander = function(node: BinaryTreeNode, lastResult: number[] = []) {
    if (!!node) {
      lastResult.push(node.data);
    }
    return lastResult;
  };
  beforeEach(() => {
    nodes = BaseNodeFactory();
    root = nodes[0];
  });

  test('前序遍历', () => {
      expect(DFS(root, hander, false, DFS_ORDER_TYPE.PRE)).toEqual([1, 2, 4, 6, 7, 8, 3, 5]);
  });
  test('中序遍历', () => {
      expect(DFS(root, hander, false, DFS_ORDER_TYPE.IN)).toEqual([4, 7, 6, 8, 2, 1, 3, 5]);
  });
  test('后序遍历', () => {
      expect(DFS(root, hander, false, DFS_ORDER_TYPE.POST)).toEqual([7, 8, 6, 4, 2, 5, 3, 1]);
  });
});
