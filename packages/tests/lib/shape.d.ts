declare global {
    namespace Chai {
        interface Assertion {
            shape(expected: any, message?: string): Assertion;
        }
        interface Ordered {
            shape(expected: any, message?: string): Assertion;
        }
        interface Eventually {
            shape(expected: any, message?: string): PromisedAssertion;
        }
        interface PromisedOrdered {
            shape(expected: any, message?: string): PromisedAssertion;
        }
    }
}
declare const _default: Chai.ChaiPlugin;
export default _default;
