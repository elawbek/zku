pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

template RangeProof(n) {
    assert(n <= 252);
    signal input in; // this is the number to be proved inside the range
    signal input range[2]; // the two elements should be the range, i.e. [lower bound, upper bound]
    signal output out;

    component le = LessEqThan(n);
    component ge = GreaterEqThan(n);

    ge.in[0] <== in;
    ge.in[1] <== range[0];

    le.in[0] <== in;
    le.in[1] <== range[1];

    out <== le.out * ge.out;
}
