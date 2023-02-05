pragma circom 2.1.2;

include "./helpers/RangeProof.circom";

component main {public [range]} = RangeProof(32);