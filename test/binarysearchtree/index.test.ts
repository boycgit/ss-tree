import { BinaryTreeNode } from '../../src/node/binarytreenode';
import { BinarySearchTree } from '../../src/binary-search-tree/index';
import { Tree } from '../../src/tree/tree';
import * as Chance from 'chance';
const chance = new Chance();

describe('[BinarySearchTree] 构造函数 - 构造函数', () => {
  it('默认构造出来的树，root 是 null 节点', () => {
    const tree = new BinarySearchTree();
    expect(tree).toBeInstanceOf(BinarySearchTree);
    expect(tree).toBeInstanceOf(Tree);
    expect(tree.root).toBeNull();
  });

  it('传入参数构造出来的树，root 是有数据的', () => {
    const tree = new BinarySearchTree(6);
    expect(tree).toBeInstanceOf(BinarySearchTree);
    expect(tree).toBeInstanceOf(Tree);
    expect(tree.root).not.toBeNull();
    expect((tree.root as BinaryTreeNode).data).toBe(6);
  });
});

describe('[BinarySearchTree] 方法 - add 方法', () => {
  it('空树插入数据，变成根节点', () => {
    const tree = new BinarySearchTree();
    tree.add(6);
    expect(tree.root).not.toBeNull();
    expect((tree.root as BinaryTreeNode).data).toBe(6);
  });

  it('根节点如果为 null 值，先修改根节点', () => {
    const tree = new BinarySearchTree(new BinaryTreeNode());
    tree.add(6);
    expect(tree.root).not.toBeNull();
    expect((tree.root as BinaryTreeNode).data).toBe(6);
  });

  it('如果数据比当前小，往左边添加节点', () => {
    const tree = new BinarySearchTree(6);
    tree.add(4);

    const root = tree.root as BinaryTreeNode;

    expect(root).not.toBeNull();
    expect(root.data).toBe(6);
    expect((root.left as BinaryTreeNode).data).toBe(4);
    expect(root.right).toBeNull();
  });

  it('如果数据比当前大，往右边添加节点', () => {
    const tree = new BinarySearchTree(6);
    tree.add(7);

    const root = tree.root as BinaryTreeNode;

    expect(root).not.toBeNull();
    expect(root.data).toBe(6);
    expect(root.left).toBeNull();
    expect((root.right as BinaryTreeNode).data).toBe(7);
  });

  it('如果节点数据已经存在，则不更新', () => {
    const tree = new BinarySearchTree(6);
    tree.add(6);

    const root = tree.root as BinaryTreeNode;

    expect(root).not.toBeNull();
    expect(root.data).toBe(6);
    expect(root.left).toBeNull();
    expect(root.right).toBeNull();
  });

  it('可以链式调用', () => {
    const tree = new BinarySearchTree(6);
    tree.add(4).add(7);
    const root = tree.root as BinaryTreeNode;

    expect(root.data).toBe(6);
    expect((root.left as BinaryTreeNode).data).toBe(4);
    expect((root.right as BinaryTreeNode).data).toBe(7);
  });

  it('插入多个数据', () => {
    const tree = new BinarySearchTree(6);
    tree
      .add(4)
      .add(7)
      .add(2)
      .add(5)
      .add(8);
    const root = tree.root as BinaryTreeNode;

    expect(root.data).toBe(6);
    expect((root.left as BinaryTreeNode).data).toBe(4);
    expect((root.right as BinaryTreeNode).data).toBe(7);
    expect('' + tree).toContain('[[6],[4,7],[2,5,null,8]]');
  });
});

describe('[BinarySearchTree] 方法 - find 方法', () => {
  let tree;
  beforeEach(() => {
    tree = new BinarySearchTree(6);
    tree
      .add(4)
      .add(7)
      .add(2)
      .add(5)
      .add(8);
  });

  it('找到指定的元素', () => {
    const targetValue = chance.pick([2, 4, 5, 6, 7, 8]);
    const nodes = tree.find(targetValue);
    expect(nodes.length).toBe(1);
    expect(nodes[0].data).toBe(targetValue);
  });

  it('不包含指定的数据', () => {
    const data = chance.integer({ min: 10, max: 20 });
    const nodes = tree.find(data);
    expect(nodes.length).toBe(0);
  });
});

describe('[BinarySearchTree] 方法 - contains 方法', () => {
  let tree;
  beforeEach(() => {
    tree = new BinarySearchTree(6);
    tree
      .add(4)
      .add(7)
      .add(2)
      .add(5)
      .add(8);
  });

  it('包含指定的数据', () => {
    expect(tree.contains(2)).toBeTruthy();
    expect(tree.contains(4)).toBeTruthy();
    expect(tree.contains(5)).toBeTruthy();
    expect(tree.contains(6)).toBeTruthy();
    expect(tree.contains(7)).toBeTruthy();
    expect(tree.contains(8)).toBeTruthy();
  });

  it('不包含指定的数据', () => {
    const data = chance.integer({ min: 10, max: 20 });
    expect(tree.contains(data)).toBeFalsy();
  });
});

// see https://www.geeksforgeeks.org/binary-search-tree-set-2-delete/
describe('[BinarySearchTree] 方法 - remove 方法', () => {
  let tree;
  beforeEach(() => {
    tree = new BinarySearchTree(44);
    tree
      .add(17)
      .add(88)
      .add(32)
      .add(65)
      .add(97)
      .add(28)
      .add(54)
      .add(82)
      .add(29)
      .add(76)
      .add(80)
      .add(78);
  });

  it('0 删除不存在的节点', () => {
    const targetData = chance.integer({ min: 100, max: 200 });
    let nodes = tree.remove(targetData);
    expect(nodes.length).toBe(0);
    expect(tree.size).toBe(13);
    expect(tree.depth).toBe(6);
  });

  it('1 删除叶子节点', () => {
    expect(tree.find(28)[0].right).not.toBeNull();
    let nodes = tree.remove(29);
    expect(nodes.length).toBe(1);
    expect(nodes[0].data).toBe(29);
    expect(tree.contains(29)).toBeFalsy();
    expect(tree.size).toBe(12);
    expect(tree.depth).toBe(6);
    expect(tree.find(28)[0].right).toBeNull();

    expect(tree.find(80)[0].left).not.toBeNull();
    nodes = tree.remove(78);
    expect(nodes.length).toBe(1);
    expect(nodes[0].data).toBe(78);
    expect(tree.contains(78)).toBeFalsy();
    expect(tree.size).toBe(11);
    expect(tree.depth).toBe(5);
    expect(tree.find(80)[0].left).toBeNull();
  });

  it('2 删除单叶节点', () => {
    expect(tree.find(17)[0].right.data).toBe(32);
    let nodes = tree.remove(32);
    expect(nodes.length).toBe(1);
    expect(nodes[0].data).toBe(32);
    expect(tree.contains(32)).toBeFalsy();
    expect(tree.size).toBe(12);
    expect(tree.depth).toBe(6);
    expect(tree.find(17)[0].right.data).toBe(28);

    expect(tree.find(82)[0].left.data).toBe(76);
    nodes = tree.remove(76);
    expect(nodes.length).toBe(1);
    expect(nodes[0].data).toBe(76);
    expect(tree.contains(76)).toBeFalsy();
    expect(tree.size).toBe(11);
    expect(tree.depth).toBe(5);
    expect(tree.find(82)[0].left.data).toBe(80);
  });

  it('3.1 删除双叶节点，右树最小值不是右节点', () => {
    expect(tree.find(88)[0].left.data).toBe(65);
    let nodes = tree.remove(65);
    expect(nodes.length).toBe(1);
    expect(nodes[0].data).toBe(65);
    expect(tree.contains(65)).toBeFalsy();
    expect(tree.size).toBe(12);
    expect(tree.depth).toBe(5);
    expect(tree.find(88)[0].left.data).toBe(76);
  });
  it('3.2 删除双叶节点，右树最小值是右节点', () => {
    expect(tree.find(44)[0].right.data).toBe(88);
    let nodes = tree.remove(88);
    expect(nodes.length).toBe(1);
    expect(nodes[0].data).toBe(88);
    expect(tree.contains(88)).toBeFalsy();
    expect(tree.size).toBe(12);
    expect(tree.depth).toBe(6);
    expect(tree.find(44)[0].right.data).toBe(97);
  });

  describe('删除根节点', () => {
    it('第一种情况, 删除叶子节点', () => {
      const tree = new BinarySearchTree(44);
      let nodes = tree.remove(44);
      expect(nodes.length).toBe(1);
      expect(nodes[0].data).toBe(44);
      expect(tree.contains(44)).toBeFalsy();
      expect(tree.size).toBe(0);
      expect(tree.depth).toBe(0);
    });

    it('第二种情况, 删除单节点', () => {
      const tree = new BinarySearchTree(44);
      const data = chance.pick([17, 88]);
      tree.add(data);
      expect((tree.root as BinaryTreeNode).data).toBe(44);
      let nodes = tree.remove(44);
      expect(nodes.length).toBe(1);
      expect(nodes[0].data).toBe(44);
      expect(tree.contains(44)).toBeFalsy();
      expect(tree.size).toBe(1);
      expect(tree.depth).toBe(0);
      expect((tree.root as BinaryTreeNode).data).toBe(data);
    });

    it('第三种情况, 删除双节点', () => {
      const tree = new BinarySearchTree(44);
      tree.add(17).add(88);
      expect((tree.root as BinaryTreeNode).data).toBe(44);
      let nodes = tree.remove(44);
      expect(nodes.length).toBe(1);
      expect(nodes[0].data).toBe(44);
      expect(tree.contains(44)).toBeFalsy();
      expect(tree.size).toBe(2);
      expect(tree.depth).toBe(1);
      expect((tree.root as BinaryTreeNode).data).toBe(88);
    });
  });
});
