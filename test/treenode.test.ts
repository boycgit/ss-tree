import { TreeNode } from '../src/node/treenode';
import * as Chance from 'chance';
import Comparator, { CompareResult } from 'ss-comparator';
const chance = new Chance();

describe('[TreeNode] 构造函数  - 构造函数', () => {
  test('默认无参，树的节点数据为空', () => {
    const node = new TreeNode();
    expect(node).toBeInstanceOf(TreeNode);
    expect(node.data).toBeUndefined();
    expect(node.parent).toBeNull();
    expect(node.meta).toEqual({});
    expect(node.children).toEqual([]);
    expect(node.comparator).toBeInstanceOf(Comparator);
  });

  test('可以传入数字或者字符串作为数据', () => {
    const data = chance.pickone([
      chance.string({ length: 5 }),
      chance.integer({ min: -20, max: 20 })
    ]);
    const node = new TreeNode(data);
    expect(node).toBeInstanceOf(TreeNode);
    expect(node.data).toBe(data);
    expect(node.parent).toBeNull();
    expect(node.meta).toEqual({});
    expect(node.children).toEqual([]);
    expect(node.comparator).toBeInstanceOf(Comparator);
  });
});

describe('[TreeNode] 方法 - setData', () => {
  test('空节点赋值', () => {
    const node = new TreeNode();
    node.setData('jack');
    expect(node).toBeInstanceOf(TreeNode);
    expect(node.data).toBe('jack');
    expect(node.parent).toBeNull();
    expect(node.meta).toEqual({});
  });
  test('可以链式更新数据', () => {
    const node = new TreeNode('jack');
    expect(node.data).toBe('jack');
    node.setData('jane').setData('david');
    expect(node.data).toBe('david');
  });
});

describe('[TreeNode] 方法 - clone 方法', () => {
  const david = {
    name: 'jack',
    gender: 'male',
    age: chance.age({ type: 'child' })
  };
  const jane = {
    name: 'jane',
    gender: 'female',
    age: chance.age({ type: 'adult' })
  };
  let node1, node2;
  beforeEach(() => {
    node1 = new TreeNode(david);
    node2 = new TreeNode(jane);
  });

  test('普通的赋值和 clone 的差别', () => {
    const node1New = node1;
    expect(node1New).toBe(node1);
    expect(node1New.data).toEqual(node1.data);

    const node1Clone = node1.clone();
    expect(node1Clone).not.toBe(node1);
    expect(node1Clone).toEqual(node1);
  });
  test('自定义 clone 时的处理函数', () => {
    node2.data.say = function(str: string) {
      console.log('say', this.name);
    };

    const clone1 = node2.clone();
    expect(clone1).not.toBe(node2);
    expect(clone1.data).not.toEqual(node2.data);
    expect(clone1.data.say).toBeUndefined();

    const cloneFn = function(node: TreeNode) {
      var newObj = {};
      for (let i in node) {
        newObj[i] = node[i];
      }
      return newObj;
    };
    const clone2 = node2.clone(cloneFn);
    expect(clone2).not.toBe(node2);
    expect(clone2.data).toEqual(node2.data);
    expect(clone2.data.say).toBeInstanceOf(Function);
  });
  test('如果 data 中保存的是不能 stringify 的对象（比如函数），则会返回引用', () => {
    const fn = function() {};
    const node = new TreeNode(fn);
    const nodeClone = node.clone();
    expect(nodeClone.data).toBe(fn);
  });
});

describe('[TreeNode] 属性 - depth 和 level 属性', () => {
  /*
 * create base tree for test
    creates this tree
    one
    ├── two
    │   ├── five
    │   └── six
    │       └── eight
    ├── three
    └── four
        └── seven
    
    */
  test('获取某个节点的深度和层级', () => {
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

    const root = new TreeNode(nodes[0]);

    root.add(nodes[1].add(nodes[4]).add(nodes[5].add(nodes[7])));
    root.add(nodes[2]);
    root.add(nodes[3].add(nodes[6]));

    expect(root.depth).toBe(0);
    expect(root.level).toBe(1);

    expect(nodes[1].depth).toBe(1);
    expect(nodes[1].level).toBe(2);

    expect(nodes[2].depth).toBe(1);
    expect(nodes[2].level).toBe(2);

    expect(nodes[3].depth).toBe(1);
    expect(nodes[3].level).toBe(2);

    expect(nodes[4].depth).toBe(2);
    expect(nodes[4].level).toBe(3);

    expect(nodes[5].depth).toBe(2);
    expect(nodes[5].level).toBe(3);

    expect(nodes[6].depth).toBe(2);
    expect(nodes[6].level).toBe(3);

    expect(nodes[7].depth).toBe(3);
    expect(nodes[7].level).toBe(4);
  });
});

describe('[TreeNode] 方法 - add 方法', () => {
  const david = {
    name: 'jack',
    gender: 'male',
    age: chance.age({ type: 'child' })
  };
  const jane = {
    name: 'jane',
    gender: 'female',
    age: chance.age({ type: 'adult' })
  };
  const jack = {
    name: 'jack',
    gender: 'male',
    age: chance.age({ type: 'senior' })
  };
  let node1, node2, node3;
  beforeEach(() => {
    node1 = new TreeNode(david);
    node2 = new TreeNode(jane);
    node3 = new TreeNode(jack);
  });

  test('添加子节点', () => {
    node1.add(node2);

    expect(node1.children.length).toBe(1);
    expect(node1.children[0]).toBe(node2);
    expect(node2.parent).toBe(node1);
  });
  test('可链式调用，添加子节点', () => {
    node1.add(node2).add(node3);

    expect(node1.children.length).toBe(2);
    expect(node1.children[0]).toBe(node2);
    expect(node1.children[1]).toBe(node3);
    expect(node2.parent).toBe(node1);
    expect(node3.parent).toBe(node1);
  });

  test('重复添加同一个子节点相当于只添加一次（这是因为子节点的 parent 只有一个）', () => {
    node1.add(node2);
    node1.add(node2);
    node1.add(node3);

    expect(node1.children.length).toBe(2);
    expect(node1.children[0]).toBe(node2);
    expect(node1.children[1]).toBe(node3);
    expect(node1.children[2]).toBeUndefined();
  });
});

describe('[TreeNode] 方法 - remove 方法', () => {
  const david = {
    name: 'jack',
    gender: 'male',
    age: chance.age({ type: 'child' })
  };
  const jane = {
    name: 'jane',
    gender: 'female',
    age: chance.age({ type: 'adult' })
  };
  const jack = {
    name: 'jack',
    gender: 'male',
    age: chance.age({ type: 'senior' })
  };
  let node1, node2, node3;
  beforeEach(() => {
    node1 = new TreeNode(david);
    node2 = new TreeNode(jane);
    node3 = new TreeNode(jack);
  });

  test('删除当前节点', () => {
    node1.add(node2);
    node1.add(node3);

    node3.remove();

    expect(node1.children.length).toBe(1);
    expect(node1.children[0]).toBe(node2);
    expect(node2.parent).toBe(node1);
    expect(node3.parent).toBeNull();
  });

  test('重复删除当前节点', () => {
    node1.add(node2);
    node1.add(node3);

    var count = chance.integer({ min: 2, max: 5 });
    for (let index = 0; index < count; index++) {
      node3.remove();
    }

    expect(node1.children.length).toBe(1);
    expect(node1.children[0]).toBe(node2);
    expect(node2.parent).toBe(node1);
    expect(node3.parent).toBeNull();
  });
});

describe('[TreeNode] 方法 - removeChild 方法', () => {
  test('删除不存在的子节点', () => {
    const node1 = new TreeNode('a');
    const node2 = new TreeNode('b');
    expect(node1.children.length).toBe(0);
    expect(node1.removeChild(node2)).toBeFalsy();
    expect(node1.children.length).toBe(0);
  });

  test('删除子节点', () => {
    const node1 = new TreeNode('a');
    const node2 = new TreeNode('b');
    node1.add(node2);

    expect(node1.children.length).toBe(1);

    expect(node1.removeChild(node2)).toBeTruthy();
    expect(node1.children.length).toBe(0);
  });

  describe('复杂数据情况下，最好指定 comparator', () => {
    const david = {
      name: 'jack',
      gender: 'male',
      age: chance.age({ type: 'child' })
    };
    const jane = {
      name: 'jane',
      gender: 'female',
      age: chance.age({ type: 'adult' })
    };
    const jack = {
      name: 'jack',
      gender: 'male',
      age: chance.age({ type: 'senior' })
    };
    const personComparator = function(a: TreeNode, b: TreeNode): CompareResult {
      return Comparator.defaultCompareFunction(a.data.name, b.data.name);
    };
    const comparator = new Comparator(personComparator);

    let node1, node2, node3;
    beforeEach(() => {
      node1 = new TreeNode(david);
      node2 = new TreeNode(jane);
      node3 = new TreeNode(jack);
    });

    test('因为是引用关系，可以判断等于成立的情况，不指定也能删除成功', () => {
      node1.add(node2);
      node1.add(node3);

      expect(node1.children.length).toBe(2);
      expect(node1.removeChild(node2)).toBeTruthy();
      expect(node1.children.length).toBe(1);
      expect(node1.removeChild(node3)).toBeTruthy();
      expect(node1.children.length).toBe(0);
    });
    test('指定自定义的 comparator，成功删除', () => {
      node1.comparator = comparator;
      node2.comparator = comparator;
      node3.comparator = comparator;

      node1.add(node2);
      node1.add(node3);

      expect(node1.children.length).toBe(2);
      expect(node1.removeChild(node2)).toBeTruthy();
      expect(node1.children.length).toBe(1);
      expect(node1.removeChild(node3)).toBeTruthy();
      expect(node1.children.length).toBe(0);
    });
    test('指定自定义的 comparator，成功删除', () => {
      node1 = new TreeNode(david, comparator);
      node2 = new TreeNode(jane, comparator);
      node3 = new TreeNode(jack, comparator);

      node1.add(node2);
      node1.add(node3);

      expect(node1.children.length).toBe(2);
      expect(node1.removeChild(node2)).toBeTruthy();
      expect(node1.children.length).toBe(1);
      expect(node1.removeChild(node3)).toBeTruthy();
      expect(node1.children.length).toBe(0);
    });
  });
});
