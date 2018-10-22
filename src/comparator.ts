/**
 * enumeration of compare result, there is only three state
 *
 * @export
 * @enum {number}
 */
export enum CompareResult {
    EQUAL = 0,
    GREATER = 1,
    LESS = -1
}

type normalOperand = string | number;

export type compareFunction = (x: any, y: any) => CompareResult;

/**
 * a class that describe how compares two object
 *
 * @export
 * @class Comparator
 */
export default class Comparator {
    compare: compareFunction;

    /**
     * Creates an instance of Comparator.
     * @param {compareFunction} compareFunction - function that implement compare operation
     * @memberof Comparator
     */
    constructor(compareFunction?: compareFunction) {
        this.compare = compareFunction || Comparator.defaultCompareFunction;
    }

    /**
     * @param {(string|number)} a - compare target a
     * @param {(string|number)} b - compare target b
     * @returns {number}
     */
    static defaultCompareFunction(
        a: normalOperand,
        b: normalOperand
    ): CompareResult {
        if (a === b) {
            return CompareResult.EQUAL;
        }

        return a < b ? CompareResult.LESS : CompareResult.GREATER;
    }

    /**
     * compare if equal or not, a === b
     *
     * @param {*} a
     * @param {*} b
     * @returns {boolean}
     * @memberof Comparator
     */
    equal(a, b): boolean {
        return this.compare(a, b) === CompareResult.EQUAL;
    }

    /**
     * compare if smaller. a < b
     *
     * @param {*} a
     * @param {*} b
     * @returns {boolean}
     * @memberof Comparator
     */
    lessThan(a, b): boolean {
        return this.compare(a, b) === CompareResult.LESS;
    }

    /**
     * compare if greater. a > b
     *
     * @param {*} a
     * @param {*} b
     * @returns {boolean}
     * @memberof Comparator
     */
    greaterThan(a, b): boolean {
        return this.compare(a, b) === CompareResult.GREATER;
    }

    /**
     * compare if smaller or equal. a <= b
     *
     * @param {*} a
     * @param {*} b
     * @returns {boolean}
     * @memberof Comparator
     */
    lessThanOrEqual(a, b): boolean {
        return this.lessThan(a, b) || this.equal(a, b);
    }

    /**
     * compare if greater or equal. a >= b
     *
     * @param {*} a
     * @param {*} b
     * @returns {boolean}
     * @memberof Comparator
     */
    greaterThanOrEqual(a, b): boolean {
        return this.greaterThan(a, b) || this.equal(a, b);
    }

    /**
     * reverse the compare function
     *
     * @memberof Comparator
     */
    reverse(): void {
        const compareOriginal = this.compare;
        this.compare = (a, b) => compareOriginal(b, a);
    }
}
