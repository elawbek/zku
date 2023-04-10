pragma circom 2.1.5;

include "./helpers/RangeProof.circom";

component main {public [range]} = RangeProof(32);