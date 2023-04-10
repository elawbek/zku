pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib-matrix/circuits/matElemSum.circom";
include "./helpers/Multiplier2.circom";
include "./helpers/MultiplierN.circom";

template SystemOfEquations(n) { 
    // the solution
    signal input x[n];
    // the coefficient matrix
    signal input A[n][n];
    // the constants
    signal input b[n]; 
    signal output out; 

    /*
      for n = 3:
          [x[0] * A[0][0], x[1] * A[0][1], x[2] * A[0][2]]
          [x[0] * A[1][0], x[1] * A[1][1], x[2] * A[1][2]]
          [x[0] * A[2][0], x[1] * A[2][1], x[2] * A[2][2]]
    */
    component mul[n][n];
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
          mul[i][j] = Multiplier2();
          mul[i][j].a <== x[j];
          mul[i][j].b <== A[i][j];
        }
    }

    /*
      for n = 3:
          [x[0] * A[0][0] + x[1] * A[0][1] + x[2] * A[0][2] == b[0]]
          [x[0] * A[1][0] + x[1] * A[1][1] + x[2] * A[1][2] == b[1]]
          [x[0] * A[2][0] + x[1] * A[2][1] + x[2] * A[2][2] == b[2]]
    */
    component adder[n];
    component equals[n];
    component mulEnd = MultiplierN(n);
    for (var i = 0; i < n; i++) {
        adder[i] = matElemSum(1,n); 
        for (var j = 0; j < n; j++) {
            adder[i].a[0][j] <== mul[i][j].out;
        }   
        equals[i] = IsEqual();
        equals[i].in[0] <== b[i];
        equals[i].in[1] <== adder[i].out;
      
        mulEnd.in[i] <== equals[i].out;
    }

    out <== mulEnd.out;
}

component main {public [A, b]} = SystemOfEquations(3);