pragma circom 2.0.0;

include "./helpers/RangeProof.circom";

component main {public [range]} = RangeProof(32);